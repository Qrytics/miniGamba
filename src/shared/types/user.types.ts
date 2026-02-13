/**
 * User-related type definitions
 */

export interface User {
  id: number;
  username: string;
  coins: number;
  level: number;
  xp: number;
  totalCoinsEarned: number;
  totalGamesPlayed: number;
  prestigeLevel: number;
  createdAt: Date;
}

export interface UserSettings {
  general: GeneralSettings;
  overlay: OverlaySettings;
  hotkeys: HotkeySettings;
  audio: AudioSettings;
  privacy: PrivacySettings;
}

export interface GeneralSettings {
  launchOnStartup: boolean;
  startInOverlayMode: boolean;
  enableNotifications: boolean;
  notifyFriendActivity: boolean;
  notifyDailyReset: boolean;
  notifyHourlyBonus: boolean;
}

export interface OverlaySettings {
  opacity: number; // 0.1 - 1.0
  size: 'small' | 'medium' | 'large' | 'custom';
  customWidth?: number;
  customHeight?: number;
  positionLocked: boolean;
  autoHideWhenNotInGame: boolean;
  displayMode: 'minimal' | 'expanded';
  clickThroughMode: boolean;
}

export interface HotkeySettings {
  toggleOverlay: string;
  quickSpin: string;
  // TODO: Add more hotkeys as needed
}

export interface AudioSettings {
  masterVolume: number; // 0 - 100
  uiVolume: number;
  gameVolume: number;
  musicVolume: number;
  muteWhenInactive: boolean;
}

export interface PrivacySettings {
  shareStatsWithFriends: boolean;
  showOnLeaderboard: boolean;
  allowFriendRequests: boolean;
}

export interface UserProfile {
  avatar: string;
  border: string;
  title: string;
  friendCode: string;
}
