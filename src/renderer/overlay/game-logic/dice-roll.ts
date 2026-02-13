/**
 * Dice Roll Game Logic
 * Bet on dice outcomes
 */

import { GameEngine } from './base/GameEngine';

export type DiceBetType =
  | 'over'
  | 'under'
  | 'exact'
  | 'doubles'
  | 'snake-eyes'
  | 'boxcars';

export class DiceRoll extends GameEngine {
  private dice: [number, number] = [1, 1];
  private betType: DiceBetType = 'over';
  private betValue: number = 7;
  private rolling = false;

  init(): void {
    this.reset();
  }

  /**
   * Set bet type and value
   * TODO: Implement bet type selection
   */
  setBet(type: DiceBetType, value?: number): void {
    this.betType = type;
    if (value !== undefined) {
      this.betValue = value;
    }
  }

  /**
   * Roll the dice
   * TODO: Implement rolling animation
   */
  roll(): void {
    if (this.rolling) return;
    
    this.rolling = true;
    
    // TODO: Animate dice rolling
    setTimeout(() => {
      this.dice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ] as [number, number];
      this.rolling = false;
      this.checkWin();
    }, 1000);
  }

  /**
   * Use loaded dice feature (roll 3, keep best 2)
   * TODO: Implement loaded dice
   */
  useLoadedDice(): void {
    // TODO: Roll 3 dice and keep best 2
  }

  calculatePayout(): number {
    if (this.result !== 'win') return 0;
    
    // TODO: Different payouts for different bet types
    const payouts: Record<DiceBetType, number> = {
      over: 2,
      under: 2,
      exact: 10,
      doubles: 8,
      'snake-eyes': 30,
      boxcars: 30,
    };
    
    return this.bet * payouts[this.betType];
  }

  getState(): any {
    return {
      dice: this.dice,
      betType: this.betType,
      betValue: this.betValue,
      rolling: this.rolling,
    };
  }

  reset(): void {
    this.dice = [1, 1];
    this.betType = 'over';
    this.betValue = 7;
    this.rolling = false;
    this.result = null;
  }

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
        this.result = this.dice[0] === 1 && this.dice[1] === 1 ? 'win' : 'loss';
        break;
      case 'boxcars':
        this.result = this.dice[0] === 6 && this.dice[1] === 6 ? 'win' : 'loss';
        break;
    }
  }
}
