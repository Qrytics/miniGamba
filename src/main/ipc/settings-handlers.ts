/**
 * IPC handlers for settings operations
 * Handles communication between renderer and main process for settings
 */

import { ipcMain } from 'electron';
import { userDataService } from '../services/data/user-data';
import { setOverlayOpacity, setOverlaySize, setClickThrough } from '../windows/overlay';
import { UserSettings } from '../../shared/types/user.types';

ipcMain.handle('settings:get', async () => {
  try {
    const user = userDataService.getUser();
    const settings = userDataService.getUserSettings(user.id);
    return { success: true, settings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('settings:update', async (event, settings: UserSettings) => {
  try {
    const user = userDataService.getUser();
    userDataService.updateUserSettings(user.id, settings);
    
    // Apply overlay settings if changed
    if (settings.overlay) {
      setOverlayOpacity(settings.overlay.opacity);
      
      if (settings.overlay.size === 'custom' && settings.overlay.customWidth && settings.overlay.customHeight) {
        setOverlaySize(settings.overlay.customWidth, settings.overlay.customHeight);
      } else {
        // Set preset sizes
        const sizes = {
          small: { width: 300, height: 400 },
          medium: { width: 400, height: 500 },
          large: { width: 500, height: 600 }
        };
        const size = sizes[settings.overlay.size as keyof typeof sizes];
        if (size) {
          setOverlaySize(size.width, size.height);
        }
      }
      
      setClickThrough(settings.overlay.clickThroughMode);
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('settings:reset', async () => {
  try {
    const user = userDataService.getUser();
    // Get default settings by calling the private method indirectly
    const defaultSettings = await ipcMain.handle('settings:get', async () => {
      return userDataService.getUserSettings(999999); // Will return defaults
    });
    userDataService.updateUserSettings(user.id, defaultSettings as any);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('settings:updateOverlay', async (event, opacity?: number, size?: string, clickThrough?: boolean) => {
  try {
    if (opacity !== undefined) {
      setOverlayOpacity(opacity);
    }
    
    if (size) {
      const sizes = {
        small: { width: 300, height: 400 },
        medium: { width: 400, height: 500 },
        large: { width: 500, height: 600 }
      };
      const sizeConfig = sizes[size as keyof typeof sizes];
      if (sizeConfig) {
        setOverlaySize(sizeConfig.width, sizeConfig.height);
      }
    }
    
    if (clickThrough !== undefined) {
      setClickThrough(clickThrough);
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
