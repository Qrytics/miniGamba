import { app, BrowserWindow } from 'electron';
import path from 'path';

// TODO: Import window controllers
// import { createDashboardWindow } from './windows/dashboard';
// import { createOverlayWindow } from './windows/overlay';

// TODO: Import IPC handlers
// import './ipc/game-handlers';
// import './ipc/settings-handlers';
// import './ipc/data-handlers';

// TODO: Import services
// import { initDatabase } from './services/data/database';
// import { startGameDetection } from './services/game-detection/process-monitor';
// import { startActivityTracking } from './services/activity-tracking/video-tracker';

let dashboardWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;

/**
 * Initialize the application
 * TODO: Set up all services and handlers
 */
async function initialize() {
  console.log('Initializing miniGamba...');
  
  // TODO: Initialize database
  // await initDatabase();
  
  // TODO: Start background services
  // await startGameDetection();
  // await startActivityTracking();
  
  console.log('miniGamba initialized successfully');
}

/**
 * Create the dashboard window
 * TODO: Move to windows/dashboard.ts
 */
function createDashboard() {
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
    icon: path.join(__dirname, '../../assets/images/icons/app-icon.png'),
  });

  // TODO: Load the dashboard HTML
  // dashboardWindow.loadFile('src/renderer/dashboard/index.html');
  
  dashboardWindow.on('closed', () => {
    dashboardWindow = null;
  });
}

/**
 * App event handlers
 */
app.on('ready', async () => {
  await initialize();
  createDashboard();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (dashboardWindow === null) {
    createDashboard();
  }
});

// TODO: Handle app shutdown
app.on('before-quit', async () => {
  // TODO: Clean up services
  // await stopGameDetection();
  // await closeDatabase();
});

export { dashboardWindow, overlayWindow };
