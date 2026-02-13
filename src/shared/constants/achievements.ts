/**
 * Achievement constants and definitions
 */

export const ACHIEVEMENT_CATEGORIES = {
  GAMBLING: 'gambling',
  ECONOMY: 'economy',
  ACTIVITY: 'activity',
  SOCIAL: 'social',
  CUSTOMIZATION: 'customization',
  META: 'meta',
  SECRET: 'secret',
} as const;

// TODO: Define all achievements with their requirements
export const ACHIEVEMENTS = {
  // Gambling achievements
  FIRST_SPIN: {
    id: 'first-spin',
    name: 'First Spin',
    description: 'Play the slot machine for the first time',
    category: 'gambling',
    points: 5,
    hidden: false,
  },
  FIRST_JACKPOT: {
    id: 'first-jackpot',
    name: "Baby's First Jackpot",
    description: 'Hit a jackpot on the slot machine',
    category: 'gambling',
    points: 15,
    hidden: false,
  },
  // TODO: Add all other achievements from productReqDoc.md
  
  // Secret achievements
  MIDNIGHT_SPIN: {
    id: 'midnight-spin',
    name: '???',
    description: 'Spin the slot machine at exactly midnight',
    category: 'secret',
    points: 25,
    hidden: true,
  },
} as const;

// TODO: Add achievement checking functions
// TODO: Add achievement progress tracking
