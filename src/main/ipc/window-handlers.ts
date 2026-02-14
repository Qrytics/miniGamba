/**
 * IPC handlers for window operations
 * Handles communication between renderer and main process for window management
 */

import { ipcMain } from 'electron';
import { createOverlayWindow, getOverlayWindow, toggleOverlay, closeOverlay } from '../windows/overlay';
import { showDashboard } from '../windows/dashboard';

// Handle overlay minimize - hide to tray (not taskbar)
ipcMain.on('window:minimizeOverlay', () => {
  try {
    const overlay = getOverlayWindow();
    if (overlay && overlay.isVisible()) {
      overlay.hide();
    }
  } catch (error: any) {
    console.error('Failed to minimize overlay:', error);
  }
});

// Handle open dashboard
ipcMain.on('window:openDashboard', () => {
  try {
    showDashboard();
  } catch (error: any) {
    console.error('Failed to open dashboard:', error);
  }
});

// Handle overlay window launch
ipcMain.on('window:launchOverlay', () => {
  try {
    const existingOverlay = getOverlayWindow();
    if (existingOverlay && existingOverlay.isVisible()) {
      // Overlay already exists and is visible, just focus it
      existingOverlay.focus();
    } else if (existingOverlay) {
      // Overlay exists but is hidden, show it
      existingOverlay.show();
      existingOverlay.focus();
    } else {
      // Create new overlay window
      createOverlayWindow();
    }
  } catch (error: any) {
    console.error('Failed to launch overlay window:', error);
  }
});

// Handle overlay window close
ipcMain.on('window:closeOverlay', () => {
  try {
    closeOverlay();
  } catch (error: any) {
    console.error('Failed to close overlay window:', error);
  }
});

// Handle overlay toggle
ipcMain.on('window:toggleOverlay', () => {
  try {
    toggleOverlay();
  } catch (error: any) {
    console.error('Failed to toggle overlay window:', error);
  }
});
