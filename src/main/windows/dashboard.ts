import { BrowserWindow } from 'electron';
import path from 'path';

let dashboardWindow: BrowserWindow | null = null;

/**
 * Create and configure the dashboard window
 * This is the main application window where users manage their account,
 * view stats, configure settings, and access all features
 */
export function createDashboardWindow(): BrowserWindow {
  // TODO: Load saved window position and size from settings
  
  dashboardWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../../preload/dashboard-preload.js'),
    },
    title: 'miniGamba Dashboard',
    icon: path.join(__dirname, '../../../assets/images/icons/app-icon.png'),
    // TODO: Add custom window frame styling
  });

  // TODO: Load the dashboard HTML
  dashboardWindow.loadFile('src/renderer/dashboard/index.html');

  // TODO: Save window position and size on close
  dashboardWindow.on('close', () => {
    // Save window bounds
  });

  dashboardWindow.on('closed', () => {
    dashboardWindow = null;
  });

  // TODO: Set up menu bar
  // TODO: Set up dev tools in development mode
  
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
