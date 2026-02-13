/**
 * Database service using better-sqlite3 for SQLite
 * Handles all database operations for miniGamba
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';
import { User, UserProfile } from '../../../shared/types/user.types';

export class DatabaseService {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'minigamba.db');
  }

  /**
   * Initialize database connection and create tables
   */
  public initialize(): void {
    this.db = new Database(this.dbPath);
    this.createTables();
    console.log('Database initialized at:', this.dbPath);
  }

  /**
   * Create all required database tables
   */
  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        coins INTEGER DEFAULT 1000,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        total_coins_earned INTEGER DEFAULT 1000,
        total_games_played INTEGER DEFAULT 0,
        prestige_level INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User Profile table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id INTEGER PRIMARY KEY,
        friend_code TEXT UNIQUE NOT NULL,
        avatar TEXT DEFAULT 'default',
        border TEXT DEFAULT 'bronze',
        title TEXT DEFAULT 'Newbie',
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Game History table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        game_type TEXT NOT NULL,
        bet_amount INTEGER NOT NULL,
        result TEXT NOT NULL,
        payout INTEGER NOT NULL,
        details TEXT,
        played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Game Stats table (per game type)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_stats (
        user_id INTEGER NOT NULL,
        game_type TEXT NOT NULL,
        total_games INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        total_wagered INTEGER DEFAULT 0,
        total_won INTEGER DEFAULT 0,
        biggest_win INTEGER DEFAULT 0,
        biggest_loss INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        PRIMARY KEY (user_id, game_type),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Achievements table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        user_id INTEGER NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, achievement_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Daily Tasks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS daily_tasks (
        user_id INTEGER NOT NULL,
        task_id TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        progress INTEGER DEFAULT 0,
        date DATE NOT NULL,
        PRIMARY KEY (user_id, task_id, date),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Investments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        maturity_date DATETIME NOT NULL,
        collected BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Cosmetics Owned table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cosmetics_owned (
        user_id INTEGER NOT NULL,
        cosmetic_type TEXT NOT NULL,
        cosmetic_id TEXT NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, cosmetic_type, cosmetic_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Friends table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS friends (
        user_id INTEGER NOT NULL,
        friend_code TEXT NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, friend_code),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Hourly Bonus table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS hourly_bonus (
        user_id INTEGER PRIMARY KEY,
        last_claimed DATETIME,
        unclaimed_hours INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Activity Tracking table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS activity_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        coins_earned INTEGER NOT NULL,
        tracked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        user_id INTEGER PRIMARY KEY,
        settings_json TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('Database tables created successfully');
  }

  /**
   * Get or create the default user
   */
  public getOrCreateUser(): User {
    if (!this.db) throw new Error('Database not initialized');

    let user = this.db.prepare('SELECT * FROM users WHERE id = 1').get() as any;

    if (!user) {
      // Create default user
      const insert = this.db.prepare(`
        INSERT INTO users (username, coins, total_coins_earned) 
        VALUES (?, ?, ?)
      `);
      insert.run('Player', 1000, 1000);
      
      // Create default profile with friend code
      const friendCode = this.generateFriendCode();
      this.db.prepare(`
        INSERT INTO user_profiles (user_id, friend_code) 
        VALUES (?, ?)
      `).run(1, friendCode);

      user = this.db.prepare('SELECT * FROM users WHERE id = 1').get() as any;
    }

    return this.mapUserFromDb(user);
  }

  /**
   * Update user data
   */
  public updateUser(userId: number, updates: Partial<User>): void {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.username !== undefined) {
      fields.push('username = ?');
      values.push(updates.username);
    }
    if (updates.coins !== undefined) {
      fields.push('coins = ?');
      values.push(updates.coins);
    }
    if (updates.level !== undefined) {
      fields.push('level = ?');
      values.push(updates.level);
    }
    if (updates.xp !== undefined) {
      fields.push('xp = ?');
      values.push(updates.xp);
    }
    if (updates.totalCoinsEarned !== undefined) {
      fields.push('total_coins_earned = ?');
      values.push(updates.totalCoinsEarned);
    }
    if (updates.totalGamesPlayed !== undefined) {
      fields.push('total_games_played = ?');
      values.push(updates.totalGamesPlayed);
    }
    if (updates.prestigeLevel !== undefined) {
      fields.push('prestige_level = ?');
      values.push(updates.prestigeLevel);
    }

    if (fields.length > 0) {
      values.push(userId);
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      this.db.prepare(sql).run(...values);
    }
  }

  /**
   * Add coins to user balance
   */
  public addCoins(userId: number, amount: number, earnedCoins: boolean = true): void {
    if (!this.db) throw new Error('Database not initialized');

    const user = this.db.prepare('SELECT coins, total_coins_earned FROM users WHERE id = ?').get(userId) as any;
    const newCoins = user.coins + amount;
    const newTotalEarned = earnedCoins ? user.total_coins_earned + amount : user.total_coins_earned;

    this.db.prepare('UPDATE users SET coins = ?, total_coins_earned = ? WHERE id = ?')
      .run(newCoins, newTotalEarned, userId);
  }

  /**
   * Generate a unique friend code
   */
  private generateFriendCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters
    let code = 'GAMBA-';
    
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
  }

  /**
   * Map database row to User object
   */
  private mapUserFromDb(row: any): User {
    return {
      id: row.id,
      username: row.username,
      coins: row.coins,
      level: row.level,
      xp: row.xp,
      totalCoinsEarned: row.total_coins_earned,
      totalGamesPlayed: row.total_games_played,
      prestigeLevel: row.prestige_level,
      createdAt: new Date(row.created_at)
    };
  }

  /**
   * Close database connection
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Get database instance for direct queries
   */
  public getDb(): Database.Database {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }
}

export const databaseService = new DatabaseService();
