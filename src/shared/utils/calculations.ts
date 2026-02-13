/**
 * Calculation utilities
 * Common calculation functions used across the app
 */

/**
 * Calculate XP needed for a level
 * TODO: Implement XP curve
 */
export function calculateXPForLevel(level: number): number {
  // XP curve: 100 * level^1.5
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate level from XP
 * TODO: Implement reverse XP calculation
 */
export function calculateLevelFromXP(xp: number): number {
  let level = 1;
  let totalXP = 0;
  
  while (totalXP < xp) {
    totalXP += calculateXPForLevel(level);
    level++;
  }
  
  return level - 1;
}

/**
 * Calculate win rate percentage
 */
export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

/**
 * Calculate streak multiplier
 * TODO: Implement streak-based multipliers
 */
export function calculateStreakMultiplier(streak: number): number {
  const multipliers: Record<number, number> = {
    1: 1.2,
    2: 1.5,
    3: 2,
    4: 3,
    5: 5,
    6: 8,
    7: 12,
    8: 15,
    9: 30,
    10: 50,
  };
  
  return multipliers[streak] || 50;
}

/**
 * Format coins for display
 */
export function formatCoins(coins: number): string {
  if (coins >= 1000000) {
    return `${(coins / 1000000).toFixed(1)}M`;
  } else if (coins >= 1000) {
    return `${(coins / 1000).toFixed(1)}K`;
  }
  return coins.toString();
}

/**
 * Calculate time until next bonus
 * TODO: Implement time calculation for hourly bonus
 */
export function calculateTimeUntilBonus(): number {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  return nextHour.getTime() - now.getTime();
}
