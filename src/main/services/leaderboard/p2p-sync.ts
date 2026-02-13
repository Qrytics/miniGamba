/**
 * P2P Synchronization Service
 * Handles peer-to-peer data sync for leaderboards
 * 
 * Note: This is a simplified implementation that uses local database storage
 * Full P2P implementation would require additional networking libraries
 */

import * as Database from '../data/database';

export interface Friend {
  id: number;
  userId: number;
  friendCode: string;
  username: string;
  addedAt: string;
  lastSeen?: string;
  stats?: FriendStats;
}

export interface FriendStats {
  level: number;
  coins: number;
  totalGames: number;
  winRate: number;
  achievements: number;
}

/**
 * Initialize P2P sync
 */
export function initP2PSync(): void {
  console.log('Initializing P2P sync...');
  ensureFriendsTable();
}

/**
 * Ensure friends table exists
 */
function ensureFriendsTable(): void {
  const db = Database.getDatabase();
  
  // Friends table is already created in database.ts
  // This is just a validation
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='friends'
  `).get();
  
  if (!tableExists) {
    console.warn('Friends table does not exist, creating...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        friend_code TEXT NOT NULL,
        username TEXT,
        added_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  }
}

/**
 * Add friend by friend code
 */
export async function addFriend(userId: number, friendCode: string, username?: string): Promise<boolean> {
  try {
    const db = Database.getDatabase();
    
    // Check if friend code is valid
    if (!friendCode || friendCode.length === 0) {
      console.error('Invalid friend code');
      return false;
    }
    
    // Check if already friends
    const existing = db.prepare('SELECT id FROM friends WHERE user_id = ? AND friend_code = ?')
      .get(userId, friendCode);
    
    if (existing) {
      console.log('Already friends with this user');
      return false;
    }
    
    // Add friend
    db.prepare(`
      INSERT INTO friends (user_id, friend_code, username, added_at)
      VALUES (?, ?, ?, ?)
    `).run(userId, friendCode, username || 'Unknown', new Date().toISOString());
    
    console.log('Friend added:', friendCode);
    return true;
  } catch (error) {
    console.error('Error adding friend:', error);
    return false;
  }
}

/**
 * Remove friend
 */
export function removeFriend(userId: number, friendId: number): boolean {
  try {
    const db = Database.getDatabase();
    
    db.prepare('DELETE FROM friends WHERE id = ? AND user_id = ?')
      .run(friendId, userId);
    
    console.log('Friend removed:', friendId);
    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    return false;
  }
}

/**
 * Get all friends for a user
 */
export function getFriends(userId: number): Friend[] {
  try {
    const db = Database.getDatabase();
    
    const friends = db.prepare(`
      SELECT id, user_id, friend_code, username, added_at
      FROM friends
      WHERE user_id = ?
      ORDER BY added_at DESC
    `).all(userId) as Friend[];
    
    return friends;
  } catch (error) {
    console.error('Error getting friends:', error);
    return [];
  }
}

/**
 * Get friend count
 */
export function getFriendCount(userId: number): number {
  try {
    const db = Database.getDatabase();
    const result = db.prepare('SELECT COUNT(*) as count FROM friends WHERE user_id = ?')
      .get(userId) as any;
    return result?.count || 0;
  } catch (error) {
    console.error('Error getting friend count:', error);
    return 0;
  }
}

/**
 * Get leaderboard data (top players by various metrics)
 */
export function getLeaderboard(category: string, limit: number = 10): any[] {
  try {
    const db = Database.getDatabase();
    
    let query = '';
    
    switch (category) {
      case 'coins':
        query = 'SELECT username, coins, level FROM users ORDER BY coins DESC LIMIT ?';
        break;
      case 'level':
        query = 'SELECT username, level, xp FROM users ORDER BY level DESC, xp DESC LIMIT ?';
        break;
      case 'games':
        query = `
          SELECT u.username, COUNT(gh.id) as games_played
          FROM users u
          LEFT JOIN game_history gh ON u.id = gh.user_id
          GROUP BY u.id
          ORDER BY games_played DESC
          LIMIT ?
        `;
        break;
      case 'achievements':
        query = `
          SELECT u.username, COUNT(ua.id) as achievements_count
          FROM users u
          LEFT JOIN user_achievements ua ON u.id = ua.user_id
          GROUP BY u.id
          ORDER BY achievements_count DESC
          LIMIT ?
        `;
        break;
      default:
        query = 'SELECT username, coins, level FROM users ORDER BY coins DESC LIMIT ?';
    }
    
    return db.prepare(query).all(limit);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

/**
 * Sync data with friends (placeholder for future P2P implementation)
 */
export function syncData(): void {
  console.log('P2P sync is simplified - using local database');
  // Future: Implement actual P2P data synchronization
  // This would involve:
  // 1. Establishing P2P connections
  // 2. Exchanging encrypted data
  // 3. Updating local leaderboards
}

/**
 * Get friend leaderboard (friends only)
 */
export function getFriendLeaderboard(userId: number, category: string): any[] {
  try {
    const db = Database.getDatabase();
    const friends = getFriends(userId);
    
    if (friends.length === 0) {
      return [];
    }
    
    // For now, return empty since we can't get stats from friend codes alone
    // Full implementation would sync friend data via P2P
    console.log('Friend leaderboard for', category);
    return [];
  } catch (error) {
    console.error('Error getting friend leaderboard:', error);
    return [];
  }
}
