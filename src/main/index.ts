import { app, BrowserWindow } from 'electron';

// Import window controllers
import { createDashboardWindow } from './windows/dashboard';
import { createOverlayWindow } from './windows/overlay';

// Import IPC handlers
import './ipc/game-handlers';
import './ipc/settings-handlers';
import './ipc/data-handlers';
import './ipc/window-handlers';
import './ipc/lol-handlers';

// Import services
import { databaseService } from './services/data/database';
import { createTray } from './services/tray';
import { lcuService } from './services/lol/lcu-service';
import { liveClientService } from './services/lol/live-client-service';
import { logger } from './utils/logger';

let dashboardWindow: BrowserWindow | null = null;
const overlayWindow: BrowserWindow | null = null;

/**
 * Initialize the application
 */
async function initialize() {
  // Wire up the logger to the user-data directory as early as possible.
  logger.setLogDirectory(app.getPath('userData'));
  logger.info('Initializing miniGamba...');
  
  try {
    // Initialize database
    databaseService.initialize();
    
    // Create or get default user
    databaseService.getOrCreateUser();
    
    logger.info('miniGamba initialized successfully');
    
    // Start League of Legends service polling
    lcuService.startPolling();
    liveClientService.startPolling();
  } catch (error) {
    logger.error('Failed to initialize miniGamba', error instanceof Error ? error : new Error(String(error)));
    app.quit();
  }
}

/**
 * App event handlers
 */
app.on('ready', async () => {
  await initialize();
  dashboardWindow = createDashboardWindow();
  createTray();
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
  lcuService.stopPolling();
  liveClientService.stopPolling();
  databaseService.close();
});

export { dashboardWindow, overlayWindow, createOverlayWindow };
