/**
 * Coin Flip Game Logic
 * Simple heads or tails bet
 */

import { GameEngine } from './base/GameEngine';

export class CoinFlip extends GameEngine {
  private choice: 'heads' | 'tails' | null = null;
  private result: 'heads' | 'tails' | null = null;
  private flipping = false;

  init(): void {
    this.reset();
  }

  /**
   * Make a choice and flip the coin
   * TODO: Implement flip animation
   */
  flip(choice: 'heads' | 'tails'): void {
    if (this.flipping) return;
    
    this.choice = choice;
    this.flipping = true;
    
    // TODO: Animate coin flip
    setTimeout(() => {
      this.result = Math.random() < 0.5 ? 'heads' : 'tails';
      this.flipping = false;
      this.checkWin();
    }, 1000);
  }

  private checkWin(): void {
    if (this.choice === this.result) {
      this.result = 'win';
    } else {
      this.result = 'loss';
    }
  }

  calculatePayout(): number {
    // TODO: Implement payout
    if (this.result === 'win') {
      return this.bet * 2; // 2x on correct guess
    }
    return 0;
  }

  getState(): any {
    return {
      choice: this.choice,
      result: this.result,
      flipping: this.flipping,
    };
  }

  reset(): void {
    this.choice = null;
    this.result = null;
    this.flipping = false;
  }
}
