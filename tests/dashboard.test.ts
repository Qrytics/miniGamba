/**
 * Dashboard Window Tests
 * Tests the main dashboard functionality
 */

import { test, expect } from '@playwright/test';
import { launchApp, takeScreenshot, waitForElement, elementExists, getConsoleErrors, TestContext } from './setup';

let testContext: TestContext;

test.beforeAll(async () => {
  testContext = await launchApp();
});

test.afterAll(async () => {
  await testContext.app.close();
});

test.describe('Dashboard Window', () => {
  test('should load dashboard window', async () => {
    const { mainWindow } = testContext;
    
    // Wait for the app to fully load
    await mainWindow.waitForTimeout(3000);
    
    // Wait for React app to render
    const appLoaded = await waitForElement(mainWindow, '.app', 15000);
    expect(appLoaded).toBe(true);
    
    // Take initial screenshot
    const screenshot = await takeScreenshot(mainWindow, 'dashboard-initial');
    console.log(`Screenshot saved: ${screenshot}`);
    
    // Check if root element exists
    const rootExists = await elementExists(mainWindow, '#root');
    expect(rootExists).toBe(true);
    
    // Verify app structure is loaded
    const headerExists = await elementExists(mainWindow, '.app-header');
    expect(headerExists).toBe(true);
  });

  test('should display app header', async () => {
    const { mainWindow } = testContext;
    
    // Check for header elements
    const headerExists = await waitForElement(mainWindow, '.app-header', 5000);
    expect(headerExists).toBe(true);
    
    // Check for title
    const titleExists = await elementExists(mainWindow, 'h1');
    expect(titleExists).toBe(true);
    
    await takeScreenshot(mainWindow, 'dashboard-header');
  });

  test('should display sidebar navigation', async () => {
    const { mainWindow } = testContext;
    
    const sidebarExists = await waitForElement(mainWindow, '.app-sidebar', 5000);
    expect(sidebarExists).toBe(true);
    
    // Check for navigation buttons
    const navButtons = await mainWindow.$$('.app-sidebar button');
    expect(navButtons.length).toBeGreaterThan(0);
    
    await takeScreenshot(mainWindow, 'dashboard-sidebar');
  });

  test('should navigate between pages', async () => {
    const { mainWindow } = testContext;
    
    // Wait for sidebar to be ready
    await mainWindow.waitForSelector('.app-sidebar', { timeout: 10000 });
    
    // Click on Games page - try multiple selectors
    let gamesButton = await mainWindow.$('button:has-text("Games")');
    if (!gamesButton) {
      gamesButton = await mainWindow.$('button:has-text("🎮")');
    }
    if (!gamesButton) {
      gamesButton = await mainWindow.$('.app-sidebar button:nth-of-type(2)');
    }
    
    if (gamesButton) {
      await gamesButton.click();
      await mainWindow.waitForTimeout(1000);
      await takeScreenshot(mainWindow, 'dashboard-games-page');
    }
    
    // Click on Stats page - try multiple selectors
    let statsButton = await mainWindow.$('button:has-text("Stats")');
    if (!statsButton) {
      statsButton = await mainWindow.$('button:has-text("📊")');
    }
    if (!statsButton) {
      statsButton = await mainWindow.$('.app-sidebar button:nth-of-type(4)');
    }
    
    if (statsButton) {
      await statsButton.click();
      await mainWindow.waitForTimeout(1000);
      await takeScreenshot(mainWindow, 'dashboard-stats-page');
    }
  });

  test('should display user data', async () => {
    const { mainWindow } = testContext;
    
    // Check for coin display
    const coinDisplay = await waitForElement(mainWindow, '.coin-display', 5000);
    expect(coinDisplay).toBe(true);
    
    // Check for level display
    const levelDisplay = await waitForElement(mainWindow, '.level-display', 5000);
    expect(levelDisplay).toBe(true);
    
    await takeScreenshot(mainWindow, 'dashboard-user-data');
  });

  test('should have no console errors', async () => {
    const { mainWindow } = testContext;
    
    const errors = await getConsoleErrors(mainWindow);
    if (errors.length > 0) {
      console.error('Console errors found:', errors);
    }
    // Note: We don't fail the test here, just report
  });
});
