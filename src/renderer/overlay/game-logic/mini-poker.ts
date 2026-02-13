/**
 * Mini Poker Game Logic
 * Simplified 3-card poker against dealer
 * Includes peek feature to see dealer's card
 */

import { GameEngine } from './base/GameEngine';

export type PokerHandRank =
  | 'high-card'
  | 'pair'
  | 'flush'
  | 'straight'
  | 'three-of-kind'
  | 'straight-flush';

export interface Card {
  rank: number; // 2-14 (11=J, 12=Q, 13=K, 14=A)
  suit: '♠' | '♥' | '♦' | '♣';
  display: string;
}

export interface HandResult {
  rank: PokerHandRank;
  value: number; // Tiebreaker value
  description: string;
}

export type GameStage = 'betting' | 'decision' | 'reveal' | 'complete';

export interface MiniPokerState {
  playerHand: Card[];
  dealerHand: Card[];
  stage: GameStage;
  playerHandRank: HandResult | null;
  dealerHandRank: HandResult | null;
  peekedCard: Card | null;
  canPeek: boolean;
  peekCost: number;
}

export class MiniPoker extends GameEngine {
  private deck: Card[] = [];
  private playerHand: Card[] = [];
  private dealerHand: Card[] = [];
  private stage: GameStage = 'betting';
  private peekedCard: Card | null = null;
  private hasPeeked = false;

  private readonly PEEK_COST = 150;

  // Card rank names
  private readonly RANK_NAMES: Record<number, string> = {
    11: 'J',
    12: 'Q',
    13: 'K',
    14: 'A',
  };

  init(): void {
    this.reset();
    this.shuffleDeck();
  }

  /**
   * Deal cards to player and dealer
   */
  deal(): void {
    if (this.stage !== 'betting') return;
    
    this.playerHand = [this.drawCard(), this.drawCard(), this.drawCard()];
    this.dealerHand = [this.drawCard(), this.drawCard(), this.drawCard()];
    this.stage = 'decision';
  }

  /**
   * Player folds (loses bet)
   */
  fold(): void {
    if (this.stage !== 'decision') return;
    
    this.result = 'loss';
    this.payout = 0;
    this.stage = 'complete';
  }

  /**
   * Player plays (continues to showdown)
   */
  play(): void {
    if (this.stage !== 'decision') return;
    
    this.stage = 'reveal';
    this.determineWinner();
    this.stage = 'complete';
  }

  /**
   * Use peek feature to see one dealer card
   */
  peek(): Card | null {
    if (this.stage !== 'decision' || this.hasPeeked) return null;
    if (this.dealerHand.length === 0) return null;
    
    this.hasPeeked = true;
    this.peekedCard = this.dealerHand[0];
    return this.peekedCard;
  }

  /**
   * Can player peek
   */
  canPeek(): boolean {
    return this.stage === 'decision' && !this.hasPeeked;
  }

  /**
   * Get peek cost
   */
  getPeekCost(): number {
    return this.PEEK_COST;
  }

  /**
   * Get player's hand ranking
   */
  getPlayerHandRank(): HandResult | null {
    if (this.playerHand.length === 0) return null;
    return this.evaluateHand(this.playerHand);
  }

  /**
   * Get dealer's hand ranking
   */
  getDealerHandRank(): HandResult | null {
    if (this.dealerHand.length === 0 || this.stage === 'decision') return null;
    return this.evaluateHand(this.dealerHand);
  }

  /**
   * Determine winner and set result
   */
  private determineWinner(): void {
    const playerHandRank = this.evaluateHand(this.playerHand);
    const dealerHandRank = this.evaluateHand(this.dealerHand);
    
    // Compare hand rankings
    const rankOrder: Record<PokerHandRank, number> = {
      'high-card': 1,
      'pair': 2,
      'flush': 3,
      'straight': 4,
      'three-of-kind': 5,
      'straight-flush': 6,
    };
    
    const playerRankValue = rankOrder[playerHandRank.rank];
    const dealerRankValue = rankOrder[dealerHandRank.rank];
    
    if (playerRankValue > dealerRankValue) {
      this.result = 'win';
    } else if (playerRankValue < dealerRankValue) {
      this.result = 'loss';
    } else {
      // Same rank - compare tiebreaker values
      if (playerHandRank.value > dealerHandRank.value) {
        this.result = 'win';
      } else if (playerHandRank.value < dealerHandRank.value) {
        this.result = 'loss';
      } else {
        this.result = 'push';
      }
    }
  }

