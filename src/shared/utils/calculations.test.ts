import {
  calculateLevelFromXP,
  calculateStreakMultiplier,
  calculateTimeUntilBonus,
  calculateWinRate,
  calculateXPForLevel,
  formatCoins,
} from './calculations';

describe('shared/utils/calculations', () => {
  describe('calculateXPForLevel', () => {
    it('returns increasing XP requirements', () => {
      const level1 = calculateXPForLevel(1);
      const level2 = calculateXPForLevel(2);
      const level3 = calculateXPForLevel(3);

      expect(level1).toBeGreaterThan(0);
      expect(level2).toBeGreaterThan(level1);
      expect(level3).toBeGreaterThan(level2);
    });
  });

  describe('calculateLevelFromXP', () => {
    it('returns level 1 for non-positive or invalid XP', () => {
      expect(calculateLevelFromXP(0)).toBe(1);
      expect(calculateLevelFromXP(-500)).toBe(1);
      expect(calculateLevelFromXP(Number.NaN)).toBe(1);
    });

    it('maps XP to a valid level progression', () => {
      const level2Threshold = calculateXPForLevel(1);
      const level3Threshold = level2Threshold + calculateXPForLevel(2);

      expect(calculateLevelFromXP(level2Threshold)).toBe(2);
      expect(calculateLevelFromXP(level3Threshold - 1)).toBe(2);
      expect(calculateLevelFromXP(level3Threshold)).toBe(3);
    });
  });

  describe('calculateWinRate', () => {
    it('handles zero totals and normal percentages', () => {
      expect(calculateWinRate(0, 0)).toBe(0);
      expect(calculateWinRate(3, 10)).toBe(30);
      expect(calculateWinRate(2, 3)).toBe(67);
    });
  });

  describe('calculateStreakMultiplier', () => {
    it('returns baseline multiplier for invalid or non-positive streaks', () => {
      expect(calculateStreakMultiplier(0)).toBe(1);
      expect(calculateStreakMultiplier(-2)).toBe(1);
      expect(calculateStreakMultiplier(Number.NaN)).toBe(1);
    });

    it('applies configured multiplier table and caps at 50x', () => {
      expect(calculateStreakMultiplier(1)).toBe(1.2);
      expect(calculateStreakMultiplier(5)).toBe(5);
      expect(calculateStreakMultiplier(10)).toBe(50);
      expect(calculateStreakMultiplier(18)).toBe(50);
      expect(calculateStreakMultiplier(2.9)).toBe(1.5);
    });
  });

  describe('formatCoins', () => {
    it('formats plain, thousands, and millions values', () => {
      expect(formatCoins(999)).toBe('999');
      expect(formatCoins(1500)).toBe('1.5K');
      expect(formatCoins(1250000)).toBe('1.3M');
    });
  });

  describe('calculateTimeUntilBonus', () => {
    it('returns a positive duration less than or equal to one hour', () => {
      const ms = calculateTimeUntilBonus();
      expect(ms).toBeGreaterThan(0);
      expect(ms).toBeLessThanOrEqual(60 * 60 * 1000);
    });
  });
});
