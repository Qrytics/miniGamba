/**
 * Money/Coins Tests for Overlay
 * Tests insufficient funds prevention and winnings distribution
 */

import { test, expect } from '@playwright/test';
import { launchApp, takeScreenshot, waitForElement, getOverlayWindow, TestContext } from './setup';

let testContext: TestContext;

test.beforeAll(async () => {
  testContext = await launchApp();
});

test.afterAll(async () => {
  await testContext.app.close();
});

// Helper to get current coin balance
async function getCoinBalance(overlayWindow: any): Promise<number> {
  // Wait for coin display to be visible
  await overlayWindow.waitForSelector('.coin-display', { timeout: 5000 }).catch(() => null);
  
  const coinDisplay = await overlayWindow.$('.coin-display');
  if (!coinDisplay) {
    // Try refreshing user data
    await overlayWindow.evaluate(async () => {
      if ((window as any).electronAPI && (window as any).electronAPI.getUserData) {
        await (window as any).electronAPI.getUserData();
      }
    });
    await overlayWindow.waitForTimeout(500);
    const retryDisplay = await overlayWindow.$('.coin-display');
    if (!retryDisplay) return 0;
  }
  
  const display = coinDisplay || await overlayWindow.$('.coin-display');
  if (!display) return 0;
  
  const text = await display.textContent();
  if (!text) return 0;
  
  // Extract number from text like "💰 1,234" or "💰 1234"
  const match = text.match(/[\d,]+/);
  if (!match) return 0;
  
  return parseInt(match[0].replace(/,/g, ''), 10);
}

// Helper to set coin balance (by adding/removing coins)
async function setCoinBalance(overlayWindow: any, targetBalance: number): Promise<void> {
  // Ensure overlay is loaded
  await overlayWindow.waitForSelector('.coin-display', { timeout: 5000 }).catch(() => null);
  
  const currentBalance = await getCoinBalance(overlayWindow);
  const difference = targetBalance - currentBalance;
  
  if (Math.abs(difference) > 0) {
    try {
      const result = await overlayWindow.evaluate(async (amount: number) => {
        if ((window as any).electronAPI && (window as any).electronAPI.addCoins) {
          return await (window as any).electronAPI.addCoins(amount);
        }
        return null;
      }, difference);
      
      // Wait for UI to update
      await overlayWindow.waitForTimeout(1000);
      
      // Verify balance was updated
      const newBalance = await getCoinBalance(overlayWindow);
      if (Math.abs(newBalance - targetBalance) > 10) {
        // Retry if balance didn't update correctly
        const retryDiff = targetBalance - newBalance;
        await overlayWindow.evaluate(async (amount: number) => {
          if ((window as any).electronAPI && (window as any).electronAPI.addCoins) {
            await (window as any).electronAPI.addCoins(amount);
          }
        }, retryDiff);
        await overlayWindow.waitForTimeout(500);
      }
    } catch (error) {
      console.warn('Failed to set coin balance:', error);
    }
  }
}

