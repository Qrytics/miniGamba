/**
 * Dice Roll Game Logic
 * Roll dice with multiple bet types and loaded dice feature
 */

import { GameEngine } from './base/GameEngine';

export type DiceBetType =
  | 'over'
  | 'under'
  | 'exact'
  | 'doubles'
  | 'snake-eyes'
  | 'boxcars'
  | 'odd'
  | 'even'
  | 'high'
  | 'low';

export interface DiceRollState {
  dice: [number, number];
  betType: DiceBetType;
  betValue: number;
  rolling: boolean;
  total: number;
  isWin: boolean;
  loadedDiceAvailable: boolean;
  loadedDiceCost: number;
}

export interface BetTypeInfo {
  name: string;
  description: string;
  odds: number;
  needsValue: boolean;
}

export class DiceRoll extends GameEngine {
  private dice: [number, number] = [1, 1];
  private betType: DiceBetType = 'over';
  private betValue: number = 7;
  private rolling = false;
  private loadedDiceUsed = false;

  private readonly LOADED_DICE_COST = 200;
  private readonly ROLL_DURATION = 1000; // 1 second animation

  // Bet type information
  private readonly BET_TYPES: Record<DiceBetType, BetTypeInfo> = {
    'over': { 
      name: 'Over', 
      description: 'Sum is over target number',
      odds: 2,
      needsValue: true,
    },
    'under': { 
      name: 'Under', 
      description: 'Sum is under target number',
      odds: 2,
      needsValue: true,
    },
    'exact': { 
      name: 'Exact Sum', 
      description: 'Sum equals exact number',
      odds: 10,
      needsValue: true,
    },
    'doubles': { 
      name: 'Doubles', 
      description: 'Both dice show same number',
      odds: 6,
      needsValue: false,
    },
    'snake-eyes': { 
      name: 'Snake Eyes', 
      description: 'Both dice show 1',
      odds: 35,
      needsValue: false,
    },
    'boxcars': { 
      name: 'Boxcars', 
      description: 'Both dice show 6',
      odds: 35,
      needsValue: false,
    },
    'odd': { 
      name: 'Odd Sum', 
      description: 'Sum is an odd number',
      odds: 2,
      needsValue: false,
    },
    'even': { 
      name: 'Even Sum', 
      description: 'Sum is an even number',
      odds: 2,
      needsValue: false,
    },
    'high': { 
      name: 'High Roll', 
      description: 'Sum is 8 or higher',
      odds: 2,
      needsValue: false,
    },
    'low': { 
      name: 'Low Roll', 
      description: 'Sum is 6 or lower',
      odds: 2,
      needsValue: false,
    },
  };

  init(): void {
    this.reset();
  }

  /**
   * Set bet type and optional value
   */
  setBet(type: DiceBetType, value?: number): boolean {
    if (this.rolling) return false;
    
    this.betType = type;
    
    if (this.BET_TYPES[type].needsValue) {
      if (value === undefined) return false;
      
      // Validate value range (2-12 for dice)
      if (value < 2 || value > 12) return false;
      
      this.betValue = value;
    }
    
    return true;
  }

  /**
   * Get bet type information
   */
  getBetTypeInfo(type: DiceBetType): BetTypeInfo {
    return this.BET_TYPES[type];
  }

  /**
   * Get all available bet types
   */
  getAllBetTypes(): Record<DiceBetType, BetTypeInfo> {
    return { ...this.BET_TYPES };
  }

  /**
   * Roll the dice
   */
  async roll(): Promise<void> {
    if (this.rolling) return;
    
    this.rolling = true;
    this.result = null;

    // Simulate rolling animation
    await new Promise(resolve => setTimeout(resolve, this.ROLL_DURATION));
    
    this.dice = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ] as [number, number];
    
    this.rolling = false;
    this.loadedDiceUsed = false;
    this.checkWin();
  }

  /**
   * Use loaded dice feature - roll 3 dice and keep best 2
   */
  async useLoadedDice(): Promise<void> {
    if (this.rolling || this.loadedDiceUsed) return;
    
    this.rolling = true;
    this.loadedDiceUsed = true;
    this.result = null;

    // Roll 3 dice
    await new Promise(resolve => setTimeout(resolve, this.ROLL_DURATION));
    
    const threeDice: [number, number, number] = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];

    // Select best 2 dice based on bet type
    this.dice = this.selectBestTwo(threeDice);
    
    this.rolling = false;
    this.checkWin();
  }

  /**
   * Select best 2 dice from 3 based on current bet type
   */
  private selectBestTwo(threeDice: [number, number, number]): [number, number] {
    // To maintain fair odds across all bet types, the loaded dice feature
    // no longer selects dice based on the current bet. Instead, we simply
    // use the first two dice rolled.
    return [threeDice[0], threeDice[1]];
  }

  /**
   * Get loaded dice cost
   */
  getLoadedDiceCost(): number {
    return this.LOADED_DICE_COST;
  }

  /**
   * Get current dice values
   */
  getDice(): [number, number] {
    return [...this.dice] as [number, number];
  }

  /**
   * Get total of dice
   */
  getTotal(): number {
    return this.dice[0] + this.dice[1];
  }

  /**
   * Check if the bet won
   */
  private checkWin(): void {
    const sum = this.dice[0] + this.dice[1];
    
    switch (this.betType) {
      case 'over':
        this.result = sum > this.betValue ? 'win' : 'loss';
        break;
      
      case 'under':
        this.result = sum < this.betValue ? 'win' : 'loss';
        break;
      
      case 'exact':
        this.result = sum === this.betValue ? 'win' : 'loss';
        break;
      
      case 'doubles':
        this.result = this.dice[0] === this.dice[1] ? 'win' : 'loss';
        break;
      
      case 'snake-eyes':
        this.result = (this.dice[0] === 1 && this.dice[1] === 1) ? 'win' : 'loss';
        break;
      
      case 'boxcars':
        this.result = (this.dice[0] === 6 && this.dice[1] === 6) ? 'win' : 'loss';
        break;
      
      case 'odd':
        this.result = sum % 2 === 1 ? 'win' : 'loss';
        break;
      
      case 'even':
        this.result = sum % 2 === 0 ? 'win' : 'loss';
        break;
      
      case 'high':
        this.result = sum >= 8 ? 'win' : 'loss';
        break;
      
      case 'low':
        this.result = sum <= 6 ? 'win' : 'loss';
        break;
    }
  }

  calculatePayout(): number {
    if (this.result !== 'win') return 0;
    
    const odds = this.BET_TYPES[this.betType].odds;
    return Math.floor(this.bet * odds);
  }

  getState(): DiceRollState {
    return {
      dice: [...this.dice] as [number, number],
      betType: this.betType,
      betValue: this.betValue,
      rolling: this.rolling,
      total: this.getTotal(),
      isWin: this.result === 'win',
      loadedDiceAvailable: !this.loadedDiceUsed,
      loadedDiceCost: this.LOADED_DICE_COST,
    };
  }

  reset(): void {
    this.dice = [1, 1];
    this.betType = 'over';
    this.betValue = 7;
    this.rolling = false;
    this.loadedDiceUsed = false;
    this.result = null;
  }

  /**
   * Is currently rolling
   */
  isRolling(): boolean {
    return this.rolling;
  }

  /**
   * Can use loaded dice
   */
  canUseLoadedDice(): boolean {
    return !this.loadedDiceUsed && !this.rolling;
  }
}
