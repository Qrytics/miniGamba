/**
 * Global hotkey registration service
 * Registers system-wide keyboard shortcuts
 */

import { globalShortcut, BrowserWindow } from 'electron';

interface HotkeyConfig {
  key: string;
  description: string;
  callback: () => void;
}

const registeredHotkeys: Map<string, HotkeyConfig> = new Map();

/**
 * Register a global hotkey
 */
export function registerHotkey(key: string, description: string, callback: () => void): boolean {
  try {
    if (registeredHotkeys.has(key)) {
      globalShortcut.unregister(key);
    }

    const success = globalShortcut.register(key, callback);
    
    if (success) {
      registeredHotkeys.set(key, { key, description, callback });
      console.log(`Hotkey registered: ${key} - ${description}`);
      return true;
    } else {
      console.error(`Failed to register hotkey: ${key}`);
      return false;
    }
  } catch (error) {
    console.error(`Error registering hotkey ${key}:`, error);
    return false;
  }
}

/**
 * Unregister a global hotkey
 */
export function unregisterHotkey(key: string): void {
  try {
    globalShortcut.unregister(key);
    registeredHotkeys.delete(key);
    console.log(`Hotkey unregistered: ${key}`);
  } catch (error) {
    console.error(`Error unregistering hotkey ${key}:`, error);
  }
}

/**
 * Unregister all hotkeys
 */
export function unregisterAllHotkeys(): void {
  try {
    globalShortcut.unregisterAll();
    registeredHotkeys.clear();
    console.log('All hotkeys unregistered');
  } catch (error) {
    console.error('Error unregistering all hotkeys:', error);
  }
}

/**
 * Get list of registered hotkeys
 */
export function getRegisteredHotkeys(): HotkeyConfig[] {
  return Array.from(registeredHotkeys.values());
}

/**
 * Check if a hotkey is registered
 */
export function isHotkeyRegistered(key: string): boolean {
  return globalShortcut.isRegistered(key);
}

/**
 * Register default miniGamba hotkeys
 */
export function registerDefaultHotkeys(overlayWindow: BrowserWindow | null): void {
  registerHotkey('CommandOrControl+Shift+G', 'Toggle Overlay', () => {
    if (overlayWindow) {
      if (overlayWindow.isVisible()) {
        overlayWindow.hide();
      } else {
        overlayWindow.show();
        overlayWindow.focus();
      }
    }
  });

  registerHotkey('CommandOrControl+Shift+M', 'Minimize Overlay', () => {
    if (overlayWindow && overlayWindow.isVisible()) {
      overlayWindow.minimize();
    }
  });

  console.log('Default hotkeys registered');
}

/**
 * Validate hotkey format
 */
export function validateHotkey(key: string): boolean {
  const validModifiers = ['CommandOrControl', 'Command', 'Control', 'Alt', 'Shift', 'Super'];
  const parts = key.split('+');
  
  if (parts.length === 0) return false;
  
  const actualKey = parts[parts.length - 1];
  if (!actualKey || actualKey.length === 0) return false;
  
  for (let i = 0; i < parts.length - 1; i++) {
    if (!validModifiers.includes(parts[i])) {
      return false;
    }
  }
  
  return true;
}
