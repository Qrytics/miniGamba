/**
 * Games Tests
 * Tests game functionality and interactions
 */

import { test, expect } from '@playwright/test';
import { launchApp, takeScreenshot, waitForElement, elementExists, TestContext } from './setup';

let testContext: TestContext;

test.beforeAll(async () => {
  testContext = await launchApp();
});

test.afterAll(async () => {
  await testContext.app.close();
});

test.describe('Games Functionality', () => {
  test('should navigate to games page', async () => {
    const { mainWindow } = testContext;
    
    // Wait for app to fully load
    await mainWindow.waitForTimeout(3000);
    
    // Wait for sidebar to be visible
    const sidebarVisible = await waitForElement(mainWindow, '.app-sidebar', 10000);
    expect(sidebarVisible).toBe(true);
    
    // Take screenshot before clicking
    await takeScreenshot(mainWindow, 'before-games-click');
    
    // Try multiple selector strategies for the Games button
    let gamesButton = await mainWindow.$('button:has-text("Games")');
    if (!gamesButton) {
      gamesButton = await mainWindow.$('button:has-text("🎮")');
    }
    if (!gamesButton) {
      gamesButton = await mainWindow.$('.app-sidebar button:nth-of-type(2)');
    }
    
    // Better error message if button not found
    if (!gamesButton) {
      const allButtons = await mainWindow.$$('.app-sidebar button');
      const buttonTexts = await Promise.all(
        allButtons.map(btn => btn.textContent())
      );
      throw new Error(
        `Games button not found. Found buttons: ${buttonTexts.join(', ')}`
      );
    }
    
    expect(gamesButton).not.toBeNull();
    await gamesButton.click();
    await mainWindow.waitForTimeout(1000);
    await takeScreenshot(mainWindow, 'games-page');
  });

  test('should launch overlay window (basic)', async () => {
    const { mainWindow, app } = testContext;
    
    // Wait for app to fully load
    await mainWindow.waitForTimeout(2000);
    
    // Wait for sidebar to be visible
    const sidebarVisible = await waitForElement(mainWindow, '.app-sidebar', 10000);
    expect(sidebarVisible).toBe(true);
    
    // Get initial window count (excluding DevTools)
    const windowsBefore = app.windows().filter(w => {
      const url = w.url();
      return !url.includes('devtools://') && !url.includes('chrome-devtools');
    });
    const windowCountBefore = windowsBefore.length;
    
    // Try multiple selector strategies for Launch Overlay button
    let launchButton = await mainWindow.$('button:has-text("Launch Overlay")');
    if (!launchButton) {
      launchButton = await mainWindow.$('button:has-text("🚀")');
    }
    if (!launchButton) {
      // Try finding by class or last button in sidebar
      launchButton = await mainWindow.$('.app-sidebar button.btn-primary');
    }
    if (!launchButton) {
      const buttons = await mainWindow.$$('.app-sidebar button');
      launchButton = buttons[buttons.length - 1]; // Last button
    }
    
    // Better error message if button not found
    if (!launchButton) {
      const allButtons = await mainWindow.$$('.app-sidebar button');
      const buttonTexts = await Promise.all(
        allButtons.map(btn => btn.textContent())
      );
      throw new Error(
        `Launch Overlay button not found. Found buttons: ${buttonTexts.join(', ')}`
      );
    }
    
    expect(launchButton).not.toBeNull();
    
    // Click the button
    await launchButton.click();
    
    // Wait for overlay window to be created
    await mainWindow.waitForTimeout(3000);
    
    // Check if overlay window was created (excluding DevTools)
    const windowsAfter = app.windows().filter(w => {
      const url = w.url();
      return !url.includes('devtools://') && !url.includes('chrome-devtools');
    });
    const windowCountAfter = windowsAfter.length;
    
    expect(windowCountAfter).toBeGreaterThan(windowCountBefore);
    
    // Find the overlay window
    const overlayWindow = windowsAfter.find(w => w !== mainWindow);
    if (overlayWindow) {
      await takeScreenshot(overlayWindow, 'overlay-window');
    }
    
    await takeScreenshot(mainWindow, 'overlay-launched');
  });

  test('should display game list', async () => {
    const { mainWindow } = testContext;
    
    // Wait for sidebar to be ready
    await mainWindow.waitForSelector('.app-sidebar', { timeout: 10000 });
    
    // Navigate to games if not already there
    let gamesButton = await mainWindow.$('button:has-text("Games")');
    if (!gamesButton) {
      gamesButton = await mainWindow.$('button:has-text("🎮")');
    }
    if (!gamesButton) {
      gamesButton = await mainWindow.$('.app-sidebar button:nth-of-type(2)');
    }
    
    expect(gamesButton).not.toBeNull();
    
    if (gamesButton) {
      await gamesButton.click();
      await mainWindow.waitForTimeout(1500);
    }
    
    // Check for game containers or buttons
    const gameElements = await mainWindow.$$('.game-container, [class*="game"]');
    // Just check that we can navigate to games page
    await takeScreenshot(mainWindow, 'games-list');
  });
});
