import { BrowserWindow } from 'electron';

// Provided by @electron-forge/plugin-webpack for the "dashboard" entry point
declare const DASHBOARD_WEBPACK_ENTRY: string;
declare const DASHBOARD_PRELOAD_WEBPACK_ENTRY: string;

let dashboardWindow: BrowserWindow | null = null;

/**
 * Create and configure the dashboard window
 * This is the main application window where users manage their account,
 * view stats, configure settings, and access all features
 */
export function createDashboardWindow(): BrowserWindow {
  dashboardWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Use webpack-provided preload bundle so the dev server + production builds both work
      preload: DASHBOARD_PRELOAD_WEBPACK_ENTRY,
    },
    title: 'miniGamba Dashboard',
    backgroundColor: '#1a1a2e',
    show: false, // Don't show until ready
  });

  // Load the dashboard renderer (dev server or production bundle, handled by webpack plugin)
  console.log('Loading dashboard from:', DASHBOARD_WEBPACK_ENTRY);
  dashboardWindow.loadURL(DASHBOARD_WEBPACK_ENTRY).catch((error) => {
    console.error('Failed to load dashboard:', error);
    console.error('Attempted URL:', DASHBOARD_WEBPACK_ENTRY);
    // Retry after a short delay in case dev server is still starting
    setTimeout(() => {
      console.log('Retrying dashboard load...');
      dashboardWindow?.loadURL(DASHBOARD_WEBPACK_ENTRY).catch((retryError) => {
        console.error('Retry failed:', retryError);
      });
    }, 2000);
  });

  // Show window when ready
  dashboardWindow.once('ready-to-show', () => {
    dashboardWindow?.show();
  });

  // Open dev tools in development (but not during testing)
  if ((process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) && !process.env.PLAYWRIGHT_TEST) {
    dashboardWindow.webContents.openDevTools();
  }

  dashboardWindow.on('closed', () => {
    dashboardWindow = null;
  });

  return dashboardWindow;
}

/**
 * Get the current dashboard window instance
 */
export function getDashboardWindow(): BrowserWindow | null {
  return dashboardWindow;
}

/**
 * Show the dashboard window (create if doesn't exist)
 */
export function showDashboard(): void {
  if (dashboardWindow) {
    if (dashboardWindow.isMinimized()) {
      dashboardWindow.restore();
    }
    dashboardWindow.focus();
  } else {
    createDashboardWindow();
  }
}

/**
 * Close the dashboard window
 */
export function closeDashboard(): void {
  if (dashboardWindow) {
    dashboardWindow.close();
  }
}
