/**
 * Dashboard Preload Script
 * Exposes safe IPC methods to the dashboard renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';

interface ElectronAPI {
  // Game operations
  startGame: (gameType: string, bet: number) => Promise<any>;
  endGame: (gameType: string, result: any) => Promise<any>;
  getGameStats: (gameType?: string) => Promise<any>;
  getGameHistory: (limit: number, offset: number) => Promise<any>;

  // Settings operations
  getSettings: (key?: string) => Promise<any>;
  setSetting: (key: string, value: any) => Promise<any>;
  resetSettings: () => Promise<any>;

  // Data operations
  getUserData: () => Promise<any>;
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<any>;
  resetData: () => Promise<any>;
  backupData: () => Promise<any>;
  restoreData: (backupPath: string) => Promise<any>;
  updateProfile: (profile: any) => Promise<any>;
  addCoins: (amount: number) => Promise<any>; // Test-only

  // Achievement operations
  getAchievements: () => Promise<any>;
  getUnlockedAchievements: () => Promise<any>;
  getAchievementProgress: () => Promise<any>;

  // Daily tasks operations
  getDailyTasks: () => Promise<any>;
  updateTaskProgress: (taskId: string, progress: number) => Promise<any>;
  claimTaskReward: (taskId: string) => Promise<any>;

  // Hourly bonus operations
  getHourlyBonus: () => Promise<any>;
  claimHourlyBonus: () => Promise<any>;

  // Investment operations
  getInvestments: () => Promise<any>;
  createInvestment: (amount: number, riskLevel: string) => Promise<any>;
  cashOutInvestment: (investmentId: number) => Promise<any>;

  // Window operations
  launchOverlay: () => void;
  closeOverlay: () => void;
}

const api: ElectronAPI = {
  // Game operations
  startGame: (gameType, bet) => ipcRenderer.invoke('game:start', gameType, bet),
  endGame: (gameType, result) => ipcRenderer.invoke('game:end', gameType, result),
  getGameStats: (gameType) => ipcRenderer.invoke('game:getStats', gameType),
  getGameHistory: (limit, offset) => ipcRenderer.invoke('game:getHistory', limit, offset),

  // Settings operations
  getSettings: (key) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  resetSettings: () => ipcRenderer.invoke('settings:reset'),

  // Data operations
  getUserData: () => ipcRenderer.invoke('data:getUser'),
  exportData: () => ipcRenderer.invoke('data:export'),
  importData: (jsonData) => ipcRenderer.invoke('data:import', jsonData),
  resetData: () => ipcRenderer.invoke('data:reset'),
  backupData: () => ipcRenderer.invoke('data:backup'),
  restoreData: (backupPath) => ipcRenderer.invoke('data:restore', backupPath),
  updateProfile: (profile) => ipcRenderer.invoke('data:updateProfile', profile),
  addCoins: (amount) => ipcRenderer.invoke('data:addCoins', amount), // Test-only

  // Achievement operations
  getAchievements: () => ipcRenderer.invoke('data:getAchievements'),
  getUnlockedAchievements: () => ipcRenderer.invoke('data:getUnlockedAchievements'),
  getAchievementProgress: () => ipcRenderer.invoke('data:getAchievementProgress'),

  // Daily tasks operations
  getDailyTasks: () => ipcRenderer.invoke('data:getDailyTasks'),
  updateTaskProgress: (taskId, progress) => ipcRenderer.invoke('data:updateTaskProgress', taskId, progress),
  claimTaskReward: (taskId) => ipcRenderer.invoke('data:claimTaskReward', taskId),

  // Hourly bonus operations
  getHourlyBonus: () => ipcRenderer.invoke('data:getHourlyBonus'),
  claimHourlyBonus: () => ipcRenderer.invoke('data:claimHourlyBonus'),

  // Investment operations
  getInvestments: () => ipcRenderer.invoke('data:getInvestments'),
  createInvestment: (amount, riskLevel) => ipcRenderer.invoke('data:createInvestment', amount, riskLevel),
  cashOutInvestment: (investmentId) => ipcRenderer.invoke('data:cashOutInvestment', investmentId),

  // Window operations
  launchOverlay: () => ipcRenderer.send('window:launchOverlay'),
  closeOverlay: () => ipcRenderer.send('window:closeOverlay'),
};

// Expose API to renderer process
contextBridge.exposeInMainWorld('electronAPI', api);

console.log('Dashboard preload script loaded');
