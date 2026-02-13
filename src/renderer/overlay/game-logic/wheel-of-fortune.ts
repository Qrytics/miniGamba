/**
 * Wheel of Fortune Game Logic
 * Spin a wheel with various prize segments
 * Includes daily free spin and loaded wheel feature
 */

import { GameEngine } from './base/GameEngine';

export interface WheelSegment {
  id: number;
  type: 'coins' | 'multiplier' | 'free-spins' | 'bankrupt' | 'cosmetic';
  value: number | string;
  weight: number;
  color: string;
  label: string;
}

export interface WheelOfFortuneState {
  segments: WheelSegment[];
  currentSegment: WheelSegment | null;
  spinning: boolean;
  hasDailyFreeSpin: boolean;
  lastSpinTime: number | null;
  spinCost: number;
  loadedWheelCost: number;
  isLoadedWheel: boolean;
  rotation: number;
  freeSpinsRemaining: number;
}

export class WheelOfFortune extends GameEngine {
  private segments: WheelSegment[] = [];
  private currentSegment: WheelSegment | null = null;
  private spinning = false;
  private lastSpinTime: number | null = null;
  private dailyFreeSpinUsed = false;
  private isLoadedWheel = false;
  private rotation = 0;
  private freeSpinsRemaining = 0;

  private readonly SPIN_COST = 100;
  private readonly LOADED_WHEEL_COST = 500;
  private readonly SPIN_DURATION = 3000; // 3 seconds

  // Cosmetic drops for the wheel
  private readonly COSMETIC_DROPS = [
    '🎨 Wheel Frame',
    '🌈 Rainbow Wheel',
    '✨ Sparkle Pointer',
    '🔥 Fire Wheel',
    '💫 Star Wheel',
    '🎪 Carnival Wheel',
  ];

  init(): void {
    this.reset();
    this.generateSegments();
  }

  /**
   * Check if daily free spin is available
   */
  checkDailyFreeSpin(): boolean {
    if (this.dailyFreeSpinUsed) return false;
    
    // Check if last spin was more than 24 hours ago
    if (!this.lastSpinTime) return true;
    
    const now = Date.now();
    const hoursSinceLastSpin = (now - this.lastSpinTime) / (1000 * 60 * 60);
    
    if (hoursSinceLastSpin >= 24) {
      this.dailyFreeSpinUsed = false;
      return true;
    }
    
    return false;
  }

  /**
   * Use loaded wheel feature (removes bankrupt segment)
   */
  useLoadedWheel(): boolean {
    if (this.spinning || this.isLoadedWheel) return false;
    
    this.isLoadedWheel = true;
    this.generateSegments(); // Regenerate without bankrupt
    return true;
  }

  /**
   * Get loaded wheel cost
   */
  getLoadedWheelCost(): number {
    return this.LOADED_WHEEL_COST;
  }

  /**
   * Get spin cost
   */
  getSpinCost(): number {
    return this.SPIN_COST;
  }

  /**
   * Spin the wheel
   */
  async spin(useFreeSpin: boolean = false): Promise<WheelSegment> {
    if (this.spinning) {
      throw new Error('Wheel is already spinning');
    }

    // Handle free spin
    if (useFreeSpin) {
      if (this.freeSpinsRemaining > 0) {
        this.freeSpinsRemaining--;
      } else if (this.checkDailyFreeSpin()) {
        this.dailyFreeSpinUsed = true;
        this.lastSpinTime = Date.now();
      } else {
        throw new Error('No free spins available');
      }
    } else {
      // Regular spin costs coins
      this.bet = this.SPIN_COST;
    }
    
    this.spinning = true;
    this.currentSegment = null;

    // Simulate wheel spin with rotation
    const selectedSegment = this.selectRandomSegment();
    const segmentAngle = 360 / this.segments.length;
    const segmentIndex = this.segments.indexOf(selectedSegment);
    
    // Calculate final rotation (multiple full spins + target segment)
    const fullSpins = 3 + Math.random() * 2; // 3-5 full rotations
    this.rotation = (fullSpins * 360) + (segmentIndex * segmentAngle);

    // Wait for spin animation
    await new Promise(resolve => setTimeout(resolve, this.SPIN_DURATION));
    
    this.currentSegment = selectedSegment;
    this.spinning = false;
    this.determineResult();

    // Reset loaded wheel after spin
    if (this.isLoadedWheel) {
      this.isLoadedWheel = false;
      this.generateSegments(); // Restore original segments
    }

    return selectedSegment;
  }

  /**
   * Get current rotation angle
   */
  getRotation(): number {
    return this.rotation;
  }

  /**
   * Get number of free spins remaining
   */
  getFreeSpinsRemaining(): number {
    return this.freeSpinsRemaining;
  }

  calculatePayout(): number {
    if (!this.currentSegment) return 0;
    
    switch (this.currentSegment.type) {
      case 'coins':
        return this.currentSegment.value as number;
      
      case 'multiplier':
        return Math.floor(this.bet * (this.currentSegment.value as number));
      
      case 'free-spins':
        // Free spins don't give immediate payout
        this.freeSpinsRemaining += this.currentSegment.value as number;
        return 0;
      
      case 'cosmetic':
      case 'bankrupt':
        return 0;
      
      default:
        return 0;
    }
  }