  /**
   * Evaluate a poker hand
   */
  private evaluateHand(hand: Card[]): HandResult {
    if (hand.length !== 3) {
      return { rank: 'high-card', value: 0, description: 'Invalid Hand' };
    }

    const ranks = hand.map(c => c.rank).sort((a, b) => b - a);
    const suits = hand.map(c => c.suit);
    
    const isFlush = suits.every(s => s === suits[0]);
    const isStraight = this.isStraight(ranks);
    const counts = this.countRanks(ranks);

    // Straight Flush
    if (isFlush && isStraight) {
      return {
        rank: 'straight-flush',
        value: ranks[0],
        description: `Straight Flush (${this.formatRank(ranks[0])} high)`,
      };
    }

    // Three of a Kind
    if (counts.threeOfKind) {
      return {
        rank: 'three-of-kind',
        value: counts.threeOfKind,
        description: `Three ${this.formatRank(counts.threeOfKind)}s`,
      };
    }

    // Straight
    if (isStraight) {
      return {
        rank: 'straight',
        value: ranks[0],
        description: `Straight (${this.formatRank(ranks[0])} high)`,
      };
    }

    // Flush
    if (isFlush) {
      return {
        rank: 'flush',
        value: ranks[0],
        description: `Flush (${this.formatRank(ranks[0])} high)`,
      };
    }

    // Pair
    if (counts.pair) {
      return {
        rank: 'pair',
        value: counts.pair * 100 + counts.highCard,
        description: `Pair of ${this.formatRank(counts.pair)}s`,
      };
    }

    // High Card
    return {
      rank: 'high-card',
      value: ranks[0] * 10000 + ranks[1] * 100 + ranks[2],
      description: `${this.formatRank(ranks[0])} high`,
    };
  }

  /**
   * Check if ranks form a straight
   */
  private isStraight(ranks: number[]): boolean {
    const sorted = [...ranks].sort((a, b) => a - b);
    
    // Check for regular straight
    if (sorted[2] - sorted[0] === 2 && sorted[1] - sorted[0] === 1) {
      return true;
    }
    
    // Check for A-2-3 straight (Ace low)
    if (sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 14) {
      return true;
    }
    
    return false;
  }

  /**
   * Count rank occurrences
   */
  private countRanks(ranks: number[]): { 
    pair: number | null; 
    threeOfKind: number | null; 
    highCard: number;
  } {
    const counts: Record<number, number> = {};
    
    for (const rank of ranks) {
      counts[rank] = (counts[rank] || 0) + 1;
    }
    
    let pair: number | null = null;
    let threeOfKind: number | null = null;
    let highCard = Math.max(...ranks);
    
    for (const [rank, count] of Object.entries(counts)) {
      const rankNum = parseInt(rank);
      if (count === 2) pair = rankNum;
      if (count === 3) threeOfKind = rankNum;
    }
    
    return { pair, threeOfKind, highCard };
  }

  /**
   * Format rank for display
   */
  private formatRank(rank: number): string {
    return this.RANK_NAMES[rank] || rank.toString();
  }

  calculatePayout(): number {
    if (this.result === 'loss') return 0;
    if (this.result === 'push') return this.bet; // Return bet on push
    
    // Win - payout based on hand strength
    const playerRank = this.evaluateHand(this.playerHand);
    
    const payouts: Record<PokerHandRank, number> = {
      'high-card': 2,
      'pair': 3,
      'flush': 4,
      'straight': 6,
      'three-of-kind': 8,
      'straight-flush': 15,
    };
    
    return Math.floor(this.bet * payouts[playerRank.rank]);
  }

  getState(): MiniPokerState {
    return {
      playerHand: [...this.playerHand],
      dealerHand: this.stage === 'reveal' || this.stage === 'complete' 
        ? [...this.dealerHand] 
        : [],
      stage: this.stage,
      playerHandRank: this.getPlayerHandRank(),
      dealerHandRank: this.getDealerHandRank(),
      peekedCard: this.peekedCard,
      canPeek: this.canPeek(),
      peekCost: this.PEEK_COST,
    };
  }

  reset(): void {
    this.playerHand = [];
    this.dealerHand = [];
    this.stage = 'betting';
    this.peekedCard = null;
    this.hasPeeked = false;
    this.result = null;
    this.payout = 0;
    this.shuffleDeck();
  }

  /**
   * Create and shuffle a standard 52-card deck
   */
  private shuffleDeck(): void {
    const suits: Array<'♠' | '♥' | '♦' | '♣'> = ['♠', '♥', '♦', '♣'];
    const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 11=J, 12=Q, 13=K, 14=A
    
    this.deck = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        this.deck.push({
          rank,
          suit,
          display: this.getCardDisplay(rank, suit),
        });
      }
    }
    
    // Fisher-Yates shuffle
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  /**
   * Draw a card from the deck
   */
  private drawCard(): Card {
    if (this.deck.length === 0) {
      this.shuffleDeck();
    }
    return this.deck.pop()!;
  }

  /**
   * Get display string for a card
   */
  private getCardDisplay(rank: number, suit: '♠' | '♥' | '♦' | '♣'): string {
    const rankDisplay = this.RANK_NAMES[rank] || rank.toString();
    return `${rankDisplay}${suit}`;
  }

  /**
   * Get current game stage
   */
  getStage(): GameStage {
    return this.stage;
  }

  /**
   * Get player hand
   */
  getPlayerHand(): Card[] {
    return [...this.playerHand];
  }

  /**
   * Get dealer hand (only visible after reveal)
   */
  getDealerHand(): Card[] {
    if (this.stage === 'reveal' || this.stage === 'complete') {
      return [...this.dealerHand];
    }
    return [];
  }

  /**
   * Get peeked card
   */
  getPeekedCard(): Card | null {
    return this.peekedCard;
  }

  /**
   * Has player peeked
   */
  hasPeekedCard(): boolean {
    return this.hasPeeked;
  }
}
