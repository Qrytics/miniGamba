/**
 * Type declarations for electronAPI exposed via preload scripts
 */

export interface ElectronAPI {
  // Game operations
  startGame: (gameType: string, bet: number) => Promise<any>;
  endGame: (gameType: string, result: any) => Promise<any>;
  getGameStats: (gameType?: string) => Promise<any>;
  getGameHistory?: (limit: number, offset: number) => Promise<any>;
  
  // User data
  getUserData: () => Promise<any>;
  updateCoins?: (amount: number) => Promise<any>;
  updateProfile?: (profile: any) => Promise<any>;
  
  // Settings
  getSettings?: (key?: string) => Promise<any>;
  setSetting?: (key: string, value: any) => Promise<any>;
  resetSettings?: () => Promise<any>;
  getOverlaySettings?: () => Promise<any>;
  setOverlayOpacity?: (opacity: number) => void;
  setOverlaySize?: (width: number, height: number) => void;
  setClickThrough?: (enabled: boolean) => void;

  // Achievement operations
  getAchievements?: () => Promise<any>;
  getUnlockedAchievements?: () => Promise<any>;
  getAchievementProgress?: () => Promise<any>;

  // Daily tasks operations
  getDailyTasks?: () => Promise<any>;
  updateTaskProgress?: (taskId: string, progress: number) => Promise<any>;
  claimTaskReward?: (taskId: string) => Promise<any>;

  // Hourly bonus operations
  getHourlyBonus?: () => Promise<any>;
  claimHourlyBonus?: () => Promise<any>;

  // Investment operations
  getInvestments?: () => Promise<any>;
  createInvestment?: (amount: number, riskLevel: string) => Promise<any>;
  cashOutInvestment?: (investmentId: number) => Promise<any>;

  // Data operations
  exportData?: () => Promise<string>;
  importData?: (jsonData: string) => Promise<any>;
  resetData?: () => Promise<any>;
  backupData?: () => Promise<any>;
  restoreData?: (backupPath: string) => Promise<any>;
  
  // Window operations
  launchOverlay?: () => void;
  closeOverlay?: () => void;
  minimizeOverlay?: () => void;
  openDashboard?: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
