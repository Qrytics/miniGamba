import { BrowserWindow, screen } from 'electron';

// Provided by @electron-forge/plugin-webpack for the "overlay" entry point
declare const OVERLAY_WEBPACK_ENTRY: string;
declare const OVERLAY_PRELOAD_WEBPACK_ENTRY: string;

let overlayWindow: BrowserWindow | null = null;

/**
 * Create and configure the overlay window
 * This is the always-on-top window where users play mini-games
 * while doing other activities
 */
export function createOverlayWindow(): BrowserWindow {
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
      preload: OVERLAY_PRELOAD_WEBPACK_ENTRY,
    },
    backgroundColor: '#00000000', // Fully transparent
    show: false,
  });

  // Load the overlay renderer (dev server or production bundle, handled by webpack plugin)
  overlayWindow.loadURL(OVERLAY_WEBPACK_ENTRY).catch((error) => {
    console.error('Failed to load overlay:', error);
    // Retry after a short delay in case dev server is still starting
    setTimeout(() => {
      overlayWindow?.loadURL(OVERLAY_WEBPACK_ENTRY).catch((retryError) => {
        console.error('Retry failed:', retryError);
      });
    }, 2000);
  });

  // Show window when ready
  overlayWindow.once('ready-to-show', () => {
    overlayWindow?.show();
    overlayWindow?.setOpacity(0.9);
  });

  // Don't open DevTools during testing
  if (process.env.PLAYWRIGHT_TEST) {
    // DevTools disabled for tests
  } else if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    // Optionally open DevTools in development (commented out for overlay)
    // overlayWindow.webContents.openDevTools();
  }

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

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
    overlayWindow.setIgnoreMouseEvents(enabled, { forward: true });
  }
}
