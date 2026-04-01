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
  if (!Number.isFinite(bet)) {
    return { valid: false, error: 'Bet must be a valid number' };
  }

  if (!Number.isInteger(bet)) {
    return { valid: false, error: 'Bet must be a whole number' };
  }

  if (bet <= 0) {
    return { valid: false, error: 'Bet must be greater than zero' };
  }

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
 */
export function validateInput(value: unknown, type: string): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string' && value.trim().length > 0;
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return value !== null && typeof value === 'object' && !Array.isArray(value);
    default:
      return false;
  }
}

/**
 * Validate JSON data
 */
export function validateJSON(jsonString: string): { valid: boolean; error?: string } {
  if (jsonString.trim().length === 0) {
    return { valid: false, error: 'JSON payload cannot be empty' };
  }

  try {
    const parsed = JSON.parse(jsonString);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { valid: false, error: 'Expected a JSON object payload' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid JSON format' };
  }
}

/**
 * Validate friend code format
 */
export function validateFriendCode(code: string): boolean {
  // Format: GAMBA-XXXX-XXXX
  const normalizedCode = code.trim().toUpperCase();
  const regex = /^GAMBA-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return regex.test(normalizedCode);
}
