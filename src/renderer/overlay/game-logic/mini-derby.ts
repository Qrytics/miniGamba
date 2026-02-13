/**
 * Mini Derby Game Logic
 * Bet on cartoon racers with different odds
 * Includes exacta betting for higher payouts
 */

import { GameEngine } from './base/GameEngine';

export interface Racer {
  id: number;
  name: string;
  icon: string;
  odds: number; // Payout multiplier
  speed: number; // Base speed for race simulation
  position: number; // Current race position
  progress: number; // Race progress 0-100
}

export type BetType = 'win' | 'exacta';

export interface ExactaBet {
  first: number;
  second: number;
}

export interface MiniDerbyState {
  racers: Racer[];
  selectedRacer: number | null;
  betType: BetType;
  exactaBet: ExactaBet | null;
  racing: boolean;
  raceComplete: boolean;
  finishOrder: number[];
  winner: number | null;
  raceProgress: number;
}

export class MiniDerby extends GameEngine {
  private racers: Racer[] = [];
  private selectedRacer: number | null = null;
  private betType: BetType = 'win';
  private exactaBet: ExactaBet | null = null;
  private racing = false;
  private raceComplete = false;
  private finishOrder: number[] = [];
  private raceProgress = 0;

  private readonly RACE_DURATION = 5000; // 5 seconds
  private readonly RACE_TICK_INTERVAL = 100; // Update every 100ms
  private readonly EXACTA_MULTIPLIER = 30; // 30x for correct exacta

  init(): void {
    this.reset();
    this.generateRacers();
  }

  /**
   * Select a racer for win bet
   */
  selectRacer(racerId: number): boolean {
    if (this.racing) return false;
    
    const racer = this.racers.find(r => r.id === racerId);
    if (!racer) return false;
    
    this.selectedRacer = racerId;
    this.betType = 'win';
    this.exactaBet = null;
    return true;
  }

  /**
   * Place exacta bet (predict 1st and 2nd place)
   */
  placeExacta(first: number, second: number): boolean {
    if (this.racing) return false;
    if (first === second) return false;
    
    const racer1 = this.racers.find(r => r.id === first);
    const racer2 = this.racers.find(r => r.id === second);
    
    if (!racer1 || !racer2) return false;
    
    this.betType = 'exacta';
    this.exactaBet = { first, second };
    this.selectedRacer = null;
    return true;
  }

  /**
   * Get selected racer
   */
  getSelectedRacer(): number | null {
    return this.selectedRacer;
  }

  /**
   * Get exacta bet
   */
  getExactaBet(): ExactaBet | null {
    return this.exactaBet;
  }

  /**
   * Get bet type
   */
  getBetType(): BetType {
    return this.betType;
  }

  /**
   * Start the race
   */
  async startRace(): Promise<void> {
    if (this.racing) return;
    if (!this.selectedRacer && !this.exactaBet) {
      throw new Error('No bet placed');
    }
    
    this.racing = true;
    this.raceComplete = false;
    this.finishOrder = [];
    this.raceProgress = 0;

    // Reset racer positions
    for (const racer of this.racers) {
      racer.position = 0;
      racer.progress = 0;
    }

    // Run race simulation
    await this.simulateRace();
    
    this.racing = false;
    this.raceComplete = true;
    this.checkWin();
  }

