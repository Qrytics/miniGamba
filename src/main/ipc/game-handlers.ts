/**
 * IPC handlers for game-related operations
 * Handles communication between renderer and main process for games
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { userDataService } from '../services/data/user-data';
import { gameHistoryService } from '../services/data/game-history';
import { achievementService } from '../services/data/achievement-service';
import { databaseService } from '../services/data/database';
import { GameType, GameResult } from '../../shared/types/game.types';
import { generateUUID } from '../utils/crypto';

// Module-scope Map to track active bets by sessionId
interface ActiveBet {
  gameType: GameType;
  bet: number;
}
const activeBets = new Map<string, ActiveBet>();

// Register all game-related IPC handlers
ipcMain.handle('game:start', async (_event: IpcMainInvokeEvent, gameType: GameType, bet: number) => {
  try {
    // Validate gameType
    const validGameTypes: GameType[] = [
      'slot-machine', 'blackjack', 'coin-flip', 'higher-or-lower', 'mine-sweeper',
      'scratch-cards', 'wheel-of-fortune', 'mini-derby', 'dice-roll', 'mini-poker'
    ];
    
    if (!validGameTypes.includes(gameType)) {
      return { success: false, error: 'Invalid game type' };
    }
    
    const user = userDataService.getUser();
    
    // Validate bet amount
    if (bet <= 0) {
      return { success: false, error: 'Invalid bet amount' };
    }
    
    if (user.coins < bet) {
      return { success: false, error: 'Insufficient coins' };
    }
    
    // Deduct bet from user coins
    const removed = userDataService.removeCoins(user.id, bet);
    
    if (!removed) {
      return { success: false, error: 'Failed to deduct coins' };
    }
    
    // Generate sessionId and store bet
    const sessionId = generateUUID();
    activeBets.set(sessionId, { gameType, bet });
    
    return { success: true, currentCoins: user.coins - bet, sessionId };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('game:end', async (_event: IpcMainInvokeEvent, gameType: GameType, resultData: Record<string, unknown>) => {
  try {
    const user = userDataService.getUser();
    
    // Reconcile this result against the session started via game:start.
    // This ensures we always use the server-side deducted bet when available.
    const payloadBet = typeof resultData['bet'] === 'number' ? resultData['bet'] : 0;
    let bet = payloadBet;
    const sessionId = typeof resultData['sessionId'] === 'string' ? resultData['sessionId'] : null;
    
    if (sessionId) {
      const activeBet = activeBets.get(sessionId);
      if (!activeBet) {
        return { success: false, error: 'Invalid or expired game session' };
      }

      if (activeBet.gameType !== gameType) {
        activeBets.delete(sessionId);
        return { success: false, error: 'Game type does not match active session' };
      }

      bet = activeBet.bet;
      activeBets.delete(sessionId);
    }
    
    if (!bet || bet <= 0) {
      return { success: false, error: 'Missing valid bet amount for game result' };
    }
    
    const payout = typeof resultData['payout'] === 'number' ? resultData['payout'] : 0;
    if (payout < 0) {
      return { success: false, error: 'Invalid payout amount' };
    }
    
    // Determine result: check resultData first, then infer from payout
    let result: GameResult = 'loss';
    if (resultData['result'] === 'win' || resultData['result'] === 'loss' || resultData['result'] === 'push') {
      result = resultData['result'] as GameResult;
    } else if (resultData['win'] === true) {
      result = 'win';
    } else if (resultData['win'] === false) {
      result = 'loss';
    } else if (payout > bet) {
      result = 'win';
    } else if (payout === bet) {
      result = 'push';
    }
    
    // Wrap all post-game operations in a single SQLite transaction so the
    // database stays consistent even if the process is killed mid-operation.
    const db = databaseService.getDb();
    const xpGained = Math.floor(bet / 10); // 1 XP per 10 coins bet

    let leveledUp = false;
    let newLevel: number | undefined;
    let unlockedAchievements: string[] = [];

    db.transaction(() => {
      // Award payout
      if (payout > 0) {
        userDataService.addCoins(user.id, payout);
      }

      // Record game in history
      gameHistoryService.recordGame(user.id, gameType, bet, result, payout, resultData);

      // Award XP
      const levelUpResult = userDataService.addXP(user.id, xpGained);
      leveledUp = levelUpResult.leveledUp;
      newLevel = levelUpResult.newLevel;
    })();

    // Achievement checking is done outside the transaction since it involves
    // multiple reads and writes that are each individually atomic.
    unlockedAchievements = achievementService.checkAchievements(user.id, {
      type: 'game_played',
      data: { gameType, result, payout, bet }
    });
    
    const updatedUser = userDataService.getUser();
    
    return { 
      success: true, 
      payout,
      currentCoins: updatedUser.coins,
      xpGained,
      leveledUp,
      newLevel,
      unlockedAchievements
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('game:getStats', async (_event: IpcMainInvokeEvent, gameType?: GameType) => {
  try {
    const user = userDataService.getUser();
    const stats = gameHistoryService.getGameStats(user.id, gameType);
    return { success: true, stats };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('game:getHistory', async (_event: IpcMainInvokeEvent, options?: Record<string, unknown>) => {
  try {
    const user = userDataService.getUser();
    const history = gameHistoryService.getGameHistory(user.id, options);
    return { success: true, history };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});
