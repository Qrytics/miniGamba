import { BrowserWindow, screen } from 'electron';
import path from 'path';

let overlayWindow: BrowserWindow | null = null;

/**
 * Create and configure the overlay window
 * This is the always-on-top window where users play mini-games
 * while doing other activities
 */
export function createOverlayWindow(): BrowserWindow {
  // TODO: Load saved overlay position, size, and opacity from settings
  
  // Get primary display to position overlay
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width: 400,
    height: 500,
    x: width - 420, // Position in bottom-right by default
    y: height - 520,
    frame: false, // No window frame
    transparent: true, // Transparent background
    alwaysOnTop: true, // Always stay on top
    skipTaskbar: true, // Don't show in taskbar
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../../preload/overlay-preload.js'),
    },
    // TODO: Add click-through mode support
  });

  // TODO: Load the overlay HTML
  overlayWindow.loadFile('src/renderer/overlay/index.html');

  // TODO: Set up opacity control
  // overlayWindow.setOpacity(0.95);

  // TODO: Save window position on move
  overlayWindow.on('move', () => {
    // Save overlay position to settings
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  // TODO: Make window draggable
  // TODO: Set up hotkey to toggle visibility
  
  return overlayWindow;
}

/**
 * Get the current overlay window instance
 */
export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow;
}

/**
 * Show/hide the overlay window
 */
export function toggleOverlay(): void {
  if (overlayWindow) {
    if (overlayWindow.isVisible()) {
      overlayWindow.hide();
    } else {
      overlayWindow.show();
    }
  } else {
    createOverlayWindow();
  }
}

/**
 * Close the overlay window
 */
export function closeOverlay(): void {
  if (overlayWindow) {
    overlayWindow.close();
  }
}

/**
 * Set overlay opacity (0-1)
 */
export function setOverlayOpacity(opacity: number): void {
  if (overlayWindow) {
    overlayWindow.setOpacity(Math.max(0.1, Math.min(1, opacity)));
  }
}

/**
 * Set overlay size
 */
export function setOverlaySize(width: number, height: number): void {
  if (overlayWindow) {
    overlayWindow.setSize(width, height);
  }
}

/**
 * Enable/disable click-through mode
 */
export function setClickThrough(enabled: boolean): void {
  if (overlayWindow) {
    overlayWindow.setIgnoreMouseEvents(enabled);
    // TODO: Add visual indicator when click-through is enabled
  }
}
