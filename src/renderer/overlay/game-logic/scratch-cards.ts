/**
 * Scratch Cards Game Logic
 * Scratch off panels to reveal prizes
 */

import { GameEngine } from './base/GameEngine';

export type CardTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export class ScratchCards extends GameEngine {
  private tier: CardTier = 'bronze';
  private panels: (string | null)[] = new Array(9).fill(null);
  private scratchedPanels: boolean[] = new Array(9).fill(false);
  private prize: number = 0;

  init(): void {
    this.reset();
  }

  /**
   * Buy a scratch card of specified tier
   * TODO: Implement card purchase with different costs per tier
   */
  buyCard(tier: CardTier): void {
    this.tier = tier;
    this.generateCard();
  }

  /**
   * Scratch a panel
   * TODO: Implement panel scratching
   */
  scratch(index: number): void {
    if (this.scratchedPanels[index]) return;
    
    this.scratchedPanels[index] = true;
    
    // Check if all panels scratched
    if (this.scratchedPanels.every(p => p)) {
      this.result = this.prize > this.bet ? 'win' : 'loss';
    }
  }

  /**
   * Auto-scratch all panels
   * TODO: Implement auto-scratch feature
   */
  autoScratch(): void {
    for (let i = 0; i < this.panels.length; i++) {
      this.scratchedPanels[i] = true;
    }
    this.result = this.prize > this.bet ? 'win' : 'loss';
  }

  calculatePayout(): number {
    return this.prize;
  }

  getState(): any {
    return {
      tier: this.tier,
      panels: this.panels,
      scratchedPanels: this.scratchedPanels,
      prize: this.prize,
    };
  }

  reset(): void {
    this.tier = 'bronze';
    this.panels = new Array(9).fill(null);
    this.scratchedPanels = new Array(9).fill(false);
    this.prize = 0;
    this.result = null;
  }

  private generateCard(): void {
    // TODO: Generate card with prizes based on tier
    const prizePool = this.getTierPrizes();
    this.prize = prizePool[Math.floor(Math.random() * prizePool.length)];
    
    // Fill panels with symbols
    for (let i = 0; i < 9; i++) {
      this.panels[i] = this.getRandomSymbol();
    }
  }

  private getTierPrizes(): number[] {
    // TODO: Define prize pools for each tier
    const tierPrizes: Record<CardTier, number[]> = {
      bronze: [0, 0, 10, 20, 50],
      silver: [0, 20, 50, 100, 200],
      gold: [0, 100, 200, 500, 1000],
      diamond: [0, 500, 1000, 5000, 10000],
    };
    
    return tierPrizes[this.tier];
  }

  private getRandomSymbol(): string {
    const symbols = ['🍒', '🍋', '⭐', '💎', '7️⃣'];
    return symbols[Math.floor(Math.random() * symbols.length)];
  }
}
