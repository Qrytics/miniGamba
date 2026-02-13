/**
 * Higher or Lower Game Logic
 * Guess if next card is higher or lower
 * Streak-based payouts with cash out feature
 */

import { GameEngine } from './base/GameEngine';

export interface Card {
  rank: number; // 1-13 (Ace=1, Jack=11, Queen=12, King=13)
  suit: '♠' | '♥' | '♦' | '♣';
  display: string; // e.g., "A♠", "K♥", "7♦"
}

export interface HigherOrLowerState {
  currentCard: Card | null;
  nextCard: Card | null;
  streak: number;
  bestStreak: number;
  canCashOut: boolean;
  currentMultiplier: number;
  potentialWinning: number;
  gameActive: boolean;
  lastGuess: 'higher' | 'lower' | null;
}

export class HigherOrLower extends GameEngine {
  private currentCard: Card | null = null;
  private nextCard: Card | null = null;
  private streak: number = 0;
  private bestStreak: number = 0;
  private canCashOut: boolean = false;
  private gameActive: boolean = false;
  private lastGuess: 'higher' | 'lower' | null = null;

  // Card rank names for display
  private readonly RANK_NAMES: Record<number, string> = {
    1: 'A',
    11: 'J',
    12: 'Q',
    13: 'K',
  };

  // Suits for standard 52-card deck
  private readonly SUITS: Array<'♠' | '♥' | '♦' | '♣'> = ['♠', '♥', '♦', '♣'];

  init(): void {
    this.reset();
    this.drawNewCard();
    this.gameActive = true;
    this.canCashOut = false;
  }

  /**
   * Make a guess if the next card is higher or lower
   */
  async guess(choice: 'higher' | 'lower'): Promise<boolean> {
    if (!this.gameActive || !this.currentCard) {
      return false;
    }

    this.lastGuess = choice;
    this.nextCard = this.drawCard();

    // Determine if guess was correct
    const isCorrect = this.checkGuess(choice);

    if (isCorrect) {
      this.streak++;
      
      // Update best streak
      if (this.streak > this.bestStreak) {
        this.bestStreak = this.streak;
      }

      // Move next card to current card for next round
      this.currentCard = this.nextCard;
      this.canCashOut = true;
      this.result = 'win';

      // Check if max streak reached (10+)
      if (this.streak >= 10) {
        // Auto cash out at max streak
        this.payout = this.calculatePayout();
        this.gameActive = false;
      }

      return true;
    } else {
      // Incorrect guess - lose everything
      this.result = 'loss';
      this.payout = 0;
      this.gameActive = false;
      this.canCashOut = false;
      return false;
    }
  }

  /**
   * Check if the guess was correct
   */
  private checkGuess(choice: 'higher' | 'lower'): boolean {
    if (!this.currentCard || !this.nextCard) return false;

    const currentRank = this.currentCard.rank;
    const nextRank = this.nextCard.rank;

    if (choice === 'higher') {
      return nextRank > currentRank;
    } else {
      return nextRank < currentRank;
    }
  }

  /**
   * Cash out current streak and take winnings
   */
  cashOut(): number {
    if (!this.canCashOut || this.streak === 0) {
      return 0;
    }

    this.payout = this.calculatePayout();
    this.result = 'win';
    this.gameActive = false;
    this.canCashOut = false;

    return this.payout;
  }

  /**
   * Calculate payout based on current streak
   * Streak of 1 = 1.2x, 2 = 1.5x, 3 = 2x, 5 = 5x, 8 = 15x, 10 = 50x
   */
  calculatePayout(): number {
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

    // For streaks beyond 10, cap at 50x
    const multiplier = multipliers[this.streak] || (this.streak >= 10 ? 50 : 1);
    return Math.floor(this.bet * multiplier);
  }

  /**
   * Get current multiplier for the streak
   */
  getCurrentMultiplier(): number {
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

    return multipliers[this.streak] || (this.streak >= 10 ? 50 : 1);
  }

  /**
   * Get potential winning amount if cashed out now
   */
  getPotentialWinning(): number {
    if (this.streak === 0) return 0;
    return this.calculatePayout();
  }

  /**
   * Get current game state
   */
  getState(): HigherOrLowerState {
    return {
      currentCard: this.currentCard,
      nextCard: this.nextCard,
      streak: this.streak,
      bestStreak: this.bestStreak,
      canCashOut: this.canCashOut,
      currentMultiplier: this.getCurrentMultiplier(),
      potentialWinning: this.getPotentialWinning(),
      gameActive: this.gameActive,
      lastGuess: this.lastGuess,
    };
  }

  /**
   * Get best streak achieved
   */
  getBestStreak(): number {
    return this.bestStreak;
  }

  /**
   * Reset game to initial state
   */
  reset(): void {
    this.currentCard = null;
    this.nextCard = null;
    this.streak = 0;
    this.canCashOut = false;
    this.gameActive = false;
    this.result = null;
    this.payout = 0;
    this.lastGuess = null;
  }

  /**
   * Draw a new card and set it as current
   */
  private drawNewCard(): void {
    this.currentCard = this.drawCard();
  }

  /**
   * Draw a random card from a standard 52-card deck
   */
  private drawCard(): Card {
    const rank = Math.floor(Math.random() * 13) + 1; // 1-13 (Ace to King)
    const suit = this.SUITS[Math.floor(Math.random() * this.SUITS.length)];

    return {
      rank,
      suit,
      display: this.getCardDisplay(rank, suit),
    };
  }

  /**
   * Get display string for a card
   */
  private getCardDisplay(rank: number, suit: '♠' | '♥' | '♦' | '♣'): string {
    const rankDisplay = this.RANK_NAMES[rank] || rank.toString();
    return `${rankDisplay}${suit}`;
  }

  /**
   * Check if game is currently active
   */
  isGameActive(): boolean {
    return this.gameActive;
  }

  /**
   * Check if player can cash out
   */
  canPlayerCashOut(): boolean {
    return this.canCashOut && this.streak > 0;
  }
}
