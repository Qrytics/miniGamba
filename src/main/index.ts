import { app, BrowserWindow } from 'electron';
import path from 'path';

// Import window controllers
import { createDashboardWindow } from './windows/dashboard';
import { createOverlayWindow } from './windows/overlay';

// Import IPC handlers
import './ipc/game-handlers';
import './ipc/settings-handlers';
import './ipc/data-handlers';
import './ipc/window-handlers';

// Import services
import { databaseService } from './services/data/database';

let dashboardWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;

/**
 * Initialize the application
 */
async function initialize() {
  console.log('Initializing miniGamba...');
  
  try {
    // Initialize database
    databaseService.initialize();
    
    // Create or get default user
    databaseService.getOrCreateUser();
    
    console.log('miniGamba initialized successfully');
  } catch (error) {
    console.error('Failed to initialize miniGamba:', error);
    app.quit();
  }
}

/**
 * App event handlers
 */
app.on('ready', async () => {
  await initialize();
  dashboardWindow = createDashboardWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (dashboardWindow === null) {
    dashboardWindow = createDashboardWindow();
  }
});

// Handle app shutdown
app.on('before-quit', async () => {
  // Clean up services
  databaseService.close();
});

export { dashboardWindow, overlayWindow, createOverlayWindow };
