/**
 * Blackjack Game Logic
 * Simplified single-hand blackjack
 */

import { GameEngine } from './base/GameEngine';

export class Blackjack extends GameEngine {
  private deck: string[] = [];
  private playerHand: string[] = [];
  private dealerHand: string[] = [];
  private stage: 'betting' | 'playing' | 'dealer' | 'complete' = 'betting';

  init(): void {
    this.reset();
    this.shuffleDeck();
  }

  /**
   * Start a new hand
   * TODO: Implement dealing cards
   */
  deal(): void {
    this.playerHand = [this.drawCard(), this.drawCard()];
    this.dealerHand = [this.drawCard(), this.drawCard()];
    this.stage = 'playing';
    
    // TODO: Check for natural blackjack
  }

  /**
   * Player hits (draws another card)
   * TODO: Implement hit logic
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
   * TODO: Implement dealer logic
   */
  stand(): void {
    if (this.stage !== 'playing') return;
    
    this.stage = 'dealer';
    this.dealerPlay();
  }

  /**
   * Dealer plays their hand
   * TODO: Implement dealer AI (hit on 16, stand on 17)
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
    // TODO: Implement payout calculation
    if (this.result === 'win') {
      // TODO: Check for natural blackjack (2.5x)
      return this.bet * 2;
    } else if (this.result === 'push') {
      return this.bet; // Return bet
    }
    return 0;
  }

  getState(): any {
    return {
      playerHand: this.playerHand,
      dealerHand: this.dealerHand,
      playerScore: this.getHandValue(this.playerHand),
      dealerScore: this.getHandValue(this.dealerHand),
      stage: this.stage,
    };
  }

  reset(): void {
    this.playerHand = [];
    this.dealerHand = [];
    this.stage = 'betting';
    this.result = null;
  }

  private shuffleDeck(): void {
    // TODO: Create and shuffle deck
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    this.deck = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        this.deck.push(rank + suit);
      }
    }
    
    // Shuffle
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  private drawCard(): string {
    // TODO: Handle deck running out
    return this.deck.pop() || 'A♠';
  }

  private getHandValue(hand: string[]): number {
    // TODO: Implement proper ace handling (1 or 11)
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
        value += parseInt(rank);
      }
    }
    
    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    
    return value;
  }
}
