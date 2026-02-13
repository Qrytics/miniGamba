/**
 * Investment Service
 * Manages coin investments with risk levels and returns
 */

import { databaseService } from '../data/database';
import { userDataService } from '../data/user-data';
import { achievementService } from '../data/achievement-service';

export type RiskLevel = 'safe' | 'moderate' | 'risky';

export interface Investment {
  id: number;
  userId: number;
  amount: number;
  riskLevel: RiskLevel;
  createdAt: Date;
  maturityDate: Date;
  collected: boolean;
  returnAmount?: number;
}

export interface RiskProfile {
  dailyReturn: number; // Percentage
  lossChance: number; // Percentage  
  lossAmount: number; // Percentage of principal if loss occurs
  maturityDays: number;
}

export class InvestmentService {
  private riskProfiles: Record<RiskLevel, RiskProfile> = {
    safe: {
      dailyReturn: 1.0, // 1% per day
      lossChance: 0,
      lossAmount: 0,
      maturityDays: 1
    },
    moderate: {
      dailyReturn: 3.0, // 3% per day
      lossChance: 10,
      lossAmount: 5,
      maturityDays: 1
    },
    risky: {
      dailyReturn: 8.0, // 8% per day
      lossChance: 25,
      lossAmount: 20,
      maturityDays: 1
    }
  };

