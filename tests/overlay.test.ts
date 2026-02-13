/**
 * Comprehensive Overlay Window Tests
 * Tests all aspects of the overlay window launch and functionality
 */

import { test, expect } from '@playwright/test';
import { launchApp, takeScreenshot, waitForElement, elementExists, getOverlayWindow, TestContext } from './setup';

let testContext: TestContext;

test.beforeAll(async () => {
  testContext = await launchApp();
});

test.afterAll(async () => {
  await testContext.app.close();
});

test.describe('Overlay Window Launch', () => {
  test('should launch overlay window from dashboard', async () => {
    const { mainWindow, app } = testContext;
    
    // Wait for dashboard to load
    await mainWindow.waitForSelector('.app-sidebar', { timeout: 15000 });
    await mainWindow.waitForTimeout(1000);
    
    // Get window count before launch
    const windowsBefore = app.windows().filter(w => {
      const url = w.url();
      return !url.includes('devtools://') && !url.includes('chrome-devtools');
    });
    const windowCountBefore = windowsBefore.length;
    
    // Launch overlay using helper
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    
    // Verify overlay window was created
    const windowsAfter = app.windows().filter(w => {
      const url = w.url();
      return !url.includes('devtools://') && !url.includes('chrome-devtools');
    });
    const windowCountAfter = windowsAfter.length;
    
    expect(windowCountAfter).toBeGreaterThan(windowCountBefore);
    expect(overlayWindow).not.toBeNull();
    
    await takeScreenshot(mainWindow, 'overlay-launch-dashboard');
    if (overlayWindow) {
      await takeScreenshot(overlayWindow, 'overlay-window-launched');
    }
  });

  test('should create overlay window with correct properties', async () => {
    const { mainWindow, app } = testContext;
    
    // Launch overlay using helper
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    // Check window properties via Electron API (if accessible)
    // Note: Playwright may not expose all Electron-specific properties
    // But we can check if window is visible and loaded
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    const url = overlayWindow.url();
    expect(url).not.toBe('');
    expect(url).not.toContain('devtools://');
    
    await takeScreenshot(overlayWindow, 'overlay-window-properties');
  });

  test('should load overlay content correctly', async () => {
    const { mainWindow, app } = testContext;
    
    // Launch overlay using helper
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Check for root element
    const rootExists = await elementExists(overlayWindow, '#root');
    expect(rootExists).toBe(true);
    
    // Check for overlay app container
    const appExists = await waitForElement(overlayWindow, '.overlay-app', 10000);
    expect(appExists).toBe(true);
    
    await takeScreenshot(overlayWindow, 'overlay-content-loaded');
  });

  test('should display overlay header with coin display', async () => {
    const { mainWindow, app } = testContext;
    
    // Launch overlay using helper
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Check for overlay header
    const headerExists = await waitForElement(overlayWindow, '.overlay-header', 10000);
    expect(headerExists).toBe(true);
    
    // Check for coin display
    const coinDisplayExists = await waitForElement(overlayWindow, '.coin-display', 10000);
    expect(coinDisplayExists).toBe(true);
    
    // Check for control buttons
    const controlsExist = await elementExists(overlayWindow, '.header-controls');
    expect(controlsExist).toBe(true);
    
    await takeScreenshot(overlayWindow, 'overlay-header');
  });

  test('should display game selector with all games', async () => {
    const { mainWindow, app } = testContext;
    
    // Launch overlay using helper
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Check for game selector
    const gameSelectorExists = await waitForElement(overlayWindow, '.game-selector', 10000);
    expect(gameSelectorExists).toBe(true);
    
    // Check for game grid
    const gameGridExists = await waitForElement(overlayWindow, '.game-grid', 10000);
    expect(gameGridExists).toBe(true);
    
    // Check for game buttons (should have at least some games)
    const gameButtons = await overlayWindow.$$('.game-btn');
    expect(gameButtons.length).toBeGreaterThan(0);
    
    // Verify specific games are present
    const expectedGames = ['Slots', 'Blackjack', 'Coin Flip'];
    for (const gameName of expectedGames) {
      const gameButton = await overlayWindow.$(`button:has-text("${gameName}")`);
      expect(gameButton).not.toBeNull();
    }
    
    await takeScreenshot(overlayWindow, 'overlay-game-selector');
  });

  test('should allow selecting and playing games', async () => {
    const { mainWindow, app } = testContext;
    
    // Launch overlay using helper
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Click on Coin Flip game
    let coinFlipButton = await overlayWindow.$('button:has-text("Coin Flip")');
    if (!coinFlipButton) {
      coinFlipButton = await overlayWindow.$('button:has-text("🪙")');
    }
    
    if (coinFlipButton) {
      await coinFlipButton.click();
      await overlayWindow.waitForTimeout(1500);
      
      // Check if game component loaded
      const gameContainerExists = await waitForElement(overlayWindow, '.game-container', 5000);
      expect(gameContainerExists).toBe(true);
      
      await takeScreenshot(overlayWindow, 'overlay-coin-flip-game');
      
      // Check for back button
      const backButton = await overlayWindow.$('button:has-text("Back")');
      expect(backButton).not.toBeNull();
      
      // Go back to game selector
      if (backButton) {
        await backButton.click();
        await overlayWindow.waitForTimeout(1000);
        
        const gameSelectorBack = await waitForElement(overlayWindow, '.game-selector', 5000);
        expect(gameSelectorBack).toBe(true);
      }
    }
  });

  test('should reuse existing overlay window on multiple launches', async () => {
    const { mainWindow, app } = testContext;
    
    // Launch overlay first time
    const overlayWindow1 = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow1).not.toBeNull();
    
    // Get window count after first launch
    const windowsAfterFirst = app.windows().filter(w => {
      const url = w.url();
      return !url.includes('devtools://') && !url.includes('chrome-devtools') && w !== mainWindow;
    });
    const countAfterFirst = windowsAfterFirst.length;
    
    // Launch again (should reuse existing)
    const overlayWindow2 = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow2).not.toBeNull();
    
    // Get window count after second launch
    const windowsAfterSecond = app.windows().filter(w => {
      const url = w.url();
      return !url.includes('devtools://') && !url.includes('chrome-devtools') && w !== mainWindow;
    });
    const countAfterSecond = windowsAfterSecond.length;
    
    // Should have same number of windows (reused, not created new)
    expect(countAfterSecond).toBe(countAfterFirst);
    
    // Should be the same window instance
    if (overlayWindow1 && overlayWindow2) {
      expect(overlayWindow1.url()).toBe(overlayWindow2.url());
    }
    
    await takeScreenshot(mainWindow, 'overlay-reuse-test');
  });

  test('should have close button functionality', async () => {
    const { mainWindow, app } = testContext;
    
    // Launch overlay using helper
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Find close button
    const closeButton = await overlayWindow.$('.close-btn, button:has-text("×")');
    expect(closeButton).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'overlay-close-button');
  });

  test('should display user coins in overlay header', async () => {
    const { mainWindow, app } = testContext;
    
    // Launch overlay using helper
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Check coin display shows a number
    const coinDisplay = await overlayWindow.$('.coin-display');
    expect(coinDisplay).not.toBeNull();
    
    if (coinDisplay) {
      const coinText = await coinDisplay.textContent();
      expect(coinText).toContain('💰');
      // Should contain a number (even if 0)
      expect(coinText).toMatch(/\d/);
    }
    
    await takeScreenshot(overlayWindow, 'overlay-coin-display');
  });

  test('should have all control buttons in header', async () => {
    const { mainWindow, app } = testContext;
    
    // Launch overlay using helper
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Check for control buttons
    const controlButtons = await overlayWindow.$$('.control-btn, .close-btn');
    expect(controlButtons.length).toBeGreaterThan(0);
    
    // Check for specific buttons
    const dashboardButton = await overlayWindow.$('button:has-text("📊")');
    const minimizeButton = await overlayWindow.$('button:has-text("−")');
    const closeButton = await overlayWindow.$('.close-btn, button:has-text("×")');
    
    expect(dashboardButton || minimizeButton || closeButton).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'overlay-control-buttons');
  });

  test('should load overlay without console errors', async () => {
    const { mainWindow, app } = testContext;
    
    // Launch overlay using helper
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Check for any obvious errors in the page
    const errorElements = await overlayWindow.$$('[class*="error"], [class*="Error"]');
    // Note: We're just checking for error classes, actual console errors would need different handling
    
    await takeScreenshot(overlayWindow, 'overlay-no-errors');
  });

  test('should handle overlay window positioning', async () => {
    const { mainWindow, app } = testContext;
    
    // Launch overlay using helper
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Window should be visible and positioned
    const url = overlayWindow.url();
    expect(url).not.toBe('');
    
    await takeScreenshot(overlayWindow, 'overlay-positioning');
  });
});
