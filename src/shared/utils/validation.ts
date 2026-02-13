/**
 * Validation utilities
 * Common validation functions used across the app
 */

/**
 * Validate bet amount
 * TODO: Implement bet validation
 */
export function validateBet(bet: number, min: number, max: number, balance: number): {
  valid: boolean;
  error?: string;
} {
  if (bet < min) {
    return { valid: false, error: `Minimum bet is ${min} coins` };
  }
  
  if (bet > max) {
    return { valid: false, error: `Maximum bet is ${max} coins` };
  }
  
  if (bet > balance) {
    return { valid: false, error: 'Insufficient balance' };
  }
  
  return { valid: true };
}

/**
 * Validate user input
 * TODO: Implement input validation
 */
export function validateInput(value: any, type: string): boolean {
  // TODO: Implement validation based on type
  return true;
}

/**
 * Validate JSON data
 * TODO: Implement JSON validation for import/export
 */
export function validateJSON(jsonString: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON format' };
  }
}

/**
 * Validate friend code format
 * TODO: Implement friend code validation
 */
export function validateFriendCode(code: string): boolean {
  // Format: GAMBA-XXXX-XXXX
  const regex = /^GAMBA-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return regex.test(code);
}
