/**
 * Game History Service
 * Tracks and retrieves game history and statistics
 */

import { databaseService } from './database';
import { GameType, GameResult, GameStats } from '../../../shared/types/game.types';

export interface GameHistoryEntry {
  id: number;
  userId: number;
  gameType: GameType;
  betAmount: number;
  result: GameResult;
  payout: number;
  details: any;
  playedAt: Date;
}

export class GameHistoryService {
  /**
   * Record a game result
   */
  public recordGame(
    userId: number,
    gameType: GameType,
    betAmount: number,
    result: GameResult,
    payout: number,
    details?: any
  ): void {
    const db = databaseService.getDb();

    // Insert into game history
    db.prepare(`
      INSERT INTO game_history 
      (user_id, game_type, bet_amount, result, payout, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, gameType, betAmount, result, payout, JSON.stringify(details || {}));

    // Update game stats
    this.updateGameStats(userId, gameType, betAmount, result, payout);

    // Update user total games played
    db.prepare('UPDATE users SET total_games_played = total_games_played + 1 WHERE id = ?')
      .run(userId);
  }

  /**
   * Update game statistics
   */
  private updateGameStats(
    userId: number,
    gameType: GameType,
    betAmount: number,
    result: GameResult,
    payout: number
  ): void {
    const db = databaseService.getDb();

    // Get current stats
    const currentStats = db.prepare(`
      SELECT * FROM game_stats WHERE user_id = ? AND game_type = ?
    `).get(userId, gameType) as any;

    if (!currentStats) {
      // Create initial stats for first game of this type
      const isWin = result === 'win';
      const profit = payout - betAmount;
      
      db.prepare(`
        INSERT INTO game_stats 
        (user_id, game_type, total_games, wins, losses, total_wagered, total_won, biggest_win, biggest_loss, current_streak, best_streak)
        VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId, gameType,
        isWin ? 1 : 0,          // wins: 1 if win, 0 if loss
        isWin ? 0 : 1,          // losses: 0 if win, 1 if loss
        betAmount,              // total wagered
        payout,                 // total won (includes returned bet on win)
        isWin ? profit : 0,     // biggest win (profit, not payout)
        isWin ? 0 : betAmount,  // biggest loss (bet amount on loss)
        isWin ? 1 : 0,          // current streak
        isWin ? 1 : 0           // best streak
      );
    } else {
      // Update existing stats
      const isWin = result === 'win';
      const profit = payout - betAmount;
      
      let newStreak = isWin ? currentStats.current_streak + 1 : 0;
      const newBestStreak = Math.max(newStreak, currentStats.best_streak);
      const newBiggestWin = Math.max(profit, currentStats.biggest_win);
      const newBiggestLoss = Math.min(profit, currentStats.biggest_loss);

      db.prepare(`
        UPDATE game_stats SET
          total_games = total_games + 1,
          wins = wins + ?,
          losses = losses + ?,
          total_wagered = total_wagered + ?,
          total_won = total_won + ?,
          biggest_win = ?,
          biggest_loss = ?,
          current_streak = ?,
          best_streak = ?
        WHERE user_id = ? AND game_type = ?
      `).run(
        isWin ? 1 : 0,
        isWin ? 0 : 1,
        betAmount,
        payout,
        newBiggestWin,
        newBiggestLoss,
        newStreak,
        newBestStreak,
        userId,
        gameType
      );
    }
  }

  /**
   * Get game statistics for a user and game type
   */
  public getGameStats(userId: number, gameType?: GameType): GameStats | GameStats[] {
    const db = databaseService.getDb();

    if (gameType) {
      const stats = db.prepare(`
        SELECT * FROM game_stats WHERE user_id = ? AND game_type = ?
      `).get(userId, gameType) as any;

      if (!stats) {
        return this.getEmptyStats();
      }

      return this.mapStatsFromDb(stats);
    } else {
      // Get overall stats across all games
      const allStats = db.prepare(`
        SELECT 
          SUM(total_games) as total_games,
          SUM(wins) as wins,
          SUM(losses) as losses,
          SUM(total_wagered) as total_wagered,
          SUM(total_won) as total_won,
          MAX(biggest_win) as biggest_win,
          MIN(biggest_loss) as biggest_loss,
          MAX(current_streak) as current_streak,
          MAX(best_streak) as best_streak
        FROM game_stats WHERE user_id = ?
      `).get(userId) as any;

      if (!allStats || allStats.total_games === null) {
        return this.getEmptyStats();
      }

      const winRate = allStats.total_games > 0 
        ? (allStats.wins / allStats.total_games) * 100 
        : 0;
      
      return {
        totalGames: allStats.total_games || 0,
        wins: allStats.wins || 0,
        losses: allStats.losses || 0,
        winRate,
        totalWagered: allStats.total_wagered || 0,
        totalWon: allStats.total_won || 0,
        netProfit: (allStats.total_won || 0) - (allStats.total_wagered || 0),
        biggestWin: allStats.biggest_win || 0,
        biggestLoss: allStats.biggest_loss || 0,
        currentStreak: allStats.current_streak || 0,
        bestStreak: allStats.best_streak || 0
      };
    }
  }

  /**
   * Get game history
   */
  public getGameHistory(
    userId: number,
    options?: {
      gameType?: GameType;
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ): GameHistoryEntry[] {
    const db = databaseService.getDb();
    
    let query = 'SELECT * FROM game_history WHERE user_id = ?';
    const params: any[] = [userId];

    if (options?.gameType) {
      query += ' AND game_type = ?';
      params.push(options.gameType);
    }

    if (options?.startDate) {
      query += ' AND played_at >= ?';
      params.push(options.startDate.toISOString());
    }

    if (options?.endDate) {
      query += ' AND played_at <= ?';
      params.push(options.endDate.toISOString());
    }

    query += ' ORDER BY played_at DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options?.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    const results = db.prepare(query).all(...params) as any[];

    return results.map(row => ({
      id: row.id,
      userId: row.user_id,
      gameType: row.game_type as GameType,
      betAmount: row.bet_amount,
      result: row.result as GameResult,
      payout: row.payout,
      details: JSON.parse(row.details || '{}'),
      playedAt: new Date(row.played_at)
    }));
  }

  /**
   * Get empty stats object
   */
  private getEmptyStats(): GameStats {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalWagered: 0,
      totalWon: 0,
      netProfit: 0,
      biggestWin: 0,
      biggestLoss: 0,
      currentStreak: 0,
      bestStreak: 0
    };
  }

  /**
   * Map database stats to GameStats
   */
  private mapStatsFromDb(row: any): GameStats {
    const winRate = row.total_games > 0 
      ? (row.wins / row.total_games) * 100 
      : 0;

    return {
      totalGames: row.total_games,
      wins: row.wins,
      losses: row.losses,
      winRate,
      totalWagered: row.total_wagered,
      totalWon: row.total_won,
      netProfit: row.total_won - row.total_wagered,
      biggestWin: row.biggest_win,
      biggestLoss: row.biggest_loss,
      currentStreak: row.current_streak,
      bestStreak: row.best_streak
    };
  }
}

export const gameHistoryService = new GameHistoryService();
