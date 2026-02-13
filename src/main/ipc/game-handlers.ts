/**
 * IPC handlers for game-related operations
 * Handles communication between renderer and main process for games
 */

import { ipcMain } from 'electron';
import { userDataService } from '../services/data/user-data';
import { gameHistoryService } from '../services/data/game-history';
import { achievementService } from '../services/data/achievement-service';
import { GameType, GameResult } from '../../shared/types/game.types';

// Register all game-related IPC handlers
ipcMain.handle('game:start', async (event, gameType: GameType, bet: number) => {
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
    
    return { success: true, currentCoins: user.coins - bet };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('game:end', async (event, gameType: GameType, resultData: any) => {
  try {
    const user = userDataService.getUser();
    
    // Extract bet and payout from result data
    // The bet should be stored when startGame is called, but we need to get it from resultData
    // Check multiple possible locations for bet
    let bet = resultData.bet;
    if (!bet && resultData.state && resultData.state.bet) {
      bet = resultData.state.bet;
    }
    if (!bet && typeof resultData.payout === 'number' && resultData.payout > 0) {
      // If payout exists, bet was likely the original bet amount
      // For coin flip: payout is bet * 2 if win, 0 if loss
      // So if payout > 0, bet is likely payout / 2
      bet = Math.floor(resultData.payout / 2);
    }
    if (!bet || bet <= 0) {
      // Fallback: use a default bet amount based on game type
      bet = 10; // Default minimum bet
    }
    
    const payout = resultData.payout || 0;
    
    // Determine result: check resultData first, then infer from payout
    let result: GameResult = 'loss';
    if (resultData.result) {
      result = resultData.result;
    } else if (resultData.win === true || (typeof resultData.win === 'boolean' && resultData.win)) {
      result = 'win';
    } else if (resultData.win === false) {
      result = 'loss';
    } else if (payout > bet) {
      result = 'win';
    } else if (payout === bet) {
      result = 'push';
    } else {
      result = 'loss';
    }
    
    const details = resultData;
    
    // Award payout
    if (payout > 0) {
      userDataService.addCoins(user.id, payout);
    }
    
    // Record game in history
    gameHistoryService.recordGame(user.id, gameType, bet, result, payout, details);
    
    // Award XP
    const xpGained = Math.floor(bet / 10); // 1 XP per 10 coins bet
    const levelUpResult = userDataService.addXP(user.id, xpGained);
    
    // Check achievements
    const unlockedAchievements = achievementService.checkAchievements(user.id, {
      type: 'game_played',
      data: { gameType, result, payout, bet }
    });
    
    const updatedUser = userDataService.getUser();
    
    return { 
      success: true, 
      payout,
      currentCoins: updatedUser.coins,
      xpGained,
      leveledUp: levelUpResult.leveledUp,
      newLevel: levelUpResult.newLevel,
      unlockedAchievements
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('game:getStats', async (event, gameType?: GameType) => {
  try {
    const user = userDataService.getUser();
    const stats = gameHistoryService.getGameStats(user.id, gameType);
    return { success: true, stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('game:getHistory', async (event, options?: any) => {
  try {
    const user = userDataService.getUser();
    const history = gameHistoryService.getGameHistory(user.id, options);
    return { success: true, history };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
