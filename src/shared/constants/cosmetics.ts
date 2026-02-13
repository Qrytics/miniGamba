/**
 * Cosmetic constants and definitions
 */

export const COSMETIC_CATEGORIES = {
  OVERLAY_THEME: 'overlay-theme',
  SLOT_SKIN: 'slot-skin',
  CARD_BACK: 'card-back',
  DICE_SKIN: 'dice-skin',
  DASHBOARD_WALLPAPER: 'dashboard-wallpaper',
  PROFILE_AVATAR: 'profile-avatar',
  PROFILE_BORDER: 'profile-border',
  PROFILE_TITLE: 'profile-title',
  WIN_ANIMATION: 'win-animation',
} as const;

// TODO: Define all cosmetic items
export const OVERLAY_THEMES = {
  NEON: {
    id: 'neon',
    name: 'Neon',
    unlockCondition: 'default',
  },
  RETRO: {
    id: 'retro',
    name: 'Retro',
    unlockCondition: 'level-5',
  },
  CASINO_ROYALE: {
    id: 'casino-royale',
    name: 'Casino Royale',
    unlockCondition: 'level-10',
  },
  // TODO: Add more themes
};

// TODO: Add cosmetic unlock checking
// TODO: Add cosmetic application logic
