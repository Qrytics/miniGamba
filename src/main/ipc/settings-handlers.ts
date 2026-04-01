/**
 * IPC handlers for settings operations
 * Handles communication between renderer and main process for settings
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { userDataService } from '../services/data/user-data';
import { setOverlayOpacity, setOverlaySize, setClickThrough } from '../windows/overlay';
import { UserSettings } from '../../shared/types/user.types';

ipcMain.handle('settings:get', async () => {
  try {
    const user = userDataService.getUser();
    const settings = userDataService.getUserSettings(user.id);
    return { success: true, settings };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('settings:update', async (_event: IpcMainInvokeEvent, settings: UserSettings) => {
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
          small: { width: 360, height: 460 },
          medium: { width: 420, height: 540 },
          large: { width: 520, height: 660 }
        };
        const size = sizes[settings.overlay.size as keyof typeof sizes];
        if (size) {
          setOverlaySize(size.width, size.height);
        }
      }
      
      setClickThrough(settings.overlay.clickThroughMode);
    }
    
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('settings:reset', async () => {
  try {
    const user = userDataService.getUser();
    // Get default settings directly from the service
    const defaultSettings = userDataService.getUserSettings(999999); // Non-existent user returns defaults
    userDataService.updateUserSettings(user.id, defaultSettings);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('settings:updateOverlay', async (_event: IpcMainInvokeEvent, opacity?: number, size?: string, clickThrough?: boolean) => {
  try {
    if (opacity !== undefined) {
      setOverlayOpacity(opacity);
    }
    
    if (size) {
      const sizes = {
        small: { width: 360, height: 460 },
        medium: { width: 420, height: 540 },
        large: { width: 520, height: 660 }
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
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});
