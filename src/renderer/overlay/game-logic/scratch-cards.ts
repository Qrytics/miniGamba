/**
 * Scratch Cards Game Logic
 * Scratch off panels to reveal matching symbols for prizes
 * Different tiers with better odds and cosmetic unlocks
 */

import { GameEngine } from './base/GameEngine';

export type CardTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Symbol {
  icon: string;
  name: string;
  value: number; // Prize multiplier
}

export interface ScratchCardsState {
  tier: CardTier;
  cost: number;
  panels: string[];
  scratchedPanels: boolean[];
  allScratched: boolean;
  matchingSymbols: { symbol: string; count: number; indexes: number[] }[];
  prize: number;
  cosmeticUnlock: string | null;
  isWin: boolean;
}

export class ScratchCards extends GameEngine {
  private tier: CardTier = 'bronze';
  private panels: string[] = new Array(9).fill('');
  private scratchedPanels: boolean[] = new Array(9).fill(false);
  private prize: number = 0;
  private cosmeticUnlock: string | null = null;

  // Card costs by tier
  private readonly CARD_COSTS: Record<CardTier, number> = {
    bronze: 50,
    silver: 200,
    gold: 1000,
    diamond: 5000,
  };

  // Symbol sets by tier
  private readonly TIER_SYMBOLS: Record<CardTier, Symbol[]> = {
    bronze: [
      { icon: '🍒', name: 'Cherry', value: 2 },
      { icon: '🍋', name: 'Lemon', value: 3 },
      { icon: '🍊', name: 'Orange', value: 5 },
      { icon: '⭐', name: 'Star', value: 10 },
      { icon: '💰', name: 'Money Bag', value: 20 },
    ],
    silver: [
      { icon: '💚', name: 'Emerald', value: 3 },
      { icon: '💙', name: 'Sapphire', value: 5 },
      { icon: '💜', name: 'Amethyst', value: 8 },
      { icon: '❤️', name: 'Ruby', value: 15 },
      { icon: '💎', name: 'Diamond', value: 30 },
    ],
    gold: [
      { icon: '🔷', name: 'Crystal', value: 5 },
      { icon: '🌟', name: 'Shining Star', value: 10 },
      { icon: '👑', name: 'Crown', value: 20 },
      { icon: '🏆', name: 'Trophy', value: 40 },
      { icon: '💎', name: 'Diamond', value: 100 },
    ],
    diamond: [
      { icon: '🔮', name: 'Crystal Ball', value: 10 },
      { icon: '💠', name: 'Rare Gem', value: 25 },
      { icon: '🎆', name: 'Fireworks', value: 50 },
      { icon: '🌈', name: 'Rainbow', value: 100 },
      { icon: '🦄', name: 'Unicorn', value: 500 },
    ],
  };

  // Cosmetic unlocks (rare drops)
  private readonly COSMETICS = [
    '🎨 Golden Frame',
    '🎭 Special Avatar',
    '✨ Sparkle Effect',
    '🔥 Fire Trail',
    '💫 Star Badge',
    '🌙 Moon Theme',
    '🎪 Carnival Background',
    '🎩 Top Hat Icon',
  ];

  init(): void {
    this.reset();
  }

  /**
   * Buy a scratch card of specified tier
   */
  buyCard(tier: CardTier): boolean {
    const cost = this.CARD_COSTS[tier];
    this.bet = cost;
    this.tier = tier;
    this.generateCard();
    return true;
  }

  /**
   * Get cost of a tier
   */
  getCardCost(tier: CardTier): number {
    return this.CARD_COSTS[tier];
  }

  /**
   * Scratch a panel at index
   */
  scratch(index: number): boolean {
    if (index < 0 || index >= 9) return false;
    if (this.scratchedPanels[index]) return false;
    
    this.scratchedPanels[index] = true;
    
    // Check if all panels scratched
    if (this.scratchedPanels.every(p => p)) {
      this.evaluateCard();
    }

    return true;
  }

  /**
   * Auto-scratch all panels instantly
   */
  autoScratch(): void {
    for (let i = 0; i < this.panels.length; i++) {
      this.scratchedPanels[i] = true;
    }
    this.evaluateCard();
  }

  /**
   * Check if panel is scratched
   */
  isPanelScratched(index: number): boolean {
    return this.scratchedPanels[index] || false;
  }

  /**
   * Get symbol at panel index
   */
  getPanel(index: number): string | null {
    if (!this.scratchedPanels[index]) return null;
    return this.panels[index];
  }

  /**
   * Check if all panels are scratched
   */
  isFullyScratched(): boolean {
    return this.scratchedPanels.every(p => p);
  }

  calculatePayout(): number {
    return this.prize;
  }

  getState(): ScratchCardsState {
    const matchingSymbols = this.findMatches();
    
    return {
      tier: this.tier,
      cost: this.CARD_COSTS[this.tier],
      panels: this.scratchedPanels.map((scratched, i) => 
        scratched ? this.panels[i] : '?'
      ),
      scratchedPanels: this.scratchedPanels,
      allScratched: this.isFullyScratched(),
      matchingSymbols,
      prize: this.prize,
      cosmeticUnlock: this.cosmeticUnlock,
      isWin: this.result === 'win',
    };
  }

  reset(): void {
    this.tier = 'bronze';
    this.panels = new Array(9).fill('');
    this.scratchedPanels = new Array(9).fill(false);
    this.prize = 0;
    this.cosmeticUnlock = null;
    this.result = null;
  }