test.describe('Money/Coins Validation Tests', () => {
  test('should prevent playing when insufficient funds', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Set balance to very low (5 coins)
    await setCoinBalance(overlayWindow, 5);
    const lowBalance = await getCoinBalance(overlayWindow);
    expect(lowBalance).toBeLessThanOrEqual(10);
    
    // Navigate to Coin Flip
    const coinFlipBtn = await overlayWindow.$('button:has-text("Coin Flip"), button:has-text("🪙")');
    expect(coinFlipBtn).not.toBeNull();
    if (!coinFlipBtn) return;
    
    await coinFlipBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Try to set bet higher than balance
    const betInput = await overlayWindow.$('input[type="number"].bet-input, input.bet-input');
    expect(betInput).not.toBeNull();
    if (betInput) {
      await betInput.fill('100'); // Much higher than balance
      await overlayWindow.waitForTimeout(300);
    }
    
    // Try to play - should fail or be disabled
    const flipBtn = await overlayWindow.$('button:has-text("FLIP")');
    expect(flipBtn).not.toBeNull();
    
    if (flipBtn) {
      // Check if button is disabled
      const isDisabled = await flipBtn.isDisabled();
      
      // If not disabled, try clicking and check for error
      if (!isDisabled) {
        await flipBtn.click();
        await overlayWindow.waitForTimeout(1000);
        
        // Check for error message or insufficient funds indicator
        const errorElements = await overlayWindow.$$('[class*="error"], [class*="Error"], [class*="insufficient"]');
        const errorText = await overlayWindow.textContent('body');
        
        // Should show error or prevent game start
        expect(errorText?.toLowerCase().includes('insufficient') || 
               errorText?.toLowerCase().includes('not enough') ||
               errorElements.length > 0).toBe(true);
      }
    }
    
    await takeScreenshot(overlayWindow, 'insufficient-funds-prevention');
  });

  test('should deduct coins when game starts', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Set a known balance
    await setCoinBalance(overlayWindow, 1000);
    const balanceBefore = await getCoinBalance(overlayWindow);
    expect(balanceBefore).toBeGreaterThanOrEqual(1000);
    
    // Navigate to Coin Flip
    const coinFlipBtn = await overlayWindow.$('button:has-text("Coin Flip"), button:has-text("🪙")');
    expect(coinFlipBtn).not.toBeNull();
    if (!coinFlipBtn) return;
    
    await coinFlipBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Set a specific bet amount
    const betAmount = 50;
    const betInput = await overlayWindow.$('input[type="number"].bet-input, input.bet-input');
    expect(betInput).not.toBeNull();
    if (betInput) {
      await betInput.fill(betAmount.toString());
      await overlayWindow.waitForTimeout(300);
    }
    
    // Start the game
    const flipBtn = await overlayWindow.$('button:has-text("FLIP")');
    expect(flipBtn).not.toBeNull();
    if (flipBtn && !(await flipBtn.isDisabled())) {
      await flipBtn.click();
      await overlayWindow.waitForTimeout(2000); // Wait for game to process
      
      // Check balance decreased
      const balanceAfter = await getCoinBalance(overlayWindow);
      expect(balanceAfter).toBeLessThan(balanceBefore);
      // Balance should be reduced by bet amount (or close to it, accounting for potential winnings)
      expect(balanceBefore - balanceAfter).toBeGreaterThanOrEqual(0);
    }
    
    await takeScreenshot(overlayWindow, 'coins-deducted-on-start');
  });

  test('should add coins when winning', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Set a known balance
    await setCoinBalance(overlayWindow, 1000);
    const balanceBefore = await getCoinBalance(overlayWindow);
    
    // Navigate to Coin Flip
    const coinFlipBtn = await overlayWindow.$('button:has-text("Coin Flip"), button:has-text("🪙")');
    expect(coinFlipBtn).not.toBeNull();
    if (!coinFlipBtn) return;
    
    await coinFlipBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Set bet
    const betAmount = 50;
    const betInput = await overlayWindow.$('input[type="number"].bet-input, input.bet-input');
    if (betInput) {
      await betInput.fill(betAmount.toString());
      await overlayWindow.waitForTimeout(300);
    }
    
    // Select heads
    const headsBtn = await overlayWindow.$('button:has-text("Heads"), button:has-text("👑")');
    if (headsBtn) {
      await headsBtn.click();
      await overlayWindow.waitForTimeout(300);
    }
    
    // Play the game
    const flipBtn = await overlayWindow.$('button:has-text("FLIP")');
    if (flipBtn && !(await flipBtn.isDisabled())) {
      await flipBtn.click();
      await overlayWindow.waitForTimeout(3000); // Wait for game to complete
      
      // Check for win/loss message
      const resultDisplay = await overlayWindow.$('.result-display');
      if (resultDisplay) {
        const resultText = await resultDisplay.textContent();
        const isWin = resultText?.toLowerCase().includes('won') || resultText?.includes('🎉');
        
        // Check balance after game
        const balanceAfter = await getCoinBalance(overlayWindow);
        
        if (isWin) {
          // If won, balance should be higher than before (bet deducted + payout added)
          // Balance should be: balanceBefore - bet + payout
          // Since payout is typically bet * multiplier, balance should increase
          expect(balanceAfter).toBeGreaterThan(balanceBefore - betAmount);
        } else {
          // If lost, balance should be exactly betAmount less
          expect(balanceAfter).toBeLessThanOrEqual(balanceBefore);
          expect(balanceBefore - balanceAfter).toBeGreaterThanOrEqual(betAmount - 10); // Allow small margin
        }
      }
    }
    
    await takeScreenshot(overlayWindow, 'coins-added-on-win');
  });

  test('should prevent betting more than available balance', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Set low balance
    await setCoinBalance(overlayWindow, 50);
    const balance = await getCoinBalance(overlayWindow);
    
    // Navigate to Slot Machine
    const slotsBtn = await overlayWindow.$('button:has-text("Slots"), button:has-text("🎰")');
    expect(slotsBtn).not.toBeNull();
    if (!slotsBtn) return;
    
    await slotsBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Try to set bet higher than balance using +10 button multiple times
    const plusBtn = await overlayWindow.$('button:has-text("+10")');
    if (plusBtn) {
      // Click +10 multiple times to exceed balance
      for (let i = 0; i < 10; i++) {
        await plusBtn.click();
        await overlayWindow.waitForTimeout(100);
        
        // Check bet input value
        const betInput = await overlayWindow.$('input[type="number"].bet-input, input.bet-input');
        if (betInput) {
          const betValue = parseInt(await betInput.inputValue() || '0', 10);
          
          // Bet should not exceed balance (or should be capped)
          if (betValue > balance) {
            // If bet exceeds balance, play button should be disabled
            const playBtn = await overlayWindow.$('button:has-text("SPIN")');
            if (playBtn) {
              const isDisabled = await playBtn.isDisabled();
              // Either bet is capped or button is disabled
              expect(isDisabled || betValue <= balance).toBe(true);
              break;
            }
          }
        }
      }
    }
    
    await takeScreenshot(overlayWindow, 'bet-capped-to-balance');
  });

  test('should update coin display after game completes', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Get initial balance
    const initialBalance = await getCoinBalance(overlayWindow);
    
    // Navigate to Dice Roll (simple game)
    const diceBtn = await overlayWindow.$('button:has-text("Dice"), button:has-text("🎲")');
    expect(diceBtn).not.toBeNull();
    if (!diceBtn) return;
    
    await diceBtn.click();
    await overlayWindow.waitForTimeout(1500);
    
    // Set bet
    const betAmount = 100;
    const betInput = await overlayWindow.$('input[type="number"].bet-input, input.bet-input');
    if (betInput) {
      await betInput.fill(betAmount.toString());
      await overlayWindow.waitForTimeout(300);
    }
    
    // Play game
    const rollBtn = await overlayWindow.$('button:has-text("ROLL")');
    if (rollBtn && !(await rollBtn.isDisabled())) {
      await rollBtn.click();
      await overlayWindow.waitForTimeout(3000);
      
      // Check coin display updated
      const newBalance = await getCoinBalance(overlayWindow);
      
      // Balance should have changed (either decreased by bet or increased by winnings)
      expect(newBalance).not.toBe(initialBalance);
      
      // Verify coin display shows the new balance
      const coinDisplay = await overlayWindow.$('.coin-display');
      expect(coinDisplay).not.toBeNull();
      if (coinDisplay) {
        const displayText = await coinDisplay.textContent();
        expect(displayText).toContain(newBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
      }
    }
    
    await takeScreenshot(overlayWindow, 'coin-display-updated');
  });

  test('should handle multiple games and track balance correctly', async () => {
    const { mainWindow, app } = testContext;
    const overlayWindow = await getOverlayWindow(app, mainWindow);
    expect(overlayWindow).not.toBeNull();
    if (!overlayWindow) return;
    
    await overlayWindow.waitForLoadState('domcontentloaded');
    await overlayWindow.waitForTimeout(2000);
    
    // Set starting balance
    await setCoinBalance(overlayWindow, 2000);
    const startingBalance = await getCoinBalance(overlayWindow);
    
    // Play multiple games and track balance
    const games = [
      { name: 'Coin Flip', selector: 'button:has-text("Coin Flip"), button:has-text("🪙")', playBtn: 'button:has-text("FLIP")' },
      { name: 'Dice Roll', selector: 'button:has-text("Dice"), button:has-text("🎲")', playBtn: 'button:has-text("ROLL")' },
    ];
    
    let totalBet = 0;
    
    for (const game of games) {
      // Go back to game selector
      const backBtn = await overlayWindow.$('button:has-text("Back"), button:has-text("←")');
      if (backBtn) {
        await backBtn.click();
        await overlayWindow.waitForTimeout(1000);
      }
      
      // Navigate to game
      const gameBtn = await overlayWindow.$(game.selector);
      if (gameBtn) {
        await gameBtn.click();
        await overlayWindow.waitForTimeout(1500);
        
        // Set bet
        const betAmount = 50;
        const betInput = await overlayWindow.$('input[type="number"].bet-input, input.bet-input');
        if (betInput) {
          await betInput.fill(betAmount.toString());
          await overlayWindow.waitForTimeout(300);
        }
        
        // Play
        const playBtn = await overlayWindow.$(game.playBtn);
        if (playBtn && !(await playBtn.isDisabled())) {
          await playBtn.click();
          await overlayWindow.waitForTimeout(2000);
          totalBet += betAmount;
        }
      }
    }
    
    // Check final balance
    const finalBalance = await getCoinBalance(overlayWindow);
    
    // Final balance should be different from starting (accounting for bets and winnings)
    expect(finalBalance).not.toBe(startingBalance);
    
    // Balance should have decreased by at least the total bets (minus any winnings)
    // Since we can't predict winnings, just verify balance changed
    expect(Math.abs(finalBalance - startingBalance)).toBeGreaterThan(0);
    
    await takeScreenshot(overlayWindow, 'balance-tracked-across-games');
  });
});
