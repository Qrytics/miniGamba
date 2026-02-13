/**
 * Achievement Service
 * Handles achievement tracking, checking, and unlocking
 */

import { databaseService } from './database';
import { achievements, AchievementId } from '../../../shared/constants/achievements';
import { gameHistoryService } from './game-history';
import { userDataService } from './user-data';

export interface UnlockedAchievement {
  achievementId: AchievementId;
  unlockedAt: Date;
}

export class AchievementService {
  /**
   * Check if user has unlocked an achievement
   */
  public hasAchievement(userId: number, achievementId: AchievementId): boolean {
    const db = databaseService.getDb();
    const result = db.prepare(`
      SELECT 1 FROM user_achievements 
      WHERE user_id = ? AND achievement_id = ?
    `).get(userId, achievementId);

    return !!result;
  }

  /**
   * Unlock an achievement for a user
   */
  public unlockAchievement(userId: number, achievementId: AchievementId): boolean {
    if (this.hasAchievement(userId, achievementId)) {
      return false; // Already unlocked
    }

    const db = databaseService.getDb();
    db.prepare(`
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (?, ?)
    `).run(userId, achievementId);

    const achievement = achievements[achievementId];
    if (achievement) {
      // Award achievement points as XP
      userDataService.addXP(userId, achievement.points);
    }

    return true;
  }

  /**
   * Get all unlocked achievements for a user
   */
  public getUnlockedAchievements(userId: number): UnlockedAchievement[] {
    const db = databaseService.getDb();
    const results = db.prepare(`
      SELECT achievement_id, unlocked_at 
      FROM user_achievements 
      WHERE user_id = ?
      ORDER BY unlocked_at DESC
    `).all(userId) as any[];

    return results.map(row => ({
      achievementId: row.achievement_id as AchievementId,
      unlockedAt: new Date(row.unlocked_at)
    }));
  }

  /**
   * Get achievement progress (for tracking achievements)
   */
  public getAchievementProgress(userId: number): any {
    const user = userDataService.getUser();
    const overallStats = gameHistoryService.getGameStats(userId);
    
    // This would return progress for all achievements
    // For now, return basic data
    return {
      totalGamesPlayed: user.totalGamesPlayed,
      totalCoinsEarned: user.totalCoinsEarned,
      currentCoins: user.coins,
      totalWins: (overallStats as any).wins,
      // Add more tracking data as needed
    };
  }

  /**
   * Check and unlock achievements based on recent activity
   * This should be called after significant events
   */
  public checkAchievements(userId: number, event: {
    type: 'game_played' | 'coin_earned' | 'level_up' | 'streak' | 'investment' | 'custom';
    data?: any;
  }): AchievementId[] {
    const unlockedAchievements: AchievementId[] = [];
    
    const user = userDataService.getUser();

    // Check gambling achievements
    if (event.type === 'game_played') {
      // First game ever
      if (user.totalGamesPlayed === 1 && this.tryUnlock(userId, 'first-spin')) {
        unlockedAchievements.push('first-spin');
      }

      // Milestone achievements
      if (user.totalGamesPlayed === 1000 && this.tryUnlock(userId, 'the-gambler')) {
        unlockedAchievements.push('the-gambler');
      }
      if (user.totalGamesPlayed === 10000 && this.tryUnlock(userId, 'no-life')) {
        unlockedAchievements.push('no-life');
      }

      // Game-specific achievements would be checked here
      // This is just a framework - full implementation would check all 90+ achievements
    }

    // Check economy achievements
    if (event.type === 'coin_earned') {
      if (user.totalCoinsEarned >= 100 && this.tryUnlock(userId, 'pocket-change')) {
        unlockedAchievements.push('pocket-change');
      }
      if (user.totalCoinsEarned >= 1000 && this.tryUnlock(userId, 'stacking-up')) {
        unlockedAchievements.push('stacking-up');
      }
      if (user.totalCoinsEarned >= 10000 && this.tryUnlock(userId, 'fat-stacks')) {
        unlockedAchievements.push('fat-stacks');
      }
      if (user.totalCoinsEarned >= 100000 && this.tryUnlock(userId, 'trust-fund-baby')) {
        unlockedAchievements.push('trust-fund-baby');
      }
      if (user.totalCoinsEarned >= 1000000 && this.tryUnlock(userId, 'mini-mogul')) {
        unlockedAchievements.push('mini-mogul');
      }

      // Check if user reached 0 coins (bankrupt)
      if (user.coins === 0 && this.tryUnlock(userId, 'bankrupt')) {
        unlockedAchievements.push('bankrupt');
      }
    }

    return unlockedAchievements;
  }

  /**
   * Try to unlock an achievement if not already unlocked
   */
  private tryUnlock(userId: number, achievementId: AchievementId): boolean {
    if (this.hasAchievement(userId, achievementId)) {
      return false;
    }
    return this.unlockAchievement(userId, achievementId);
  }

  /**
   * Get total achievement points for a user
   */
  public getTotalAchievementPoints(userId: number): number {
    const unlocked = this.getUnlockedAchievements(userId);
    let total = 0;

    for (const achievement of unlocked) {
      const achievementData = achievements[achievement.achievementId];
      if (achievementData) {
        total += achievementData.points;
      }
    }

    return total;
  }

  /**
   * Get achievement completion percentage
   */
  public getCompletionPercentage(userId: number): number {
    const totalAchievements = Object.keys(achievements).length;
    const unlocked = this.getUnlockedAchievements(userId).length;
    
    return (unlocked / totalAchievements) * 100;
  }
}

export const achievementService = new AchievementService();
