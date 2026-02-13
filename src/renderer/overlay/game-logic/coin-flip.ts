/**
 * Coin Flip Game Logic
 * Simple heads or tails bet with optional Martingale mode
 */

import { GameEngine } from './base/GameEngine';

export interface CoinFlipState {
  choice: 'heads' | 'tails' | null;
  coinResult: 'heads' | 'tails' | null;
  flipping: boolean;
  animationFrame: number;
  martingaleEnabled: boolean;
  martingaleStreak: number;
  nextBet: number | null;
}

export class CoinFlip extends GameEngine {
  // Animation constants
  private static readonly ANIMATION_DURATION = 1500; // milliseconds
  private static readonly FRAME_INTERVAL = 100; // milliseconds
  private static readonly TOTAL_FRAMES = CoinFlip.ANIMATION_DURATION / CoinFlip.FRAME_INTERVAL;

  private choice: 'heads' | 'tails' | null = null;
  private coinResult: 'heads' | 'tails' | null = null;
  private flipping = false;
  private animationFrame = 0;
  private martingaleEnabled = false;
  private martingaleStreak = 0;
  private initialBet = 0;

  init(): void {
    this.reset();
  }

  /**
   * Enable or disable Martingale mode
   */
  setMartingaleMode(enabled: boolean): void {
    this.martingaleEnabled = enabled;
    if (!enabled) {
      this.martingaleStreak = 0;
    }
  }

  /**
   * Get Martingale mode status
   */
  isMartingaleEnabled(): boolean {
    return this.martingaleEnabled;
  }

  /**
   * Get current Martingale streak
   */
  getMartingaleStreak(): number {
    return this.martingaleStreak;
  }

  /**
   * Get next bet amount (for Martingale mode)
   */
  getNextBet(): number | null {
    if (!this.martingaleEnabled) {
      return null;
    }
    
    if (this.result === 'loss' && this.martingaleStreak > 0) {
      return this.bet * 2;
    }
    
    return null;
  }

  /**
   * Make a choice and flip the coin
   */
  async flip(choice: 'heads' | 'tails'): Promise<void> {
    if (this.flipping) return;
    
    this.choice = choice;
    this.flipping = true;
    this.coinResult = null;
    this.result = null;
    this.animationFrame = 0;

    // Store initial bet for Martingale mode
    if (this.martingaleStreak === 0) {
      this.initialBet = this.bet;
    }
    
    // Simulate coin flip animation
    const animationPromise = new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        this.animationFrame++;
        
        if (this.animationFrame >= CoinFlip.TOTAL_FRAMES) {
          clearInterval(interval);
          resolve();
        }
      }, CoinFlip.FRAME_INTERVAL);
    });
    
    await animationPromise;
    
    // Determine result (fair 50/50 odds)
    this.coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
    this.flipping = false;
    this.animationFrame = 0;
    
    this.checkWin();
  }

  /**
   * Check if the player won
   */
  private checkWin(): void {
    if (this.choice === this.coinResult) {
      this.result = 'win';
      
      // Reset Martingale streak on win
      if (this.martingaleEnabled) {
        this.martingaleStreak = 0;
      }
    } else {
      this.result = 'loss';
      
      // Increment Martingale streak on loss
      if (this.martingaleEnabled) {
        this.martingaleStreak++;
      }
    }
  }

  /**
   * Calculate payout (2x on correct guess)
   */
  calculatePayout(): number {
    if (this.result === 'win') {
      return this.bet * 2; // 2x payout on correct guess
    }
    return 0;
  }

  /**
   * Get current game state
   */
  getState(): CoinFlipState {
    return {
      choice: this.choice,
      coinResult: this.coinResult,
      flipping: this.flipping,
      animationFrame: this.animationFrame,
      martingaleEnabled: this.martingaleEnabled,
      martingaleStreak: this.martingaleStreak,
      nextBet: this.getNextBet(),
    };
  }

  /**
   * Reset game to initial state
   */
  reset(): void {
    this.choice = null;
    this.coinResult = null;
    this.flipping = false;
    this.animationFrame = 0;
    this.result = null;
  }

  /**
   * Reset Martingale streak
   */
  resetMartingale(): void {
    this.martingaleStreak = 0;
    this.initialBet = 0;
  }

  /**
   * Apply Martingale bet doubling
   */
  applyMartingale(): void {
    if (this.martingaleEnabled && this.result === 'loss' && this.martingaleStreak > 0) {
      this.bet = this.bet * 2;
    }
  }

  /**
   * Get the animation progress (0-1)
   */
  getAnimationProgress(): number {
    if (!this.flipping) return 0;
    return Math.min(this.animationFrame / CoinFlip.TOTAL_FRAMES, 1);
  }
}