  getState(): WheelOfFortuneState {
    return {
      segments: this.segments,
      currentSegment: this.currentSegment,
      spinning: this.spinning,
      hasDailyFreeSpin: this.checkDailyFreeSpin(),
      lastSpinTime: this.lastSpinTime,
      spinCost: this.SPIN_COST,
      loadedWheelCost: this.LOADED_WHEEL_COST,
      isLoadedWheel: this.isLoadedWheel,
      rotation: this.rotation,
      freeSpinsRemaining: this.freeSpinsRemaining,
    };
  }

  reset(): void {
    this.currentSegment = null;
    this.spinning = false;
    this.result = null;
    this.isLoadedWheel = false;
    this.rotation = 0;
    // Don't reset daily spin status or free spins
  }

  /**
   * Generate wheel segments
   */
  private generateSegments(): void {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
                    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'];

    if (this.isLoadedWheel) {
      // Loaded wheel - no bankrupt segment
      this.segments = [
        { id: 0, type: 'coins', value: 100, weight: 20, color: colors[0], label: '100 Coins' },
        { id: 1, type: 'coins', value: 250, weight: 15, color: colors[1], label: '250 Coins' },
        { id: 2, type: 'coins', value: 500, weight: 10, color: colors[2], label: '500 Coins' },
        { id: 3, type: 'multiplier', value: 2, weight: 18, color: colors[3], label: '2x Bet' },
        { id: 4, type: 'multiplier', value: 5, weight: 10, color: colors[4], label: '5x Bet' },
        { id: 5, type: 'multiplier', value: 10, weight: 5, color: colors[5], label: '10x Bet' },
        { id: 6, type: 'free-spins', value: 1, weight: 12, color: colors[6], label: '1 Free Spin' },
        { id: 7, type: 'free-spins', value: 3, weight: 5, color: colors[7], label: '3 Free Spins' },
        { id: 8, type: 'cosmetic', value: 'COSMETIC_PLACEHOLDER', weight: 3, color: colors[8], label: 'Cosmetic' },
        { id: 9, type: 'coins', value: 1000, weight: 2, color: colors[9], label: '1000 Coins!' },
      ];
    } else {
      // Normal wheel - includes bankrupt
      this.segments = [
        { id: 0, type: 'coins', value: 50, weight: 18, color: colors[0], label: '50 Coins' },
        { id: 1, type: 'coins', value: 100, weight: 15, color: colors[1], label: '100 Coins' },
        { id: 2, type: 'coins', value: 250, weight: 10, color: colors[2], label: '250 Coins' },
        { id: 3, type: 'multiplier', value: 2, weight: 15, color: colors[3], label: '2x Bet' },
        { id: 4, type: 'multiplier', value: 3, weight: 10, color: colors[4], label: '3x Bet' },
        { id: 5, type: 'multiplier', value: 5, weight: 7, color: colors[5], label: '5x Bet' },
        { id: 6, type: 'free-spins', value: 1, weight: 8, color: colors[6], label: '1 Free Spin' },
        { id: 7, type: 'bankrupt', value: 0, weight: 12, color: '#2C3E50', label: 'BANKRUPT' },
        { id: 8, type: 'cosmetic', value: 'COSMETIC_PLACEHOLDER', weight: 2, color: colors[8], label: 'Cosmetic' },
        { id: 9, type: 'multiplier', value: 10, weight: 3, color: colors[9], label: '10x Bet!' },
      ];
    }
  }

  /**
   * Select random segment based on weights
   */
  private selectRandomSegment(): WheelSegment {
    const totalWeight = this.segments.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const segment of this.segments) {
      random -= segment.weight;
      if (random <= 0) {
        return segment;
      }
    }
    
    return this.segments[0];
  }

  /**
   * Get random cosmetic drop
   */
  private getRandomCosmetic(): string {
    return this.COSMETIC_DROPS[Math.floor(Math.random() * this.COSMETIC_DROPS.length)];
  }

  /**
   * Determine result based on segment
   */
  private determineResult(): void {
    if (!this.currentSegment) return;
    
    // Generate random cosmetic on landing (not when generating segments)
    if (this.currentSegment.type === 'cosmetic') {
      this.currentSegment.value = this.getRandomCosmetic();
    }
    
    switch (this.currentSegment.type) {
      case 'bankrupt':
        this.result = 'loss';
        this.payout = 0;
        break;
      
      case 'coins':
      case 'multiplier':
        this.result = 'win';
        this.payout = this.calculatePayout();
        break;
      
      case 'free-spins':
        this.result = 'win';
        this.payout = 0; // No immediate payout, but adds free spins
        break;
      
      case 'cosmetic':
        this.result = 'win';
        this.payout = 0; // Cosmetic unlock, no coins
        break;
    }
  }

  /**
   * Is wheel currently spinning
   */
  isSpinning(): boolean {
    return this.spinning;
  }

  /**
   * Get current segment
   */
  getCurrentSegment(): WheelSegment | null {
    return this.currentSegment;
  }
}
