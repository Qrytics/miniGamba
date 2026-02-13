import { BrowserWindow } from 'electron';
import path from 'path';

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
      preload: path.join(__dirname, '../preload/dashboard-preload.js'),
    },
    title: 'miniGamba Dashboard',
    backgroundColor: '#1a1a2e',
    show: false, // Don't show until ready
  });

  // Load the dashboard HTML
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    dashboardWindow.loadURL('http://localhost:3000');
    dashboardWindow.webContents.openDevTools();
  } else {
    dashboardWindow.loadFile(path.join(__dirname, '../renderer/dashboard/index.html'));
  }

  // Show window when ready
  dashboardWindow.once('ready-to-show', () => {
    dashboardWindow?.show();
  });

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
