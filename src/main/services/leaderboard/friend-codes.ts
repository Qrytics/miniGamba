/**
 * Friend Code System
 * Manages friend codes for P2P connections
 */

import { generateFriendCode } from '../../utils/crypto';

let localFriendCode: string | null = null;

/**
 * Generate or retrieve local friend code
 * TODO: Persist friend code
 */
export function getLocalFriendCode(): string {
  if (!localFriendCode) {
    // TODO: Load from database or generate new
    localFriendCode = generateFriendCode();
  }
  return localFriendCode;
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
 * TODO: Extract connection information from friend code
 */
export function parseFriendCode(code: string): any {
  if (!validateFriendCode(code)) {
    return null;
  }
  
  // TODO: Decode friend code to get connection info
  return {
    code,
    // TODO: Add connection details
  };
}
