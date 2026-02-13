/**
 * Achievement-related type definitions
 */

export type AchievementCategory =
  | 'gambling'
  | 'economy'
  | 'activity'
  | 'social'
  | 'customization'
  | 'meta'
  | 'secret';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  points: number;
  hidden: boolean; // For secret achievements
  progressive: boolean; // Has progress tracking
  requirement?: number; // For progressive achievements
}

export interface AchievementProgress {
  achievementId: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number; // Current progress (for progressive)
}

export interface AchievementUnlock {
  achievement: Achievement;
  unlockedAt: Date;
}

// TODO: Define specific achievement IDs as constants
export const ACHIEVEMENT_IDS = {
  // Gambling
  FIRST_SPIN: 'first-spin',
  FIRST_JACKPOT: 'first-jackpot',
  JACKPOT_HUNTER: 'jackpot-hunter',
  
  // Economy
  POCKET_CHANGE: 'pocket-change',
  STACKING_UP: 'stacking-up',
  FAT_STACKS: 'fat-stacks',
  
  // TODO: Add all achievement IDs
} as const;