  /**
   * Simulate the race with realistic progress
   */
  private async simulateRace(): Promise<void> {
    const startTime = Date.now();
    const totalTicks = this.RACE_DURATION / this.RACE_TICK_INTERVAL;
    let tick = 0;

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        tick++;
        const elapsed = Date.now() - startTime;
        this.raceProgress = Math.min((elapsed / this.RACE_DURATION) * 100, 100);

        // Update each racer's progress
        for (const racer of this.racers) {
          if (racer.progress < 100) {
            // Add randomness to speed (variance makes races interesting)
            const variance = (Math.random() - 0.5) * 0.3;
            const speedThisTick = racer.speed * (1 + variance);
            
            racer.progress += speedThisTick;
            racer.progress = Math.min(racer.progress, 100);

            // Record finish order
            if (racer.progress >= 100 && !this.finishOrder.includes(racer.id)) {
              this.finishOrder.push(racer.id);
              racer.position = this.finishOrder.length;
            }
          }
        }

        // Check if all racers finished or time's up
        if (this.finishOrder.length === this.racers.length || tick >= totalTicks) {
          clearInterval(interval);
          
          // Ensure all racers have a finish position
          for (const racer of this.racers) {
            if (!this.finishOrder.includes(racer.id)) {
              this.finishOrder.push(racer.id);
              racer.position = this.finishOrder.length;
            }
          }
          
          resolve();
        }
      }, this.RACE_TICK_INTERVAL);
    });
  }

  /**
   * Check if bet won
   */
  private checkWin(): void {
    if (this.finishOrder.length === 0) {
      this.result = 'loss';
      return;
    }

    const winner = this.finishOrder[0];

    if (this.betType === 'win') {
      // Simple win bet
      if (this.selectedRacer === winner) {
        this.result = 'win';
      } else {
        this.result = 'loss';
      }
    } else if (this.betType === 'exacta' && this.exactaBet) {
      // Exacta bet - must predict 1st AND 2nd correctly
      const first = this.finishOrder[0];
      const second = this.finishOrder[1];
      
      if (this.exactaBet.first === first && this.exactaBet.second === second) {
        this.result = 'win';
      } else {
        this.result = 'loss';
      }
    }
  }

  /**
   * Get winner racer ID
   */
  getWinner(): number | null {
    return this.finishOrder.length > 0 ? this.finishOrder[0] : null;
  }

  /**
   * Get finish order
   */
  getFinishOrder(): number[] {
    return [...this.finishOrder];
  }

  calculatePayout(): number {
    if (this.result !== 'win') return 0;
    
    if (this.betType === 'win' && this.selectedRacer !== null) {
      const racer = this.racers.find(r => r.id === this.selectedRacer);
      if (!racer) return 0;
      
      return Math.floor(this.bet * racer.odds);
    } else if (this.betType === 'exacta') {
      // Exacta pays flat 30x multiplier
      return Math.floor(this.bet * this.EXACTA_MULTIPLIER);
    }
    
    return 0;
  }

  getState(): MiniDerbyState {
    return {
      racers: this.racers.map(r => ({ ...r })),
      selectedRacer: this.selectedRacer,
      betType: this.betType,
      exactaBet: this.exactaBet,
      racing: this.racing,
      raceComplete: this.raceComplete,
      finishOrder: [...this.finishOrder],
      winner: this.getWinner(),
      raceProgress: this.raceProgress,
    };
  }

  reset(): void {
    this.selectedRacer = null;
    this.betType = 'win';
    this.exactaBet = null;
    this.racing = false;
    this.raceComplete = false;
    this.finishOrder = [];
    this.raceProgress = 0;
    this.result = null;
    
    // Reset racer positions
    for (const racer of this.racers) {
      racer.position = 0;
      racer.progress = 0;
    }
  }

  /**
   * Generate racers with different odds and speeds
   * Lower odds = higher chance to win (faster)
   */
  private generateRacers(): void {
    this.racers = [
      { 
        id: 1, 
        name: 'Speedy',
        icon: '🐎',
        odds: 2,
        speed: this.calculateSpeed(2),
        position: 0,
        progress: 0,
      },
      { 
        id: 2, 
        name: 'Turbo',
        icon: '🏎️',
        odds: 3,
        speed: this.calculateSpeed(3),
        position: 0,
        progress: 0,
      },
      { 
        id: 3, 
        name: 'Slowpoke',
        icon: '🐌',
        odds: 5,
        speed: this.calculateSpeed(5),
        position: 0,
        progress: 0,
      },
      { 
        id: 4, 
        name: 'Dark Horse',
        icon: '🦄',
        odds: 10,
        speed: this.calculateSpeed(10),
        position: 0,
        progress: 0,
      },
    ];
  }

  /**
   * Calculate base speed from odds
   * Lower odds = faster speed (higher win probability)
   */
  private calculateSpeed(odds: number): number {
    // Inverse relationship: higher odds = lower speed
    // Base speed to complete race in ~5 seconds with fair distribution
    const totalTicks = this.RACE_DURATION / this.RACE_TICK_INTERVAL;
    const baseSpeed = 100 / totalTicks;
    
    // Adjust speed based on odds (inverse)
    // 2x odds = ~40% win rate, 10x odds = ~10% win rate
    const speedMultiplier = 5 / odds;
    return baseSpeed * speedMultiplier;
  }

  /**
   * Get all racers
   */
  getRacers(): Racer[] {
    return this.racers.map(r => ({ ...r }));
  }

  /**
   * Is race currently running
   */
  isRacing(): boolean {
    return this.racing;
  }

  /**
   * Is race complete
   */
  isRaceComplete(): boolean {
    return this.raceComplete;
  }

  /**
   * Get race progress percentage (0-100)
   */
  getRaceProgress(): number {
    return this.raceProgress;
  }
}
