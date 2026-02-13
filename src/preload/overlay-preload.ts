/**
 * Overlay Preload Script
 * Exposes safe IPC methods to the overlay renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';

interface ElectronAPI {
  // Game operations
  startGame: (gameType: string, bet: number) => Promise<any>;
  endGame: (gameType: string, result: any) => Promise<any>;
  getGameStats: (gameType?: string) => Promise<any>;
  
  // User data
  getUserData: () => Promise<any>;
  updateCoins: (amount: number) => Promise<any>;
  
  // Settings
  getOverlaySettings: () => Promise<any>;
  setOverlayOpacity: (opacity: number) => void;
  setOverlaySize: (width: number, height: number) => void;
  setClickThrough: (enabled: boolean) => void;
  
  // Daily tasks
  getDailyTasks: () => Promise<any>;
  updateTaskProgress: (taskId: string, progress: number) => Promise<any>;

  // Hourly bonus
  getHourlyBonus: () => Promise<any>;
  claimHourlyBonus: () => Promise<any>;
  
  // Window operations
  closeOverlay: () => void;
  minimizeOverlay: () => void;
  openDashboard: () => void;
}

const api: ElectronAPI = {
  // Game operations
  startGame: (gameType, bet) => ipcRenderer.invoke('game:start', gameType, bet),
  endGame: (gameType, result) => ipcRenderer.invoke('game:end', gameType, result),
  getGameStats: (gameType) => ipcRenderer.invoke('game:getStats', gameType),
  
  // User data
  getUserData: () => ipcRenderer.invoke('data:getUser'),
  updateCoins: (amount) => ipcRenderer.invoke('data:updateCoins', amount),
  
  // Settings
  getOverlaySettings: () => ipcRenderer.invoke('settings:overlay'),
  setOverlayOpacity: (opacity) => ipcRenderer.send('overlay:setOpacity', opacity),
  setOverlaySize: (width, height) => ipcRenderer.send('overlay:setSize', width, height),
  setClickThrough: (enabled) => ipcRenderer.send('overlay:setClickThrough', enabled),

  // Daily tasks
  getDailyTasks: () => ipcRenderer.invoke('data:getDailyTasks'),
  updateTaskProgress: (taskId, progress) => ipcRenderer.invoke('data:updateTaskProgress', taskId, progress),

  // Hourly bonus
  getHourlyBonus: () => ipcRenderer.invoke('data:getHourlyBonus'),
  claimHourlyBonus: () => ipcRenderer.invoke('data:claimHourlyBonus'),
  
  // Window operations
  closeOverlay: () => ipcRenderer.send('window:closeOverlay'),
  minimizeOverlay: () => ipcRenderer.send('window:minimizeOverlay'),
  openDashboard: () => ipcRenderer.send('window:openDashboard'),
};

// Expose API to renderer process
contextBridge.exposeInMainWorld('electronAPI', api);

console.log('Overlay preload script loaded');
