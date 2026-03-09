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
   * Import user data from a previously exported JSON backup.
   *
   * Only the safe, user-controlled fields are restored — system fields like
   * `id` and `created_at` are ignored so the import cannot corrupt primary
   * keys or foreign-key relationships.
   */
  public importUserData(data: unknown): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid import data: expected a JSON object');
    }

    const obj = data as Record<string, unknown>;

    const db = databaseService.getDb();

    db.transaction(() => {
      // ── Restore username ──────────────────────────────────────────────
      const user = obj['user'];
      if (user && typeof user === 'object') {
        const u = user as Record<string, unknown>;
        const updates: Partial<import('../../../shared/types/user.types').User> = {};

        if (typeof u['username'] === 'string' && u['username'].trim().length > 0) {
          updates.username = u['username'].trim().slice(0, 64);
        }
        if (typeof u['prestigeLevel'] === 'number' && u['prestigeLevel'] >= 0) {
          updates.prestigeLevel = Math.floor(u['prestigeLevel']);
        }

        if (Object.keys(updates).length > 0) {
          this.updateUser(updates);
        }
      }

      // ── Restore profile (avatar, border, title only) ──────────────────
      const profile = obj['profile'];
      if (profile && typeof profile === 'object') {
        const p = profile as Record<string, unknown>;
        const currentUser = this.getUser();
        const profileUpdates: Partial<import('../../../shared/types/user.types').UserProfile> = {};

        if (typeof p['avatar'] === 'string') profileUpdates.avatar = p['avatar'];
        if (typeof p['border'] === 'string') profileUpdates.border = p['border'];
        if (typeof p['title'] === 'string') profileUpdates.title = p['title'];

        if (Object.keys(profileUpdates).length > 0) {
          this.updateUserProfile(currentUser.id, profileUpdates);
        }
      }

      // ── Restore settings ──────────────────────────────────────────────
      const settings = obj['settings'];
      if (settings && typeof settings === 'object') {
        const currentUser = this.getUser();
        // Merge with defaults so any missing keys are filled in safely.
        const defaults = this.getDefaultSettings();
        const merged = this.deepMerge(defaults, settings as Record<string, unknown>);
        this.updateUserSettings(currentUser.id, merged);
      }

      // ── Restore achievements ──────────────────────────────────────────
      const achievements = obj['achievements'];
      if (Array.isArray(achievements)) {
        const currentUser = this.getUser();
        for (const ach of achievements) {
          if (ach && typeof ach === 'object') {
            const a = ach as Record<string, unknown>;
            if (typeof a['achievement_id'] === 'string') {
              db.prepare(`
                INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at)
                VALUES (?, ?, ?)
              `).run(
                currentUser.id,
                a['achievement_id'],
                typeof a['unlocked_at'] === 'string' ? a['unlocked_at'] : new Date().toISOString()
              );
            }
          }
        }
      }
    })();
  }

  /**
   * Recursively merge `override` into `base` without replacing missing keys
   * in `base` with unexpected values from the import.
   */
  private deepMerge(
    base: Record<string, unknown>,
    override: Record<string, unknown>
  ): import('../../../shared/types/user.types').UserSettings {
    const result: Record<string, unknown> = { ...base };

    for (const key of Object.keys(base)) {
      if (Object.prototype.hasOwnProperty.call(override, key)) {
        const baseVal = base[key];
        const overrideVal = override[key];
        if (
          baseVal !== null &&
          typeof baseVal === 'object' &&
          overrideVal !== null &&
          typeof overrideVal === 'object' &&
          !Array.isArray(baseVal)
        ) {
          result[key] = this.deepMerge(
            baseVal as Record<string, unknown>,
            overrideVal as Record<string, unknown>
          );
        } else if (typeof baseVal === typeof overrideVal) {
          result[key] = overrideVal;
        }
        // If types differ, keep the base (safe default).
      }
    }

    return result as import('../../../shared/types/user.types').UserSettings;
  }
}

export const userDataService = new UserDataService();
