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

  // Constrain overlay to work area (above taskbar) - prevent dragging below taskbar
  // Use will-move so we can preventDefault and setBounds before the OS applies the move
  overlayWindow.on('will-move', (event: Electron.Event, newBounds: Electron.Rectangle) => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    const display = screen.getDisplayNearestPoint({
      x: newBounds.x + Math.floor(newBounds.width / 2),
      y: newBounds.y + Math.floor(newBounds.height / 2),
    });
    const { workArea } = display;

    let needsClamp = false;
    const clamped = { ...newBounds };

    if (newBounds.x < workArea.x) {
      clamped.x = workArea.x;
      needsClamp = true;
    }
    if (newBounds.y < workArea.y) {
      clamped.y = workArea.y;
      needsClamp = true;
    }
    if (newBounds.x + newBounds.width > workArea.x + workArea.width) {
      clamped.x = workArea.x + workArea.width - newBounds.width;
      needsClamp = true;
    }
    if (newBounds.y + newBounds.height > workArea.y + workArea.height) {
      clamped.y = workArea.y + workArea.height - newBounds.height;
      needsClamp = true;
    }

    if (needsClamp) {
      event.preventDefault();
      overlayWindow.setBounds(clamped);
    }
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
