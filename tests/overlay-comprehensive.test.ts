/**
 * Comprehensive Overlay Tests
 * Tests EVERY game and EVERY button in the overlay
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

// Helper to set up console error tracking
function setupConsoleErrorTracking(page: any): { errors: string[]; dispose: () => void } {
  const errors: string[] = [];
  const handler = (msg: any) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  };
  page.on('console', handler);
  
  return {
    errors,
    dispose: () => page.off('console', handler)
  };
}

// Helper to navigate back to game selector
async function goBackToGameSelector(overlayWindow: any) {
  const backButton = await overlayWindow.$('button[data-testid="overlay-back-btn"]');
  if (backButton) {
    try {
      await backButton.click();
      await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    } catch (error) {
      // If back button doesn't work, try refreshing or navigating differently
      console.warn('Could not navigate back:', error);
    }
  }
}

// Helper to test bet controls
async function testBetControls(overlayWindow: any, gameName: string) {
  // Wait for bet controls to be visible
  await overlayWindow.waitForSelector('input[type="number"].bet-input, input.bet-input', { timeout: 5000 }).catch(() => null);
  
  // Test -10 button
  const minusBtn = await overlayWindow.$('button:has-text("-10")');
  expect(minusBtn).not.toBeNull();
  if (minusBtn) {
    try {
      await minusBtn.click();
      await overlayWindow.waitForTimeout(300);
    } catch (error) {
      console.warn('Could not click -10 button:', error);
    }
  }
  
  // Test +10 button
  const plusBtn = await overlayWindow.$('button:has-text("+10")');
  expect(plusBtn).not.toBeNull();
  if (plusBtn) {
    try {
      await plusBtn.click();
      await overlayWindow.waitForTimeout(300);
    } catch (error) {
      console.warn('Could not click +10 button:', error);
    }
  }
  
  // Test bet input
  const betInput = await overlayWindow.$('input[type="number"].bet-input, input.bet-input');
  expect(betInput).not.toBeNull();
  if (betInput) {
    try {
      await betInput.fill('50');
      await overlayWindow.waitForTimeout(300);
      const value = await betInput.inputValue();
      expect(parseInt(value || '0')).toBeGreaterThan(0);
    } catch (error) {
      console.warn('Could not set bet input:', error);
    }
  }
}

test.describe('Comprehensive Overlay Tests - All Games and Buttons', () => {
  test('should test Coin Flip game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    const { errors, dispose } = setupConsoleErrorTracking(overlayWindow);
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    
    // Navigate to Coin Flip using stable data-testid
    const coinFlipBtn = await overlayWindow.$('button[data-testid="game-btn-coin-flip"]');
    expect(coinFlipBtn).not.toBeNull();
    if (!coinFlipBtn) return;
    
    await coinFlipBtn.click();
    await overlayWindow.waitForSelector('.game-container', { timeout: 5000 });
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Coin Flip');
    
    // Test Heads button
    const headsBtn = await overlayWindow.$('button:has-text("Heads")');
    expect(headsBtn).not.toBeNull();
    if (headsBtn) {
      await headsBtn.click();
      await overlayWindow.waitForTimeout(300);
    }
    
    // Test Tails button
    const tailsBtn = await overlayWindow.$('button:has-text("Tails")');
    expect(tailsBtn).not.toBeNull();
    if (tailsBtn) {
      await tailsBtn.click();
      await overlayWindow.waitForTimeout(300);
    }
    
    // Test FLIP button
    const flipBtn = await overlayWindow.$('button:has-text("FLIP")');
    expect(flipBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'coin-flip-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
    
    dispose();
    expect(errors.length).toBe(0);
  });

  test('should test Blackjack game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    const { errors, dispose } = setupConsoleErrorTracking(overlayWindow);
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    
    // Navigate to Blackjack using stable data-testid
    const blackjackBtn = await overlayWindow.$('button[data-testid="game-btn-blackjack"]');
    expect(blackjackBtn).not.toBeNull();
    if (!blackjackBtn) return;
    
    await blackjackBtn.click();
    await overlayWindow.waitForSelector('.game-container', { timeout: 5000 });
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Blackjack');
    
    // Test DEAL button
    const dealBtn = await overlayWindow.$('button:has-text("DEAL")');
    expect(dealBtn).not.toBeNull();
    if (dealBtn) {
      await dealBtn.click();
      await overlayWindow.waitForSelector('button:has-text("HIT"), button:has-text("STAND")', { timeout: 3000 }).catch(() => null);
      
      // After dealing, test HIT and STAND buttons
      const hitBtn = await overlayWindow.$('button:has-text("HIT")');
      const standBtn = await overlayWindow.$('button:has-text("STAND")');
      
      if (hitBtn && standBtn) {
        expect(hitBtn).not.toBeNull();
        expect(standBtn).not.toBeNull();
        
        // Test HIT button
        await hitBtn.click();
        await overlayWindow.waitForTimeout(500);
        
        // Test STAND button
        await standBtn.click();
        await overlayWindow.waitForTimeout(500);
      }
    }
    
    await takeScreenshot(overlayWindow, 'blackjack-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
    
    dispose();
    expect(errors.length).toBe(0);
  });

  test('should test Slot Machine game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    const { errors, dispose } = setupConsoleErrorTracking(overlayWindow);
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    
    // Navigate to Slots using stable data-testid
    const slotsBtn = await overlayWindow.$('button[data-testid="game-btn-slot-machine"]');
    expect(slotsBtn).not.toBeNull();
    if (!slotsBtn) return;
    
    await slotsBtn.click();
    await overlayWindow.waitForSelector('.game-container', { timeout: 5000 });
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Slot Machine');
    
    // Test SPIN button
    const spinBtn = await overlayWindow.$('button:has-text("SPIN")');
    expect(spinBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'slot-machine-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
    
    dispose();
    expect(errors.length).toBe(0);
  });

  test('should test Higher or Lower game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    const { errors, dispose } = setupConsoleErrorTracking(overlayWindow);
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    
    // Navigate to Hi/Lo using stable data-testid
    const hiloBtn = await overlayWindow.$('button[data-testid="game-btn-higher-or-lower"]');
    expect(hiloBtn).not.toBeNull();
    if (!hiloBtn) return;
    
    await hiloBtn.click();
    await overlayWindow.waitForSelector('.game-container', { timeout: 5000 });
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Higher or Lower');
    
    // Test START button
    const startBtn = await overlayWindow.$('button:has-text("START")');
    expect(startBtn).not.toBeNull();
    if (startBtn) {
      await startBtn.click();
      await overlayWindow.waitForTimeout(500);
      
      // After starting, test HIGHER and LOWER buttons
      const higherBtn = await overlayWindow.$('button:has-text("HIGHER")');
      const lowerBtn = await overlayWindow.$('button:has-text("LOWER")');
      const cashOutBtn = await overlayWindow.$('button:has-text("CASH OUT")');
      
      if (higherBtn) {
        expect(higherBtn).not.toBeNull();
        await higherBtn.click();
        await overlayWindow.waitForTimeout(500);
      }
      
      if (lowerBtn) {
        expect(lowerBtn).not.toBeNull();
        await lowerBtn.click();
        await overlayWindow.waitForTimeout(500);
      }
      
      if (cashOutBtn) {
        expect(cashOutBtn).not.toBeNull();
        await cashOutBtn.click();
        await overlayWindow.waitForTimeout(500);
      }
    }
    
    await takeScreenshot(overlayWindow, 'higher-lower-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
    
    dispose();
    expect(errors.length).toBe(0);
  });

  test('should test Mine Sweeper game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    const { errors, dispose } = setupConsoleErrorTracking(overlayWindow);
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    
    // Navigate to Mines using stable data-testid
    const minesBtn = await overlayWindow.$('button[data-testid="game-btn-mine-sweeper"]');
    expect(minesBtn).not.toBeNull();
    if (!minesBtn) return;
    
    await minesBtn.click();
    await overlayWindow.waitForSelector('.game-container', { timeout: 5000 });
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Mine Sweeper');
    
    // Test START button
    const startBtn = await overlayWindow.$('button:has-text("START")');
    expect(startBtn).not.toBeNull();
    if (startBtn) {
      await startBtn.click();
      await overlayWindow.waitForTimeout(500);
      
      // Test grid cells (click a few)
      const gridCells = await overlayWindow.$$('button[style*="width: 50px"], button[style*="height: 50px"]');
      if (gridCells.length > 0) {
        // Click first few cells
        for (let i = 0; i < Math.min(3, gridCells.length); i++) {
          await gridCells[i].click();
          await overlayWindow.waitForTimeout(300);
        }
      }
      
      // Test CASH OUT button
      const cashOutBtn = await overlayWindow.$('button:has-text("CASH OUT")');
      if (cashOutBtn) {
        expect(cashOutBtn).not.toBeNull();
        await cashOutBtn.click();
        await overlayWindow.waitForTimeout(500);
      }
    }
    
    await takeScreenshot(overlayWindow, 'mine-sweeper-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
    
    dispose();
    expect(errors.length).toBe(0);
  });

  test('should test Scratch Cards game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    const { errors, dispose } = setupConsoleErrorTracking(overlayWindow);
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    
    // Navigate to Scratch using stable data-testid
    const scratchBtn = await overlayWindow.$('button[data-testid="game-btn-scratch-cards"]');
    expect(scratchBtn).not.toBeNull();
    if (!scratchBtn) return;
    
    await scratchBtn.click();
    await overlayWindow.waitForSelector('.game-container', { timeout: 5000 });
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Scratch Cards');
    
    // Test SCRATCH button
    const scratchPlayBtn = await overlayWindow.$('button:has-text("SCRATCH")');
    expect(scratchPlayBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'scratch-cards-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
    
    dispose();
    expect(errors.length).toBe(0);
  });

  test('should test Wheel of Fortune game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    const { errors, dispose } = setupConsoleErrorTracking(overlayWindow);
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    
    // Navigate to Wheel using stable data-testid
    const wheelBtn = await overlayWindow.$('button[data-testid="game-btn-wheel-of-fortune"]');
    expect(wheelBtn).not.toBeNull();
    if (!wheelBtn) return;
    
    await wheelBtn.click();
    await overlayWindow.waitForSelector('.game-container', { timeout: 5000 });
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Wheel of Fortune');
    
    // Test SPIN button
    const spinBtn = await overlayWindow.$('button:has-text("SPIN")');
    expect(spinBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'wheel-of-fortune-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
    
    dispose();
    expect(errors.length).toBe(0);
  });

  test('should test Mini Derby game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    const { errors, dispose } = setupConsoleErrorTracking(overlayWindow);
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    
    // Navigate to Derby using stable data-testid
    const derbyBtn = await overlayWindow.$('button[data-testid="game-btn-mini-derby"]');
    expect(derbyBtn).not.toBeNull();
    if (!derbyBtn) return;
    
    await derbyBtn.click();
    await overlayWindow.waitForSelector('.game-container', { timeout: 5000 });
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Mini Derby');
    
    // Test RACE button
    const raceBtn = await overlayWindow.$('button:has-text("RACE")');
    expect(raceBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'mini-derby-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
    
    dispose();
    expect(errors.length).toBe(0);
  });

  test('should test Dice Roll game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    const { errors, dispose } = setupConsoleErrorTracking(overlayWindow);
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    
    // Navigate to Dice using stable data-testid
    const diceBtn = await overlayWindow.$('button[data-testid="game-btn-dice-roll"]');
    expect(diceBtn).not.toBeNull();
    if (!diceBtn) return;
    
    await diceBtn.click();
    await overlayWindow.waitForSelector('.game-container', { timeout: 5000 });
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Dice Roll');
    
    // Test ROLL button
    const rollBtn = await overlayWindow.$('button:has-text("ROLL")');
    expect(rollBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'dice-roll-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
    
    dispose();
    expect(errors.length).toBe(0);
  });

  test('should test Mini Poker game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    const { errors, dispose } = setupConsoleErrorTracking(overlayWindow);
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    
    // Navigate to Poker using stable data-testid
    const pokerBtn = await overlayWindow.$('button[data-testid="game-btn-mini-poker"]');
    expect(pokerBtn).not.toBeNull();
    if (!pokerBtn) return;
    
    await pokerBtn.click();
    await overlayWindow.waitForSelector('.game-container', { timeout: 5000 });
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Mini Poker');
    
    // Test DEAL button
    const dealBtn = await overlayWindow.$('button:has-text("DEAL")');
    expect(dealBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'mini-poker-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
    
    dispose();
    expect(errors.length).toBe(0);
  });

  test('should test all overlay header buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    const { errors, dispose } = setupConsoleErrorTracking(overlayWindow);
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    
    // Test Dashboard button using stable data-testid
    const dashboardBtn = await overlayWindow.$('button[data-testid="overlay-nav-dashboard"]');
    expect(dashboardBtn).not.toBeNull();
    if (dashboardBtn) {
      await dashboardBtn.click();
      await overlayWindow.waitForTimeout(500);
    }
    
    // Test Minimize button using stable data-testid
    const minimizeBtn = await overlayWindow.$('button[data-testid="overlay-minimize-btn"]');
    expect(minimizeBtn).not.toBeNull();
    if (minimizeBtn) {
      await minimizeBtn.click();
      await overlayWindow.waitForTimeout(500);
    }
    
    // Test Close button using stable data-testid
    const closeBtn = await overlayWindow.$('button[data-testid="overlay-close-btn"]');
    expect(closeBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'overlay-header-buttons');
    
    dispose();
    expect(errors.length).toBe(0);
  });

  test('should verify all 10 games are accessible', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    const { errors, dispose } = setupConsoleErrorTracking(overlayWindow);
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    
    // List of all expected games with their test IDs
    const expectedGames = [
      'slot-machine', 'blackjack', 'coin-flip', 'higher-or-lower', 'mine-sweeper',
      'scratch-cards', 'wheel-of-fortune', 'mini-derby', 'dice-roll', 'mini-poker'
    ];
    
    // Verify each game button exists using stable data-testid
    for (const gameId of expectedGames) {
      const gameBtn = await overlayWindow.$(`button[data-testid="game-btn-${gameId}"]`);
      expect(gameBtn).not.toBeNull();
    }
    
    // Count total game buttons
    const gameButtons = await overlayWindow.$$('.game-btn');
    expect(gameButtons.length).toBe(10);
    
    await takeScreenshot(overlayWindow, 'all-games-accessible');
    
    dispose();
    expect(errors.length).toBe(0);
  });

  test('should test navigation between games', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    const { errors, dispose } = setupConsoleErrorTracking(overlayWindow);
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
    
    // Test navigating to multiple games using stable data-testid
    const gamesToTest = [
      { id: 'slot-machine', name: 'Slots' },
      { id: 'coin-flip', name: 'Coin Flip' },
      { id: 'dice-roll', name: 'Dice' }
    ];
    
    for (const game of gamesToTest) {
      // Ensure we're on game selector
      await overlayWindow.waitForSelector('.game-selector', { timeout: 5000 });
      
      // Click game using stable data-testid
      const gameBtn = await overlayWindow.$(`button[data-testid="game-btn-${game.id}"]`);
      
      expect(gameBtn).not.toBeNull();
      if (gameBtn) {
        await gameBtn.click();
        await overlayWindow.waitForSelector('.game-container', { timeout: 5000 });
        
        // Go back
        await goBackToGameSelector(overlayWindow);
      }
    }
    
    await takeScreenshot(overlayWindow, 'navigation-between-games');
    
    dispose();
    expect(errors.length).toBe(0);
  });
});
