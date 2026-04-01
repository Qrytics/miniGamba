import {
  validateBet,
  validateInput,
  validateJSON,
  validateFriendCode,
} from './validation';

describe('validation utils', () => {
  describe('validateBet', () => {
    it('accepts valid whole-number bet within constraints', () => {
      expect(validateBet(100, 10, 1000, 500)).toEqual({ valid: true });
    });

    it('rejects non-finite values', () => {
      expect(validateBet(Number.NaN, 10, 1000, 500)).toEqual({
        valid: false,
        error: 'Bet must be a valid number',
      });
    });

    it('rejects non-integer values', () => {
      expect(validateBet(12.5, 10, 1000, 500)).toEqual({
        valid: false,
        error: 'Bet must be a whole number',
      });
    });

    it('rejects minimum/maximum/balance violations', () => {
      expect(validateBet(5, 10, 1000, 500)).toEqual({
        valid: false,
        error: 'Minimum bet is 10 coins',
      });
      expect(validateBet(1500, 10, 1000, 2000)).toEqual({
        valid: false,
        error: 'Maximum bet is 1000 coins',
      });
      expect(validateBet(600, 10, 1000, 500)).toEqual({
        valid: false,
        error: 'Insufficient balance',
      });
    });
  });

  describe('validateInput', () => {
    it('validates supported primitive and container types', () => {
      expect(validateInput('abc', 'string')).toBe(true);
      expect(validateInput('   ', 'string')).toBe(false);
      expect(validateInput(42, 'number')).toBe(true);
      expect(validateInput(Number.POSITIVE_INFINITY, 'number')).toBe(false);
      expect(validateInput(7, 'integer')).toBe(true);
      expect(validateInput(7.2, 'integer')).toBe(false);
      expect(validateInput(true, 'boolean')).toBe(true);
      expect(validateInput([], 'array')).toBe(true);
      expect(validateInput({}, 'object')).toBe(true);
      expect(validateInput([], 'object')).toBe(false);
      expect(validateInput('abc', 'unsupported')).toBe(false);
    });
  });

  describe('validateJSON', () => {
    it('accepts JSON object payloads', () => {
      expect(validateJSON('{"a":1,"b":"two"}')).toEqual({ valid: true });
    });

    it('rejects empty/invalid/non-object payloads', () => {
      expect(validateJSON('')).toEqual({
        valid: false,
        error: 'JSON payload cannot be empty',
      });
      expect(validateJSON('{invalid')).toEqual({
        valid: false,
        error: 'Invalid JSON format',
      });
      expect(validateJSON('[]')).toEqual({
        valid: false,
        error: 'Expected a JSON object payload',
      });
      expect(validateJSON('"hello"')).toEqual({
        valid: false,
        error: 'Expected a JSON object payload',
      });
    });
  });

  describe('validateFriendCode', () => {
    it('accepts canonical and normalized friend codes', () => {
      expect(validateFriendCode('GAMBA-AB12-CD34')).toBe(true);
      expect(validateFriendCode('  gamba-ab12-cd34  ')).toBe(true);
    });

    it('rejects malformed friend codes', () => {
      expect(validateFriendCode('GAMBA-ABC-CD34')).toBe(false);
      expect(validateFriendCode('WRONG-AB12-CD34')).toBe(false);
    });
  });
});
