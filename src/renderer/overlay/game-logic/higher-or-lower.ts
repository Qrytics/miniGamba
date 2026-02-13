/**
 * Higher or Lower Game Logic
 * Guess if next card is higher or lower
 */

import { GameEngine } from './base/GameEngine';

export class HigherOrLower extends GameEngine {
  private currentCard: number = 0;
  private nextCard: number = 0;
  private streak: number = 0;
  private canCashOut: boolean = false;

  init(): void {
    this.reset();
    this.drawNewCard();
  }

  /**
   * Make a guess
   * TODO: Implement guess logic with streak tracking
   */
  guess(choice: 'higher' | 'lower'): boolean {
    this.nextCard = this.getRandomCard();
    
    const isCorrect =
      (choice === 'higher' && this.nextCard > this.currentCard) ||
      (choice === 'lower' && this.nextCard < this.currentCard);
    
    if (isCorrect) {
      this.streak++;
      this.currentCard = this.nextCard;
      this.canCashOut = true;
      this.result = 'win';
      return true;
    } else {
      this.result = 'loss';
      return false;
    }
  }

  /**
   * Cash out current streak
   * TODO: Implement cash out with multiplier
   */
  cashOut(): number {
    if (!this.canCashOut) return 0;
    
    this.payout = this.calculatePayout();
    return this.payout;
  }

  calculatePayout(): number {
    // TODO: Implement streak-based multipliers
    // Streak of 3 = 2x, 5 = 5x, 8 = 15x, 10 = 50x
    const multipliers: Record<number, number> = {
      1: 1.2,
      2: 1.5,
      3: 2,
      4: 3,
      5: 5,
      6: 8,
      7: 12,
      8: 15,
      9: 30,
      10: 50,
    };
    
    const multiplier = multipliers[this.streak] || 50;
    return this.bet * multiplier;
  }

  getState(): any {
    return {
      currentCard: this.currentCard,
      streak: this.streak,
      canCashOut: this.canCashOut,
    };
  }

  reset(): void {
    this.currentCard = 0;
    this.nextCard = 0;
    this.streak = 0;
    this.canCashOut = false;
    this.result = null;
  }

  private drawNewCard(): void {
    this.currentCard = this.getRandomCard();
  }

  private getRandomCard(): number {
    return Math.floor(Math.random() * 13) + 1; // 1-13 (A-K)
  }
}