  /**
   * Generate a new scratch card with symbols
   */
  private generateCard(): void {
    const symbols = this.TIER_SYMBOLS[this.tier];
    this.panels = [];
    this.scratchedPanels = new Array(9).fill(false);
    this.prize = 0;
    this.cosmeticUnlock = null;
    this.result = null;

    // Determine if card wins (weighted by tier)
    const winChance = this.getWinChance();
    const shouldWin = Math.random() < winChance;

    if (shouldWin) {
      // Create winning card with matching symbols
      const winningSymbol = this.selectWinningSymbol();
      const matchCount = this.getMatchCount();
      
      // Place matching symbols
      const positions = this.getRandomPositions(matchCount);
      for (const pos of positions) {
        this.panels[pos] = winningSymbol.icon;
      }
      
      // Fill remaining with random non-matching symbols
      for (let i = 0; i < 9; i++) {
        if (!this.panels[i]) {
          this.panels[i] = this.getRandomSymbolExcluding(winningSymbol.icon);
        }
      }

      // Calculate prize based on matches
      this.prize = this.calculateWinAmount(winningSymbol, matchCount);

      // Rare cosmetic unlock (5% chance on gold/diamond wins)
      if ((this.tier === 'gold' || this.tier === 'diamond') && Math.random() < 0.05) {
        this.cosmeticUnlock = this.COSMETICS[Math.floor(Math.random() * this.COSMETICS.length)];
      }
    } else {
      // Create losing card (no 3+ matches)
      this.panels = this.generateLosingPattern();
      this.prize = 0;
    }
  }

  /**
   * Get win chance based on tier
   */
  private getWinChance(): number {
    const chances: Record<CardTier, number> = {
      bronze: 0.30, // 30% win rate
      silver: 0.35, // 35% win rate
      gold: 0.40,   // 40% win rate
      diamond: 0.45, // 45% win rate
    };
    return chances[this.tier];
  }

  /**
   * Select winning symbol with weighted randomness
   */
  private selectWinningSymbol(): Symbol {
    const symbols = this.TIER_SYMBOLS[this.tier];
    // Higher value symbols are rarer
    const weights = symbols.map(s => 1 / s.value);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    let random = Math.random() * totalWeight;
    for (let i = 0; i < symbols.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return symbols[i];
      }
    }
    
    return symbols[0];
  }

  /**
   * Get random match count (3, 4, 5, or 9 matches)
   */
  private getMatchCount(): number {
    const rand = Math.random();
    if (rand < 0.02) return 9; // 2% - all match
    if (rand < 0.10) return 5; // 8% - five match
    if (rand < 0.30) return 4; // 20% - four match
    return 3; // 70% - three match
  }

  /**
   * Calculate win amount based on symbol and matches
   */
  private calculateWinAmount(symbol: Symbol, matchCount: number): number {
    const baseAmount = this.bet;
    let multiplier = symbol.value;

    // Bonus multipliers for more matches
    if (matchCount === 4) multiplier *= 1.5;
    if (matchCount === 5) multiplier *= 2;
    if (matchCount === 9) multiplier *= 5; // Jackpot!

    return Math.floor(baseAmount * multiplier);
  }

  /**
   * Get random positions for placing symbols
   */
  private getRandomPositions(count: number): number[] {
    const positions: number[] = [];
    const available = Array.from({ length: 9 }, (_, i) => i);
    
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * available.length);
      positions.push(available[index]);
      available.splice(index, 1);
    }
    
    return positions;
  }

  /**
   * Get random symbol excluding a specific one
   */
  private getRandomSymbolExcluding(exclude: string): string {
    const symbols = this.TIER_SYMBOLS[this.tier];
    const available = symbols.filter(s => s.icon !== exclude);
    return available[Math.floor(Math.random() * available.length)].icon;
  }

  /**
   * Generate losing pattern (no 3+ matches)
   */
  private generateLosingPattern(): string[] {
    const symbols = this.TIER_SYMBOLS[this.tier];
    const panels: string[] = [];
    const counts: Record<string, number> = {};

    // Initialize counts
    for (const symbol of symbols) {
      counts[symbol.icon] = 0;
    }

    // Fill panels ensuring no symbol appears 3+ times
    for (let i = 0; i < 9; i++) {
      const available = symbols.filter(s => counts[s.icon] < 2);
      const selected = available[Math.floor(Math.random() * available.length)];
      panels.push(selected.icon);
      counts[selected.icon]++;
    }

    return panels;
  }

  /**
   * Find matching symbols
   */
  private findMatches(): { symbol: string; count: number; indexes: number[] }[] {
    if (!this.isFullyScratched()) return [];

    const counts: Record<string, number[]> = {};
    
    for (let i = 0; i < this.panels.length; i++) {
      const symbol = this.panels[i];
      if (!counts[symbol]) {
        counts[symbol] = [];
      }
      counts[symbol].push(i);
    }

    const matches: { symbol: string; count: number; indexes: number[] }[] = [];
    for (const [symbol, indexes] of Object.entries(counts)) {
      if (indexes.length >= 3) {
        matches.push({ symbol, count: indexes.length, indexes });
      }
    }

    return matches.sort((a, b) => b.count - a.count);
  }

  /**
   * Evaluate card and determine win/loss
   */
  private evaluateCard(): void {
    const matches = this.findMatches();
    
    if (matches.length > 0 && this.prize > 0) {
      this.result = 'win';
    } else {
      this.result = 'loss';
      this.prize = 0;
    }
  }

  /**
   * Get cosmetic unlock if any
   */
  getCosmeticUnlock(): string | null {
    return this.cosmeticUnlock;
  }

  /**
   * Get prize amount
   */
  getPrize(): number {
    return this.prize;
  }
}
