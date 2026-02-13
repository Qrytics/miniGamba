/**
 * Slot Machine Game Logic
 * Classic 3-reel slot machine with jackpots, hold & respin, and themed reels
 */

import { GameEngine } from './base/GameEngine';

export interface SlotSymbol {
  icon: string;
  name: string;
  weight: number; // Lower weight = more rare
  multiplier: number;
}

export interface SlotMachineState {
  reels: string[][];
  spinning: boolean;
  holdReels: boolean[];
  result: {
    type: 'none' | 'two-of-kind' | 'three-of-kind' | 'jackpot';
    symbol?: string;
    multiplier: number;
  } | null;
}

export class SlotMachine extends GameEngine {
  private reels: string[][] = [[], [], []];
  private holdReels: boolean[] = [false, false, false];
  private spinning = false;
  private currentTheme: 'classic' | 'gems' | 'skulls' | 'space' = 'classic';
  private lastWinType: {
    type: 'none' | 'two-of-kind' | 'three-of-kind' | 'jackpot';
    symbol?: string;
    multiplier: number;
  } | null = null;

  // Symbol themes
  private symbolThemes = {
    classic: [
      { icon: '🍒', name: 'Cherry', weight: 30, multiplier: 2 },
      { icon: '🍋', name: 'Lemon', weight: 25, multiplier: 3 },
      { icon: '🍊', name: 'Orange', weight: 20, multiplier: 4 },
      { icon: '🍇', name: 'Grape', weight: 15, multiplier: 5 },
      { icon: '⭐', name: 'Star', weight: 8, multiplier: 10 },
      { icon: '💎', name: 'Diamond', weight: 1.5, multiplier: 50 },
      { icon: '7️⃣', name: 'Lucky Seven', weight: 0.5, multiplier: 100 },
    ],
    gems: [
      { icon: '💚', name: 'Emerald', weight: 30, multiplier: 2 },
      { icon: '💙', name: 'Sapphire', weight: 25, multiplier: 3 },
      { icon: '💜', name: 'Amethyst', weight: 20, multiplier: 4 },
      { icon: '❤️', name: 'Ruby', weight: 15, multiplier: 5 },
      { icon: '🔷', name: 'Crystal', weight: 8, multiplier: 10 },
      { icon: '💎', name: 'Diamond', weight: 1.5, multiplier: 50 },
      { icon: '👑', name: 'Crown', weight: 0.5, multiplier: 100 },
    ],
    skulls: [
      { icon: '🎃', name: 'Pumpkin', weight: 30, multiplier: 2 },
      { icon: '👻', name: 'Ghost', weight: 25, multiplier: 3 },
      { icon: '🦇', name: 'Bat', weight: 20, multiplier: 4 },
      { icon: '🕷️', name: 'Spider', weight: 15, multiplier: 5 },
      { icon: '🔮', name: 'Crystal Ball', weight: 8, multiplier: 10 },
      { icon: '💀', name: 'Skull', weight: 1.5, multiplier: 50 },
      { icon: '☠️', name: 'Jolly Roger', weight: 0.5, multiplier: 100 },
    ],
    space: [
      { icon: '🌍', name: 'Earth', weight: 30, multiplier: 2 },
      { icon: '🌙', name: 'Moon', weight: 25, multiplier: 3 },
      { icon: '⭐', name: 'Star', weight: 20, multiplier: 4 },
      { icon: '🪐', name: 'Saturn', weight: 15, multiplier: 5 },
      { icon: '🌟', name: 'Comet', weight: 8, multiplier: 10 },
      { icon: '🚀', name: 'Rocket', weight: 1.5, multiplier: 50 },
      { icon: '👽', name: 'Alien', weight: 0.5, multiplier: 100 },
    ],
  };

  private symbols: SlotSymbol[] = this.symbolThemes[this.currentTheme];

  init(): void {
    this.reset();
  }

  /**
   * Set the slot machine theme
   */
  setTheme(theme: 'classic' | 'gems' | 'skulls' | 'space'): void {
    this.currentTheme = theme;
    this.symbols = this.symbolThemes[theme];
  }

