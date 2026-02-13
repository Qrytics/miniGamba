/**
 * User Data Service
 * Handles all user-related data operations
 */

import { databaseService } from './database';
import { User, UserProfile, UserSettings } from '../../../shared/types/user.types';

export class UserDataService {
  /**
   * Get current user
   */
  public getUser(): User {
    return databaseService.getOrCreateUser();
  }

  /**
   * Update user
   */
  public updateUser(updates: Partial<User>): void {
    const user = this.getUser();
    databaseService.updateUser(user.id, updates);
  }

  /**
   * Get user profile
   */
  public getUserProfile(userId: number): UserProfile {
    const db = databaseService.getDb();
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId) as any;
    
    if (!profile) {
      throw new Error('User profile not found');
    }

    return {
      avatar: profile.avatar,
      border: profile.border,
      title: profile.title,
      friendCode: profile.friend_code
    };
  }

  /**
   * Update user profile
   */
  public updateUserProfile(userId: number, updates: Partial<UserProfile>): void {
    const db = databaseService.getDb();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.avatar) {
      fields.push('avatar = ?');
      values.push(updates.avatar);
    }
    if (updates.border) {
      fields.push('border = ?');
      values.push(updates.border);
    }
    if (updates.title) {
      fields.push('title = ?');
      values.push(updates.title);
    }

    if (fields.length > 0) {
      values.push(userId);
      const sql = `UPDATE user_profiles SET ${fields.join(', ')} WHERE user_id = ?`;
      db.prepare(sql).run(...values);
    }
  }

  /**
   * Get user settings
   */
  public getUserSettings(userId: number): UserSettings {
    const db = databaseService.getDb();
    const row = db.prepare('SELECT settings_json FROM settings WHERE user_id = ?').get(userId) as any;

    if (row) {
      return JSON.parse(row.settings_json);
    }

    // Return default settings
    return this.getDefaultSettings();
  }

  /**
   * Update user settings
   */
  public updateUserSettings(userId: number, settings: UserSettings): void {
    const db = databaseService.getDb();
    const settingsJson = JSON.stringify(settings);

    db.prepare(`
      INSERT INTO settings (user_id, settings_json) 
      VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET settings_json = ?
    `).run(userId, settingsJson, settingsJson);
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): UserSettings {
    return {
      general: {
        launchOnStartup: false,
        startInOverlayMode: false,
        enableNotifications: true,
        notifyFriendActivity: true,
        notifyDailyReset: true,
        notifyHourlyBonus: true
      },
      overlay: {
        opacity: 0.9,
        size: 'medium',
        positionLocked: false,
        autoHideWhenNotInGame: false,
        displayMode: 'expanded',
        clickThroughMode: false
      },
      hotkeys: {
        toggleOverlay: 'CommandOrControl+Shift+G',
        quickSpin: 'CommandOrControl+Space'
      },
      audio: {
        masterVolume: 70,
        uiVolume: 80,
        gameVolume: 100,
        musicVolume: 50,
        muteWhenInactive: false
      },
      privacy: {
        shareStatsWithFriends: true,
        showOnLeaderboard: true,
        allowFriendRequests: true
      }
    };
  }

  /**
   * Add coins to user
   */
  public addCoins(userId: number, amount: number, earned: boolean = true): void {
    databaseService.addCoins(userId, amount, earned);
  }

  /**
   * Remove coins from user
   */
  public removeCoins(userId: number, amount: number): boolean {
    const user = this.getUser();
    if (user.coins < amount) {
      return false; // Not enough coins
    }
    
    databaseService.addCoins(userId, -amount, false);
    return true;
  }

  /**
   * Add XP to user and handle level ups
   */
  public addXP(userId: number, xp: number): { leveledUp: boolean; newLevel?: number } {
    const user = this.getUser();
    const newXP = user.xp + xp;
    const xpForNextLevel = this.getXPForLevel(user.level + 1);

    if (newXP >= xpForNextLevel) {
      // Level up!
      const newLevel = user.level + 1;
      const remainingXP = newXP - xpForNextLevel;
      
      databaseService.updateUser(userId, {
        level: newLevel,
        xp: remainingXP
      });

      return { leveledUp: true, newLevel };
    } else {
      databaseService.updateUser(userId, { xp: newXP });
      return { leveledUp: false };
    }
  }

  /**
   * Calculate XP required for a level
   */
  private getXPForLevel(level: number): number {
    // Exponential curve: level^2 * 100
    return level * level * 100;
  }

  /**
   * Export user data to JSON
   */
  public exportUserData(userId: number): any {
    const db = databaseService.getDb();
    
    const user = this.getUser();
    const profile = this.getUserProfile(userId);
    const settings = this.getUserSettings(userId);
    
    const gameHistory = db.prepare('SELECT * FROM game_history WHERE user_id = ?').all(userId);
    const achievements = db.prepare('SELECT * FROM user_achievements WHERE user_id = ?').all(userId);
    const cosmetics = db.prepare('SELECT * FROM cosmetics_owned WHERE user_id = ?').all(userId);
    const friends = db.prepare('SELECT * FROM friends WHERE user_id = ?').all(userId);

    return {
      user,
      profile,
      settings,
      gameHistory,
      achievements,
      cosmetics,
      friends,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import user data from JSON
   */
  public importUserData(data: any): void {
    // This would restore user data from backup
    // Implementation would involve careful validation and database inserts
    console.warn('Import user data not fully implemented yet');
  }
}

export const userDataService = new UserDataService();
