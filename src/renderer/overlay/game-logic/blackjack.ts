/**
 * Blackjack Game Logic
 * Full casino blackjack rules with natural 2.5x blackjack, dealer AI, and shoe management.
 */

import { GameEngine } from './base/GameEngine';

export class Blackjack extends GameEngine {
  private deck: string[] = [];
  private playerHand: string[] = [];
  private dealerHand: string[] = [];
  private stage: 'betting' | 'playing' | 'dealer' | 'complete' = 'betting';
  private isBlackjack = false;

  init(): void {
    this.reset();
    this.shuffleDeck();
  }

  /**
   * Start a new hand
   */
  deal(): void {
    if (this.deck.length < 10) {
      this.shuffleDeck();
    }

    this.playerHand = [this.drawCard(), this.drawCard()];
    this.dealerHand = [this.drawCard(), this.drawCard()];
    this.stage = 'playing';
    this.isBlackjack = false;

    // Check for natural blackjack
    const playerVal = this.getHandValue(this.playerHand);
    const dealerVal = this.getHandValue(this.dealerHand);

    if (playerVal === 21) {
      this.isBlackjack = true;
      this.stage = 'complete';
      if (dealerVal === 21) {
        this.result = 'push';
      } else {
        this.result = 'win';
      }
    }
  }

  /**
   * Player hits (draws another card)
   */
  hit(): void {
    if (this.stage !== 'playing') return;

    this.playerHand.push(this.drawCard());

    // Check for bust
    if (this.getHandValue(this.playerHand) > 21) {
      this.result = 'loss';
      this.stage = 'complete';
    }
  }

  /**
   * Player stands (ends their turn)
   */
  stand(): void {
    if (this.stage !== 'playing') return;

    this.stage = 'dealer';
    this.dealerPlay();
  }

  /**
   * Dealer plays their hand (hits on soft 16, stands on 17)
   */
  private dealerPlay(): void {
    while (this.getHandValue(this.dealerHand) < 17) {
      this.dealerHand.push(this.drawCard());
    }

    this.stage = 'complete';
    this.determineWinner();
  }

  /**
   * Determine winner
   */
  private determineWinner(): void {
    const playerValue = this.getHandValue(this.playerHand);
    const dealerValue = this.getHandValue(this.dealerHand);

    if (dealerValue > 21 || playerValue > dealerValue) {
      this.result = 'win';
    } else if (playerValue === dealerValue) {
      this.result = 'push';
    } else {
      this.result = 'loss';
    }
  }

  calculatePayout(): number {
    if (this.result === 'win') {
      if (this.isBlackjack) {
        return Math.floor(this.bet * 2.5); // Natural 3:2 payout
      }
      return this.bet * 2;
    } else if (this.result === 'push') {
      return this.bet; // Push returns original bet
    }
    return 0;
  }

  getState(): any {
    const isPlaying = this.stage === 'playing';
    return {
      playerHand: this.playerHand,
      dealerHand: this.dealerHand,
      playerScore: this.getHandValue(this.playerHand),
      dealerScore: this.getHandValue(this.dealerHand),
      visibleDealerScore: isPlaying && this.dealerHand.length > 0
        ? this.getHandValue([this.dealerHand[0]])
        : this.getHandValue(this.dealerHand),
      stage: this.stage,
      blackjack: this.isBlackjack,
    };
  }

  reset(): void {
    this.playerHand = [];
    this.dealerHand = [];
    this.stage = 'betting';
    this.result = null;
    this.isBlackjack = false;
  }

  private shuffleDeck(): void {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    this.deck = [];
    // 2-deck shoe for casino authenticity
    for (let shoe = 0; shoe < 2; shoe++) {
      for (const suit of suits) {
        for (const rank of ranks) {
          this.deck.push(rank + suit);
        }
      }
    }

    // Fisher-Yates shuffle
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  private drawCard(): string {
    if (this.deck.length === 0) {
      this.shuffleDeck();
    }
    return this.deck.pop() || 'A♠';
  }

  private getHandValue(hand: string[]): number {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
      const rank = card.slice(0, -1);
      if (rank === 'A') {
        aces++;
        value += 11;
      } else if (['J', 'Q', 'K'].includes(rank)) {
        value += 10;
      } else {
        value += parseInt(rank, 10) || 10;
      }
    }

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  }
}
