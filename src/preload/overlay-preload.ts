/**
 * Overlay Preload Script
 * Exposes safe IPC methods to the overlay renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';

// TODO: Define API interface
interface ElectronAPI {
  // Game operations
  startGame: (gameType: string, bet: number) => Promise<any>;
  endGame: (gameType: string, result: any) => Promise<any>;
  
  // User data
  getUserData: () => Promise<any>;
  updateCoins: (amount: number) => Promise<any>;
  
  // Settings
  getOverlaySettings: () => Promise<any>;
  setOverlayOpacity: (opacity: number) => void;
  setOverlaySize: (width: number, height: number) => void;
  
  // Window operations
  closeOverlay: () => void;
  minimizeOverlay: () => void;

  // TODO: Add more API methods as needed
}

const api: ElectronAPI = {
  // Game operations
  startGame: (gameType, bet) => ipcRenderer.invoke('game:start', gameType, bet),
  endGame: (gameType, result) => ipcRenderer.invoke('game:end', gameType, result),
  
  // User data
  getUserData: () => ipcRenderer.invoke('data:getUser'),
  updateCoins: (amount) => ipcRenderer.invoke('data:updateCoins', amount),
  
  // Settings
  getOverlaySettings: () => ipcRenderer.invoke('settings:overlay'),
  setOverlayOpacity: (opacity) => ipcRenderer.send('overlay:setOpacity', opacity),
  setOverlaySize: (width, height) => ipcRenderer.send('overlay:setSize', width, height),
  
  // Window operations
  closeOverlay: () => ipcRenderer.send('window:closeOverlay'),
  minimizeOverlay: () => ipcRenderer.send('window:minimizeOverlay'),
};

// Expose API to renderer process
contextBridge.exposeInMainWorld('electronAPI', api);

console.log('Overlay preload script loaded');