  /**
   * Hold or unhold a reel
   */
  toggleHold(reelIndex: number): void {
    if (reelIndex >= 0 && reelIndex < 3) {
      this.holdReels[reelIndex] = !this.holdReels[reelIndex];
    }
  }

  /**
   * Spin the reels
   */
  async spin(): Promise<void> {
    if (this.spinning) return;
    
    this.spinning = true;
    
    // Spin non-held reels
    for (let i = 0; i < 3; i++) {
      if (!this.holdReels[i]) {
        this.reels[i] = [
          this.getRandomSymbol(),
          this.getRandomSymbol(),
          this.getRandomSymbol(),
        ];
      }
    }
    
    // Simulate spin delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.spinning = false;
    this.checkWin();
    
    // Reset holds after spin
    this.holdReels = [false, false, false];
  }

  /**
   * Check if spin resulted in a win
   */
  private checkWin(): void {
    const middleRow = [this.reels[0][1], this.reels[1][1], this.reels[2][1]];
    
    // Check for three of a kind (jackpot)
    if (middleRow[0] === middleRow[1] && middleRow[1] === middleRow[2]) {
      const symbol = this.symbols.find(s => s.icon === middleRow[0]);
      
      if (symbol) {
        // Check if it's a jackpot (lucky seven or highest multiplier)
        if (symbol.multiplier >= 100) {
          this.result = 'win';
          this.lastWinType = {
            type: 'jackpot',
            symbol: symbol.icon,
            multiplier: symbol.multiplier
          };
        } else {
          this.result = 'win';
          this.lastWinType = {
            type: 'three-of-kind',
            symbol: symbol.icon,
            multiplier: symbol.multiplier
          };
        }
        return;
      }
    }
    
    // Check for two of a kind
    if (middleRow[0] === middleRow[1] || middleRow[1] === middleRow[2] || middleRow[0] === middleRow[2]) {
      let symbol: SlotSymbol | undefined;
      
      if (middleRow[0] === middleRow[1]) {
        symbol = this.symbols.find(s => s.icon === middleRow[0]);
      } else if (middleRow[1] === middleRow[2]) {
        symbol = this.symbols.find(s => s.icon === middleRow[1]);
      } else {
        symbol = this.symbols.find(s => s.icon === middleRow[0]);
      }
      
      if (symbol) {
        this.result = 'win';
        this.lastWinType = {
          type: 'two-of-kind',
          symbol: symbol.icon,
          multiplier: Math.floor(symbol.multiplier * 0.5) // Half payout for 2 of kind
        };
        return;
      }
    }
    
    // No match
    this.result = 'loss';
    this.lastWinType = {
      type: 'none',
      multiplier: 0
    };
  }

  calculatePayout(): number {
    if (!this.lastWinType || this.result !== 'win') {
      return 0;
    }
    
    return this.bet * this.lastWinType.multiplier;
  }

  getState(): SlotMachineState {
    return {
      reels: this.reels,
      spinning: this.spinning,
      holdReels: this.holdReels,
      result: this.lastWinType
    };
  }

  reset(): void {
    this.reels = [
      ['🍒', '🍋', '🍊'],
      ['🍋', '🍒', '🍇'],
      ['🍊', '🍇', '🍒'],
    ];
    this.holdReels = [false, false, false];
    this.spinning = false;
    this.result = null;
    this.lastWinType = null;
  }

  /**
   * Get weighted random symbol
   */
  private getRandomSymbol(): string {
    // Calculate total weight
    const totalWeight = this.symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
    
    // Random number between 0 and total weight
    let random = Math.random() * totalWeight;
    
    // Select symbol based on weight
    for (const symbol of this.symbols) {
      random -= symbol.weight;
      if (random <= 0) {
        return symbol.icon;
      }
    }
    
    // Fallback to first symbol
    return this.symbols[0].icon;
  }

  /**
   * Get hold & respin cost (double the bet)
   */
  getHoldCost(): number {
    return this.bet * 2;
  }
}

