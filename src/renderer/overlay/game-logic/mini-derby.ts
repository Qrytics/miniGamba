/**
 * Mini Derby Game Logic
 * Bet on cartoon racers
 */

import { GameEngine } from './base/GameEngine';

export type Racer = {
  id: number;
  name: string;
  icon: string;
  odds: number; // Payout multiplier
};

export class MiniDerby extends GameEngine {
  private racers: Racer[] = [];
  private selectedRacer: number | null = null;
  private winner: number | null = null;
  private racing = false;

  init(): void {
    this.reset();
    this.generateRacers();
  }

  /**
   * Select a racer to bet on
   * TODO: Implement racer selection
   */
  selectRacer(racerId: number): void {
    this.selectedRacer = racerId;
  }

  /**
   * Start the race
   * TODO: Implement race animation
   */
  startRace(): void {
    if (this.racing || this.selectedRacer === null) return;
    
    this.racing = true;
    
    // TODO: Animate race
    setTimeout(() => {
      this.winner = this.determineWinner();
      this.racing = false;
      this.checkWin();
    }, 5000);
  }

  /**
   * Place an exacta bet (predict 1st and 2nd)
   * TODO: Implement exacta betting
   */
  placeExacta(first: number, second: number): void {
    // TODO: Implement exacta bet logic
  }

  calculatePayout(): number {
    if (this.result !== 'win' || this.selectedRacer === null) return 0;
    
    const racer = this.racers.find(r => r.id === this.selectedRacer);
    if (!racer) return 0;
    
    return this.bet * racer.odds;
  }

  getState(): any {
    return {
      racers: this.racers,
      selectedRacer: this.selectedRacer,
      winner: this.winner,
      racing: this.racing,
    };
  }

  reset(): void {
    this.selectedRacer = null;
    this.winner = null;
    this.racing = false;
    this.result = null;
  }

  private generateRacers(): void {
    // TODO: Generate racers with different odds
    this.racers = [
      { id: 1, name: 'Speedy', icon: '🐎', odds: 2 },
      { id: 2, name: 'Turbo', icon: '🏎️', odds: 3 },
      { id: 3, name: 'Slowpoke', icon: '🐌', odds: 5 },
      { id: 4, name: 'Dark Horse', icon: '🦄', odds: 10 },
    ];
  }

  private determineWinner(): number {
    // TODO: Use weighted random based on odds
    // Lower odds = higher chance to win
    const weights = this.racers.map(r => 1 / r.odds);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < this.racers.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return this.racers[i].id;
      }
    }
    
    return this.racers[0].id;
  }

  private checkWin(): void {
    if (this.selectedRacer === this.winner) {
      this.result = 'win';
    } else {
      this.result = 'loss';
    }
  }
}
