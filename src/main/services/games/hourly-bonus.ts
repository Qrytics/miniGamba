/**
 * Hourly Bonus Service
 * Manages hourly coin bonuses and stacking
 */

import { databaseService } from '../data/database';
import { userDataService } from '../data/user-data';
import { achievementService } from '../data/achievement-service';

export interface HourlyBonusStatus {
  lastClaimed: Date | null;
  unclaimedHours: number;
  nextAvailableTime: Date;
  canClaim: boolean;
}

export class HourlyBonusService {
  private readonly BONUS_AMOUNT = 50; // Base coins per hour
  private readonly MAX_STACK = 3; // Max hours that can stack
  private readonly HOUR_MS = 60 * 60 * 1000;

  /**
   * Get hourly bonus status
   */
  public getStatus(userId: number): HourlyBonusStatus {
    const db = databaseService.getDb();
    
    let status = db.prepare(`
      SELECT last_claimed, unclaimed_hours 
      FROM hourly_bonus 
      WHERE user_id = ?
    `).get(userId) as any;

    if (!status) {
      // Initialize bonus tracking
      db.prepare(`
        INSERT INTO hourly_bonus (user_id, last_claimed, unclaimed_hours)
        VALUES (?, NULL, 1)
      `).run(userId);

      return {
        lastClaimed: null,
        unclaimedHours: 1,
        nextAvailableTime: new Date(),
        canClaim: true
      };
    }

    const now = new Date();
    const lastClaimed = status.last_claimed ? new Date(status.last_claimed) : null;
    
    // Calculate hours since last claim
    let hoursSince = 0;
    if (lastClaimed) {
      hoursSince = Math.floor((now.getTime() - lastClaimed.getTime()) / this.HOUR_MS);
    }

    // Update unclaimed hours (capped at MAX_STACK)
    const unclaimedHours = Math.min(hoursSince > 0 ? hoursSince : status.unclaimed_hours, this.MAX_STACK);
    
    // Calculate next available time
    let nextAvailableTime = now;
    if (lastClaimed && hoursSince < 1) {
      nextAvailableTime = new Date(lastClaimed.getTime() + this.HOUR_MS);
    }

    const canClaim = hoursSince >= 1 || !lastClaimed;

    return {
      lastClaimed,
      unclaimedHours,
      nextAvailableTime,
      canClaim
    };
  }

  /**
   * Claim hourly bonus
   */
  public claimBonus(userId: number): { coins: number; hours: number; bonusEvent?: any } {
    const status = this.getStatus(userId);

    if (!status.canClaim) {
      throw new Error('Bonus not yet available');
    }

    const db = databaseService.getDb();
    const now = new Date();

    // Calculate total coins (base amount × unclaimed hours)
    const totalCoins = this.BONUS_AMOUNT * status.unclaimedHours;

    // Award coins
    userDataService.addCoins(userId, totalCoins);

    // Update last claimed time
    db.prepare(`
      UPDATE hourly_bonus 
      SET last_claimed = ?, unclaimed_hours = 0
      WHERE user_id = ?
    `).run(now.toISOString(), userId);

    // Check for achievements
    this.checkAchievements(userId, now);

    // Random bonus event (10% chance)
    let bonusEvent = null;
    if (Math.random() < 0.1) {
      bonusEvent = this.triggerBonusEvent(userId);
    }

    return {
      coins: totalCoins,
      hours: status.unclaimedHours,
      bonusEvent
    };
  }

  /**
   * Trigger a random bonus event
   */
  private triggerBonusEvent(userId: number): any {
    const events = [
      {
        type: 'extra-coins',
        name: 'Lucky Bonus!',
        description: 'Found extra coins!',
        effect: () => {
          const extraCoins = Math.floor(Math.random() * 100) + 50;
          userDataService.addCoins(userId, extraCoins);
          return { coins: extraCoins };
        }
      },
      {
        type: 'free-spin',
        name: 'Free Spin!',
        description: 'Received a free slot machine spin!',
        effect: () => {
          // Would grant a free spin token
          return { freeSpin: true };
        }
      },
      {
        type: 'scratch-card',
        name: 'Surprise Scratch Card!',
        description: 'Received a free scratch card!',
        effect: () => {
          // Would grant a free scratch card
          return { scratchCard: 'bronze' };
        }
      },
      {
        type: 'xp-boost',
        name: 'XP Boost!',
        description: 'Earned bonus XP!',
        effect: () => {
          const xp = Math.floor(Math.random() * 50) + 25;
          userDataService.addXP(userId, xp);
          return { xp };
        }
      }
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    const result = randomEvent.effect();

    return {
      type: randomEvent.type,
      name: randomEvent.name,
      description: randomEvent.description,
      ...result
    };
  }

  /**
   * Check hourly bonus achievements
   */
  private checkAchievements(userId: number, claimTime: Date): void {
    const db = databaseService.getDb();

    // Count total claims
    const totalClaims = db.prepare(`
      SELECT COUNT(*) as count 
      FROM (
        SELECT 1 FROM hourly_bonus WHERE user_id = ? AND last_claimed IS NOT NULL
      )
    `).get(userId) as any;

    // Claim King achievement (100 claims)
    if (totalClaims && totalClaims.count >= 100) {
      achievementService.unlockAchievement(userId, 'claim-king');
    }

    // Time-based achievements
    const hour = claimTime.getHours();
    
    // Early Bird (before 7 AM)
    if (hour < 7) {
      achievementService.unlockAchievement(userId, 'early-bird');
    }

    // Night Owl (after 2 AM)
    if (hour >= 2 && hour < 5) {
      achievementService.unlockAchievement(userId, 'night-owl');
    }
  }

  /**
   * Get time until next bonus
   */
  public getTimeUntilNext(userId: number): number {
    const status = this.getStatus(userId);
    
    if (status.canClaim) {
      return 0;
    }

    const now = new Date();
    return Math.max(0, status.nextAvailableTime.getTime() - now.getTime());
  }

  /**
   * Get formatted time string until next bonus
   */
  public getTimeUntilNextFormatted(userId: number): string {
    const ms = this.getTimeUntilNext(userId);
    
    if (ms === 0) {
      return 'Ready to claim!';
    }

    const minutes = Math.floor(ms / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);

    return `${minutes}m ${seconds}s`;
  }
}

export const hourlyBonusService = new HourlyBonusService();
