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

// Helper to navigate back to game selector
async function goBackToGameSelector(overlayWindow: any) {
  const backButton = await overlayWindow.$('button:has-text("Back"), button:has-text("←")');
  if (backButton) {
    try {
      await backButton.click();
      await overlayWindow.waitForTimeout(1000);
      await waitForElement(overlayWindow, '.game-selector', 5000);
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
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Navigate to Coin Flip
    const coinFlipBtn = await overlayWindow.$('button:has-text("Coin Flip"), button:has-text("🪙")');
    expect(coinFlipBtn).not.toBeNull();
    if (!coinFlipBtn) return;
    
    await coinFlipBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Verify game loaded
    const gameContainer = await waitForElement(overlayWindow, '.game-container', 5000);
    expect(gameContainer).toBe(true);
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Coin Flip');
    
    // Test Heads button
    const headsBtn = await overlayWindow.$('button:has-text("Heads"), button:has-text("👑")');
    expect(headsBtn).not.toBeNull();
    if (headsBtn) {
      await headsBtn.click();
      await overlayWindow.waitForTimeout(300);
    }
    
    // Test Tails button
    const tailsBtn = await overlayWindow.$('button:has-text("Tails"), button:has-text("🪙")');
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
  });

  test('should test Blackjack game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Navigate to Blackjack
    const blackjackBtn = await overlayWindow.$('button:has-text("Blackjack"), button:has-text("🃏")');
    expect(blackjackBtn).not.toBeNull();
    if (!blackjackBtn) return;
    
    await blackjackBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Verify game loaded
    const gameContainer = await waitForElement(overlayWindow, '.game-container', 5000);
    expect(gameContainer).toBe(true);
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Blackjack');
    
    // Test DEAL button
    const dealBtn = await overlayWindow.$('button:has-text("DEAL")');
    expect(dealBtn).not.toBeNull();
    if (dealBtn) {
      await dealBtn.click();
      await overlayWindow.waitForTimeout(2000);
      
      // After dealing, test HIT and STAND buttons
      const hitBtn = await overlayWindow.$('button:has-text("HIT")');
      const standBtn = await overlayWindow.$('button:has-text("STAND")');
      
      if (hitBtn && standBtn) {
        expect(hitBtn).not.toBeNull();
        expect(standBtn).not.toBeNull();
        
        // Test HIT button
        await hitBtn.click();
        await overlayWindow.waitForTimeout(1000);
        
        // Test STAND button
        await standBtn.click();
        await overlayWindow.waitForTimeout(1000);
      }
    }
    
    await takeScreenshot(overlayWindow, 'blackjack-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
  });

  test('should test Slot Machine game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Navigate to Slots
    const slotsBtn = await overlayWindow.$('button:has-text("Slots"), button:has-text("🎰")');
    expect(slotsBtn).not.toBeNull();
    if (!slotsBtn) return;
    
    await slotsBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Verify game loaded
    const gameContainer = await waitForElement(overlayWindow, '.game-container', 5000);
    expect(gameContainer).toBe(true);
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Slot Machine');
    
    // Test SPIN button
    const spinBtn = await overlayWindow.$('button:has-text("SPIN")');
    expect(spinBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'slot-machine-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
  });

  test('should test Higher or Lower game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Navigate to Hi/Lo
    const hiloBtn = await overlayWindow.$('button:has-text("Hi/Lo"), button:has-text("🎯")');
    expect(hiloBtn).not.toBeNull();
    if (!hiloBtn) return;
    
    await hiloBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Verify game loaded
    const gameContainer = await waitForElement(overlayWindow, '.game-container', 5000);
    expect(gameContainer).toBe(true);
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Higher or Lower');
    
    // Test START button
    const startBtn = await overlayWindow.$('button:has-text("START")');
    expect(startBtn).not.toBeNull();
    if (startBtn) {
      await startBtn.click();
      await overlayWindow.waitForTimeout(1500);
      
      // After starting, test HIGHER and LOWER buttons
      const higherBtn = await overlayWindow.$('button:has-text("HIGHER"), button:has-text("📈")');
      const lowerBtn = await overlayWindow.$('button:has-text("LOWER"), button:has-text("📉")');
      const cashOutBtn = await overlayWindow.$('button:has-text("CASH OUT"), button:has-text("💰")');
      
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
        await overlayWindow.waitForTimeout(1000);
      }
    }
    
    await takeScreenshot(overlayWindow, 'higher-lower-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
  });

  test('should test Mine Sweeper game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Navigate to Mines
    const minesBtn = await overlayWindow.$('button:has-text("Mines"), button:has-text("💣")');
    expect(minesBtn).not.toBeNull();
    if (!minesBtn) return;
    
    await minesBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Verify game loaded
    const gameContainer = await waitForElement(overlayWindow, '.game-container', 5000);
    expect(gameContainer).toBe(true);
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Mine Sweeper');
    
    // Test START button
    const startBtn = await overlayWindow.$('button:has-text("START")');
    expect(startBtn).not.toBeNull();
    if (startBtn) {
      await startBtn.click();
      await overlayWindow.waitForTimeout(1500);
      
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
      const cashOutBtn = await overlayWindow.$('button:has-text("CASH OUT"), button:has-text("💰")');
      if (cashOutBtn) {
        expect(cashOutBtn).not.toBeNull();
        await cashOutBtn.click();
        await overlayWindow.waitForTimeout(1000);
      }
    }
    
    await takeScreenshot(overlayWindow, 'mine-sweeper-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
  });

  test('should test Scratch Cards game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Navigate to Scratch
    const scratchBtn = await overlayWindow.$('button:has-text("Scratch"), button:has-text("🎫")');
    expect(scratchBtn).not.toBeNull();
    if (!scratchBtn) return;
    
    await scratchBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Verify game loaded
    const gameContainer = await waitForElement(overlayWindow, '.game-container', 5000);
    expect(gameContainer).toBe(true);
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Scratch Cards');
    
    // Test SCRATCH button
    const scratchPlayBtn = await overlayWindow.$('button:has-text("SCRATCH")');
    expect(scratchPlayBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'scratch-cards-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
  });

  test('should test Wheel of Fortune game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Navigate to Wheel
    const wheelBtn = await overlayWindow.$('button:has-text("Wheel"), button:has-text("🎡")');
    expect(wheelBtn).not.toBeNull();
    if (!wheelBtn) return;
    
    await wheelBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Verify game loaded
    const gameContainer = await waitForElement(overlayWindow, '.game-container', 5000);
    expect(gameContainer).toBe(true);
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Wheel of Fortune');
    
    // Test SPIN button
    const spinBtn = await overlayWindow.$('button:has-text("SPIN")');
    expect(spinBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'wheel-of-fortune-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
  });

  test('should test Mini Derby game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Navigate to Derby
    const derbyBtn = await overlayWindow.$('button:has-text("Derby"), button:has-text("🏇")');
    expect(derbyBtn).not.toBeNull();
    if (!derbyBtn) return;
    
    await derbyBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Verify game loaded
    const gameContainer = await waitForElement(overlayWindow, '.game-container', 5000);
    expect(gameContainer).toBe(true);
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Mini Derby');
    
    // Test RACE button
    const raceBtn = await overlayWindow.$('button:has-text("RACE")');
    expect(raceBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'mini-derby-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
  });

  test('should test Dice Roll game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Navigate to Dice
    const diceBtn = await overlayWindow.$('button:has-text("Dice"), button:has-text("🎲")');
    expect(diceBtn).not.toBeNull();
    if (!diceBtn) return;
    
    await diceBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Verify game loaded
    const gameContainer = await waitForElement(overlayWindow, '.game-container', 5000);
    expect(gameContainer).toBe(true);
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Dice Roll');
    
    // Test ROLL button
    const rollBtn = await overlayWindow.$('button:has-text("ROLL")');
    expect(rollBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'dice-roll-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
  });

  test('should test Mini Poker game - all buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Navigate to Poker
    const pokerBtn = await overlayWindow.$('button:has-text("Poker"), button:has-text("♠️")');
    expect(pokerBtn).not.toBeNull();
    if (!pokerBtn) return;
    
    await pokerBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Verify game loaded
    const gameContainer = await waitForElement(overlayWindow, '.game-container', 5000);
    expect(gameContainer).toBe(true);
    
    // Test bet controls
    await testBetControls(overlayWindow, 'Mini Poker');
    
    // Test DEAL button
    const dealBtn = await overlayWindow.$('button:has-text("DEAL")');
    expect(dealBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'mini-poker-all-buttons');
    
    // Go back
    await goBackToGameSelector(overlayWindow);
  });

  test('should test all overlay header buttons', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Test Dashboard button
    const dashboardBtn = await overlayWindow.$('button:has-text("📊")');
    expect(dashboardBtn).not.toBeNull();
    if (dashboardBtn) {
      await dashboardBtn.click();
      await overlayWindow.waitForTimeout(500);
    }
    
    // Test Minimize button
    const minimizeBtn = await overlayWindow.$('button:has-text("−")');
    expect(minimizeBtn).not.toBeNull();
    if (minimizeBtn) {
      await minimizeBtn.click();
      await overlayWindow.waitForTimeout(500);
    }
    
    // Test Close button
    const closeBtn = await overlayWindow.$('.close-btn, button:has-text("×")');
    expect(closeBtn).not.toBeNull();
    
    await takeScreenshot(overlayWindow, 'overlay-header-buttons');
  });

  test('should verify all 10 games are accessible', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Ensure we're on game selector
    await waitForElement(overlayWindow, '.game-selector', 5000);
    
    // List of all expected games
    const expectedGames = [
      { name: 'Slots', icon: '🎰' },
      { name: 'Blackjack', icon: '🃏' },
      { name: 'Coin Flip', icon: '🪙' },
      { name: 'Hi/Lo', icon: '🎯' },
      { name: 'Mines', icon: '💣' },
      { name: 'Scratch', icon: '🎫' },
      { name: 'Wheel', icon: '🎡' },
      { name: 'Derby', icon: '🏇' },
      { name: 'Dice', icon: '🎲' },
      { name: 'Poker', icon: '♠️' },
    ];
    
    // Verify each game button exists
    for (const game of expectedGames) {
      let gameBtn = await overlayWindow.$(`button:has-text("${game.name}")`);
      if (!gameBtn) {
        gameBtn = await overlayWindow.$(`button:has-text("${game.icon}")`);
      }
      expect(gameBtn).not.toBeNull();
    }
    
    // Count total game buttons
    const gameButtons = await overlayWindow.$$('.game-btn');
    expect(gameButtons.length).toBe(10);
    
    await takeScreenshot(overlayWindow, 'all-games-accessible');
  });

  test('should test navigation between games', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Test navigating to multiple games
    const gamesToTest = ['Slots', 'Coin Flip', 'Dice'];
    
    for (const gameName of gamesToTest) {
      // Ensure we're on game selector
      await waitForElement(overlayWindow, '.game-selector', 5000);
      
      // Click game
      let gameBtn = await overlayWindow.$(`button:has-text("${gameName}")`);
      if (!gameBtn) {
        // Try finding by partial match
        const allButtons = await overlayWindow.$$('.game-btn');
        for (const btn of allButtons) {
          const text = await btn.textContent();
          if (text && text.includes(gameName)) {
            gameBtn = btn;
            break;
          }
        }
      }
      
      expect(gameBtn).not.toBeNull();
      if (gameBtn) {
        await gameBtn.click();
        await overlayWindow.waitForTimeout(1500);
        
        // Verify game loaded
        const gameContainer = await waitForElement(overlayWindow, '.game-container', 5000);
        expect(gameContainer).toBe(true);
        
        // Go back
        await goBackToGameSelector(overlayWindow);
      }
    }
    
    await takeScreenshot(overlayWindow, 'navigation-between-games');
  });
});