  /**
   * Create a new investment
   */
  public createInvestment(userId: number, amount: number, riskLevel: RiskLevel): Investment {
    // Validate user has enough coins
    const user = userDataService.getUser();
    if (user.coins < amount) {
      throw new Error('Insufficient coins');
    }

    // Deduct coins
    userDataService.removeCoins(userId, amount);

    const db = databaseService.getDb();
    const now = new Date();
    const profile = this.riskProfiles[riskLevel];
    
    // Calculate maturity date
    const maturityDate = new Date(now);
    maturityDate.setDate(maturityDate.getDate() + profile.maturityDays);

    // Insert investment
    const result = db.prepare(`
      INSERT INTO investments (user_id, amount, risk_level, created_at, maturity_date, collected)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(userId, amount, riskLevel, now.toISOString(), maturityDate.toISOString());

    // Check investor achievement
    achievementService.checkAchievements(userId, {
      type: 'investment',
      data: { amount, riskLevel }
    });

    achievementService.unlockAchievement(userId, 'investor');

    return {
      id: result.lastInsertRowid as number,
      userId,
      amount,
      riskLevel,
      createdAt: now,
      maturityDate,
      collected: false
    };
  }

  /**
   * Get all active investments for a user
   */
  public getActiveInvestments(userId: number): Investment[] {
    const db = databaseService.getDb();
    
    const results = db.prepare(`
      SELECT * FROM investments 
      WHERE user_id = ? AND collected = 0
      ORDER BY created_at DESC
    `).all(userId) as any[];

    return results.map(row => ({
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      riskLevel: row.risk_level as RiskLevel,
      createdAt: new Date(row.created_at),
      maturityDate: new Date(row.maturity_date),
      collected: false
    }));
  }

  /**
   * Check if investment is mature
   */
  public isMature(investment: Investment): boolean {
    const now = new Date();
    return now >= investment.maturityDate;
  }

  /**
   * Collect investment returns
   */
  public collectInvestment(userId: number, investmentId: number): { 
    principal: number; 
    returns: number; 
    total: number;
    wasLoss: boolean;
  } {
    const db = databaseService.getDb();
    
    // Get investment
    const investment = db.prepare(`
      SELECT * FROM investments 
      WHERE id = ? AND user_id = ? AND collected = 0
    `).get(investmentId, userId) as any;

    if (!investment) {
      throw new Error('Investment not found or already collected');
    }

    const inv: Investment = {
      id: investment.id,
      userId: investment.user_id,
      amount: investment.amount,
      riskLevel: investment.risk_level as RiskLevel,
      createdAt: new Date(investment.created_at),
      maturityDate: new Date(investment.maturity_date),
      collected: false
    };

    // Calculate returns
    const profile = this.riskProfiles[inv.riskLevel];
    const daysInvested = Math.floor(
      (new Date().getTime() - inv.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    let principal = inv.amount;
    let returns = 0;
    let wasLoss = false;

    // Check for loss
    if (Math.random() * 100 < profile.lossChance) {
      // Loss occurred
      const lossAmount = Math.floor(inv.amount * (profile.lossAmount / 100));
      principal = inv.amount - lossAmount;
      wasLoss = true;
    } else {
      // Calculate gains
      const dailyReturnAmount = inv.amount * (profile.dailyReturn / 100);
      returns = Math.floor(dailyReturnAmount * Math.max(daysInvested, profile.maturityDays));
    }

    const total = principal + returns;

    // Award coins
    userDataService.addCoins(userId, total, false); // Don't count as "earned"

    // Mark as collected
    db.prepare(`
      UPDATE investments 
      SET collected = 1
      WHERE id = ?
    `).run(investmentId);

    // Check achievements
    this.checkInvestmentAchievements(userId, inv, returns);

    return { principal, returns, total, wasLoss };
  }

  /**
   * Cash out early (within 1 minute for paper hands achievement)
   */
  public cashOutEarly(userId: number, investmentId: number): number {
    const db = databaseService.getDb();
    
    const investment = db.prepare(`
      SELECT * FROM investments 
      WHERE id = ? AND user_id = ? AND collected = 0
    `).get(investmentId, userId) as any;

    if (!investment) {
      throw new Error('Investment not found or already collected');
    }

    const createdAt = new Date(investment.created_at);
    const now = new Date();
    const minutesSince = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    // Return principal minus 10% early withdrawal fee
    const returnAmount = Math.floor(investment.amount * 0.9);

    // Award coins
    userDataService.addCoins(userId, returnAmount, false);

    // Mark as collected
    db.prepare(`
      UPDATE investments 
      SET collected = 1
      WHERE id = ?
    `).run(investmentId);

    // Paper hands achievement (within 1 minute)
    if (minutesSince <= 1) {
      achievementService.unlockAchievement(userId, 'paper-hands');
    }

    return returnAmount;
  }

  /**
   * Check investment-related achievements
   */
  private checkInvestmentAchievements(userId: number, investment: Investment, returns: number): void {
    const db = databaseService.getDb();

    // Check if investment was held for 7+ days (diamond hands)
    const daysHeld = Math.floor(
      (new Date().getTime() - investment.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysHeld >= 7) {
      achievementService.unlockAchievement(userId, 'diamond-hands');
    }

    // Wolf of miniGamba - total investment returns
    const totalReturns = db.prepare(`
      SELECT SUM(amount) as total 
      FROM investments 
      WHERE user_id = ? AND collected = 1
    `).get(userId) as any;

    if (totalReturns && totalReturns.total >= 10000) {
      achievementService.unlockAchievement(userId, 'wolf-of-minigamba');
    }
  }

  /**
   * Get total coins invested currently
   */
  public getTotalInvested(userId: number): number {
    const db = databaseService.getDb();
    
    const result = db.prepare(`
      SELECT SUM(amount) as total 
      FROM investments 
      WHERE user_id = ? AND collected = 0
    `).get(userId) as any;

    return result?.total || 0;
  }

  /**
   * Get projected returns for an investment
   */
  public getProjectedReturns(amount: number, riskLevel: RiskLevel, days: number = 1): {
    bestCase: number;
    worstCase: number;
    expectedValue: number;
  } {
    const profile = this.riskProfiles[riskLevel];
    
    // Best case: full returns
    const dailyReturn = amount * (profile.dailyReturn / 100);
    const bestCase = Math.floor(dailyReturn * days);

    // Worst case: loss
    const worstCase = -Math.floor(amount * (profile.lossAmount / 100));

    // Expected value
    const lossProb = profile.lossChance / 100;
    const winProb = 1 - lossProb;
    const expectedValue = Math.floor(winProb * bestCase + lossProb * worstCase);

    return { bestCase, worstCase, expectedValue };
  }
}

export const investmentService = new InvestmentService();
