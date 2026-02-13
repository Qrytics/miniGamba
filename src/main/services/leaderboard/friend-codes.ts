/**
 * Friend Code System
 * Manages friend codes for P2P connections
 */

import { generateFriendCode } from '../../utils/crypto';
import * as Database from '../data/database';

let localFriendCode: string | null = null;

/**
 * Generate or retrieve local friend code
 */
export function getLocalFriendCode(userId: number): string {
  if (!localFriendCode) {
    const db = Database.getDatabase();
    const user = db.prepare('SELECT friend_code FROM users WHERE id = ?').get(userId) as any;
    
    if (user && user.friend_code) {
      localFriendCode = user.friend_code;
    } else {
      // Generate new friend code
      localFriendCode = generateFriendCode();
      
      // Save to database
      db.prepare('UPDATE users SET friend_code = ? WHERE id = ?').run(localFriendCode, userId);
    }
  }
  
  // We always set a friend code before returning, so non-null here.
  return localFriendCode!;
}

/**
 * Validate friend code format
 */
export function validateFriendCode(code: string): boolean {
  const regex = /^GAMBA-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return regex.test(code);
}

/**
 * Parse friend code
 */
export function parseFriendCode(code: string): { code: string; valid: boolean } {
  const valid = validateFriendCode(code);
  return {
    code,
    valid,
  };
}

/**
 * Check if friend code exists
 */
export function friendCodeExists(friendCode: string): boolean {
  const db = Database.getDatabase();
  const user = db.prepare('SELECT id FROM users WHERE friend_code = ?').get(friendCode);
  return user !== undefined;
}

/**
 * Get user ID by friend code
 */
export function getUserByFriendCode(friendCode: string): number | null {
  const db = Database.getDatabase();
  const user = db.prepare('SELECT id FROM users WHERE friend_code = ?').get(friendCode) as any;
  return user ? user.id : null;
}
