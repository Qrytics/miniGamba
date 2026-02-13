/**
 * Playwright Electron Test Setup
 * Configures Playwright to test the Electron app
 */

import { _electron as electron, ElectronApplication, Page } from 'playwright';
import * as path from 'path';

export interface TestContext {
  app: ElectronApplication;
  mainWindow: Page;
  overlayWindow?: Page;
}

/**
 * Launch the Electron app for testing
 * @param workerIndex Optional worker index for parallel testing isolation
 */
export async function launchApp(workerIndex?: number): Promise<TestContext> {
  // Set environment variable to prevent DevTools from opening
  process.env.PLAYWRIGHT_TEST = 'true';
  
  const electronPath = require('electron');
  const appPath = path.join(__dirname, '../.webpack/main/index.js');

  // Use worker index or process ID for isolation
  const workerId = workerIndex !== undefined ? workerIndex.toString() : process.pid.toString();
  
  // Use isolated user data directory per worker to avoid database conflicts
  // Store all test data in a subdirectory to keep root clean
  const testDataBaseDir = path.join(__dirname, '../test-data');
  const userDataDir = path.join(testDataBaseDir, `worker-${workerId}`);
  
  // Ensure base directory and worker directory exist
  const fs = require('fs');
  if (!fs.existsSync(testDataBaseDir)) {
    fs.mkdirSync(testDataBaseDir, { recursive: true });
  }
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  
  const app = await electron.launch({
    args: [
      appPath,
      // Use isolated user data directory
      `--user-data-dir=${userDataDir}`,
    ],
    executablePath: electronPath,
    env: {
      ...process.env,
      PLAYWRIGHT_TEST: 'true',
      NODE_ENV: 'test',
      TEST_WORKER_INDEX: workerId,
      // Override user data path for this worker
      ELECTRON_USER_DATA: userDataDir,
    },
    // Add timeout and better error handling
    timeout: 60000,
  });

  // Get all windows and find the main app window (not DevTools)
  const windows = app.windows();
  let mainWindow = windows[0];
  
  // If we have multiple windows, find the one that's not DevTools
  if (windows.length > 1) {
    for (const window of windows) {
      const url = window.url();
      // DevTools URLs typically contain 'devtools://' or are chrome-devtools URLs
      if (!url.includes('devtools://') && !url.includes('chrome-devtools')) {
        mainWindow = window;
        break;
      }
    }
  }
  
  // Close any DevTools windows
  for (const window of windows) {
    const url = window.url();
    if (url.includes('devtools://') || url.includes('chrome-devtools')) {
      await window.close();
    }
  }
  
  // Wait for page to load
  await mainWindow.waitForLoadState('domcontentloaded');
  
  // Wait a bit more for React to render
  await mainWindow.waitForTimeout(3000);
  
  // Wait for root element to exist (React app loaded)
  try {
    await mainWindow.waitForSelector('#root', { timeout: 15000 });
    
    // Wait for React to actually render content
    await mainWindow.waitForSelector('.app, .app-header, .app-sidebar', { timeout: 10000 });
  } catch (error) {
    console.warn('App elements not found, taking screenshot for debugging');
    const fs = require('fs');
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    await mainWindow.screenshot({ path: path.join(screenshotDir, 'debug-app-not-loaded.png'), fullPage: true });
    throw new Error(`App did not load properly. Screenshot saved. Error: ${error}`);
  }

  // Give test user enough coins to test all features
  // Calculate: enough for multiple bets across all games (max bet ~1000, 10 games, multiple rounds)
  const TEST_COINS = 50000; // Enough for extensive testing
  try {
    await mainWindow.evaluate(async (amount: number) => {
      if ((window as any).electronAPI && (window as any).electronAPI.addCoins) {
        const result = await (window as any).electronAPI.addCoins(amount);
        console.log(`[TEST] Added ${amount} coins:`, result);
      }
    }, TEST_COINS);
    await mainWindow.waitForTimeout(500); // Wait for coins to be added
  } catch (error) {
    console.warn('Could not add test coins (this is OK if handler not available):', error);
  }

  return {
    app,
    mainWindow,
  };
}

/**
 * Cleanup function to be called after tests
 */
export async function cleanupTestData(): Promise<void> {
  const workerIndex = process.env.TEST_WORKER_INDEX || process.env.PLAYWRIGHT_WORKER_INDEX || '0';
  const testDataBaseDir = path.join(__dirname, '../test-data');
  const userDataDir = path.join(testDataBaseDir, `worker-${workerIndex}`);
  
  try {
    const fs = require('fs');
    if (fs.existsSync(userDataDir)) {
      // Don't delete during test run, only after all tests complete
      // fs.rmSync(userDataDir, { recursive: true, force: true });
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Take a screenshot and save it with a descriptive name
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  outputDir: string = './tests/screenshots'
): Promise<string> {
  const fs = require('fs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(outputDir, filename);

  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

/**
 * Wait for element to be visible with timeout
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if element exists on page
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const element = await page.$(selector);
  return element !== null;
}

/**
 * Get console errors from the page
 */
export async function getConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Get overlay window from app, launching it if needed
 */
export async function getOverlayWindow(
  app: ElectronApplication,
  mainWindow: Page
): Promise<Page | null> {
  // Find existing overlay window
  const windows = app.windows().filter(w => {
    const url = w.url();
    return !url.includes('devtools://') && !url.includes('chrome-devtools') && w !== mainWindow;
  });
  
  if (windows.length > 0) {
    return windows[0];
  }
  
  // Launch overlay if not found
  let launchButton = await mainWindow.$('button:has-text("Launch Overlay")');
  if (!launchButton) {
    launchButton = await mainWindow.$('button:has-text("🚀")');
  }
  if (!launchButton) {
    launchButton = await mainWindow.$('.app-sidebar button.btn-primary');
  }
  if (!launchButton) {
    const buttons = await mainWindow.$$('.app-sidebar button');
    launchButton = buttons[buttons.length - 1];
  }
  
  if (launchButton) {
    await launchButton.click();
    await mainWindow.waitForTimeout(3000);
    
    // Find the newly created overlay window
    const newWindows = app.windows().filter(w => {
      const url = w.url();
      return !url.includes('devtools://') && !url.includes('chrome-devtools') && w !== mainWindow;
    });
    
    if (newWindows.length > 0) {
      return newWindows[0];
    }
  }
  
  return null;
}
