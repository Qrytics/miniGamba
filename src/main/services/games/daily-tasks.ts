/**
 * Daily Tasks Service
 * Manages daily missions and challenges for coin rewards
 */

import { databaseService } from '../data/database';
import { userDataService } from '../data/user-data';
import { achievementService } from '../data/achievement-service';

export interface DailyTask {
  id: string;
  name: string;
  description: string;
  requirement: number;
  coinReward: number;
  xpReward: number;
}

export interface DailyTaskProgress {
  taskId: string;
  progress: number;
  completed: boolean;
  date: string;
}

export class DailyTasksService {
  // Define all possible daily tasks
  private allTasks: DailyTask[] = [
    {
      id: 'win-coin-flips',
      name: 'Lucky Flipper',
      description: 'Win 3 coin flips in a row',
      requirement: 3,
      coinReward: 150,
      xpReward: 50
    },
    {
      id: 'play-different-games',
      name: 'Variety Player',
      description: 'Play 5 different mini-games today',
      requirement: 5,
      coinReward: 200,
      xpReward: 75
    },
    {
      id: 'higher-lower-streak',
      name: 'Streak Master',
      description: 'Hit a 5x multiplier in Higher or Lower',
      requirement: 5,
      coinReward: 250,
      xpReward: 100
    },
    {
      id: 'scratch-cards',
      name: 'Scratch Enthusiast',
      description: 'Scratch 3 scratch cards',
      requirement: 3,
      coinReward: 100,
      xpReward: 40
    },
    {
      id: 'spin-wheel',
      name: 'Wheel Spinner',
      description: 'Spin the Wheel of Fortune',
      requirement: 1,
      coinReward: 100,
      xpReward: 30
    },
    {
      id: 'watch-video',
      name: 'Media Consumer',
      description: 'Watch 30 minutes of video content',
      requirement: 30,
      coinReward: 150,
      xpReward: 50
    },
    {
      id: 'blackjack-21',
      name: 'Perfect Hand',
      description: 'Win a blackjack hand with exactly 21',
      requirement: 1,
      coinReward: 200,
      xpReward: 80
    },
    {
      id: 'survive-death-timers',
      name: 'Patience Rewarded',
      description: 'Survive 3 death timers without gambling',
      requirement: 3,
      coinReward: 180,
      xpReward: 60
    },
    {
      id: 'play-total-games',
      name: 'Game Addict',
      description: 'Play 20 games total today',
      requirement: 20,
      coinReward: 300,
      xpReward: 120
    },
    {
      id: 'earn-coins',
      name: 'Money Maker',
      description: 'Earn 1,000 coins today',
      requirement: 1000,
      coinReward: 200,
      xpReward: 80
    },
    {
      id: 'win-streak',
      name: 'Winning Streak',
      description: 'Win 5 games in a row',
      requirement: 5,
      coinReward: 250,
      xpReward: 100
    },
    {
      id: 'big-win',
      name: 'Big Winner',
      description: 'Win 500 coins in a single game',
      requirement: 500,
      coinReward: 300,
      xpReward: 150
    }
  ];

  /**
   * Get today's daily tasks (randomly selected 5 tasks)
   */
  public getDailyTasks(userId: number): DailyTask[] {
    const today = this.getTodayString();
    
    // Check if we already selected today's tasks
    const db = databaseService.getDb();
    const existingTasks = db.prepare(`
      SELECT DISTINCT task_id 
      FROM daily_tasks 
      WHERE user_id = ? AND date = ?
    `).all(userId, today) as any[];

    if (existingTasks.length > 0) {
      // Return existing tasks for today
      return existingTasks.map(row => 
        this.allTasks.find(t => t.id === row.task_id)!
      ).filter(Boolean);
    }

    // Select 5 random tasks for today using unbiased Fisher–Yates shuffle
    const shuffled = [...this.allTasks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selectedTasks = shuffled.slice(0, 5);

    // Initialize in database
    for (const task of selectedTasks) {
      db.prepare(`
        INSERT INTO daily_tasks (user_id, task_id, completed, progress, date)
        VALUES (?, ?, 0, 0, ?)
      `).run(userId, task.id, today);
    }

    return selectedTasks;
  }

  /**
   * Get progress for today's tasks
   */
  public getTaskProgress(userId: number): DailyTaskProgress[] {
    const db = databaseService.getDb();
    const today = this.getTodayString();

    const results = db.prepare(`
      SELECT task_id, progress, completed 
      FROM daily_tasks 
      WHERE user_id = ? AND date = ?
    `).all(userId, today) as any[];

    return results.map(row => ({
      taskId: row.task_id,
      progress: row.progress,
      completed: row.completed === 1,
      date: today
    }));
  }

  /**
   * Update task progress
   */
  public updateTaskProgress(userId: number, taskId: string, increment: number = 1): boolean {
    const db = databaseService.getDb();
    const today = this.getTodayString();

    // Get current progress
    const current = db.prepare(`
      SELECT progress, completed 
      FROM daily_tasks 
      WHERE user_id = ? AND task_id = ? AND date = ?
    `).get(userId, taskId, today) as any;

    if (!current || current.completed) {
      return false; // Task not found or already completed
    }

    const task = this.allTasks.find(t => t.id === taskId);
    if (!task) return false;

    const newProgress = current.progress + increment;
    const isCompleted = newProgress >= task.requirement;

    // Update progress
    db.prepare(`
      UPDATE daily_tasks 
      SET progress = ?, completed = ?
      WHERE user_id = ? AND task_id = ? AND date = ?
    `).run(newProgress, isCompleted ? 1 : 0, userId, taskId, today);

    // Award rewards if completed
    if (isCompleted && !current.completed) {
      userDataService.addCoins(userId, task.coinReward);
      userDataService.addXP(userId, task.xpReward);

      // Check for daily completion achievement
      this.checkDailyCompletionAchievements(userId);

      return true;
    }

    return false;
  }

  /**
   * Check if all dailies are completed
   */
  public areAllTasksCompleted(userId: number): boolean {
    const db = databaseService.getDb();
    const today = this.getTodayString();

    const result = db.prepare(`
      SELECT COUNT(*) as total, SUM(completed) as completed
      FROM daily_tasks 
      WHERE user_id = ? AND date = ?
    `).get(userId, today) as any;

    return result.total > 0 && result.total === result.completed;
  }

  /**
   * Award daily chest for completing all tasks
   */
  public awardDailyChest(userId: number): void {
    if (!this.areAllTasksCompleted(userId)) return;

    // Award bonus coins and XP
    const bonusCoins = 500;
    const bonusXP = 200;

    userDataService.addCoins(userId, bonusCoins);
    userDataService.addXP(userId, bonusXP);

    // Random chance for cosmetic unlock
    if (Math.random() < 0.1) { // 10% chance
      // Award random cosmetic
      this.awardRandomCosmetic(userId);
    }
  }

  /**
   * Award a random cosmetic item
   */
  private awardRandomCosmetic(userId: number): void {
    const cosmetics = [
      { type: 'theme', id: 'neon' },
      { type: 'theme', id: 'retro' },
      { type: 'slot-skin', id: 'gems' },
      { type: 'card-back', id: 'gold' },
      { type: 'dice-skin', id: 'ruby' }
    ];

    const randomCosmetic = cosmetics[Math.floor(Math.random() * cosmetics.length)];

    const db = databaseService.getDb();
    db.prepare(`
      INSERT OR IGNORE INTO cosmetics_owned (user_id, cosmetic_type, cosmetic_id)
      VALUES (?, ?, ?)
    `).run(userId, randomCosmetic.type, randomCosmetic.id);
  }

  /**
   * Check achievements related to daily task completion
   */
  private checkDailyCompletionAchievements(userId: number): void {
    if (this.areAllTasksCompleted(userId)) {
      achievementService.unlockAchievement(userId, 'daily-grinder');

      // Check for consecutive days
      const consecutiveDays = this.getConsecutiveDaysCompleted(userId);
      if (consecutiveDays >= 7) {
        achievementService.unlockAchievement(userId, 'weekly-warrior');
      }
      if (consecutiveDays >= 30) {
        achievementService.unlockAchievement(userId, 'monthly-maniac');
      }
    }
  }

  /**
   * Get consecutive days of completed dailies
   */
  private getConsecutiveDaysCompleted(userId: number): number {
    const db = databaseService.getDb();
    
    // Get all dates where all tasks were completed
    const completedDates = db.prepare(`
      SELECT date, COUNT(*) as total, SUM(completed) as completed
      FROM daily_tasks 
      WHERE user_id = ?
      GROUP BY date
      HAVING total = completed
      ORDER BY date DESC
    `).all(userId) as any[];

    if (completedDates.length === 0) return 0;

    let consecutive = 1;
    let currentDate = new Date(completedDates[0].date);

    for (let i = 1; i < completedDates.length; i++) {
      const prevDate = new Date(completedDates[i].date);
      const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        consecutive++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return consecutive;
  }

  /**
   * Get today's date string (YYYY-MM-DD)
   */
  private getTodayString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Reset daily tasks (called at midnight)
   */
  public resetDailyTasks(userId: number): void {
    // Daily tasks are date-based, so they automatically "reset" 
    // when getDailyTasks is called with a new date
    // This method can be used to trigger any end-of-day processing
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    // Check if yesterday's tasks were completed
    if (this.areAllTasksCompleted(userId)) {
      this.awardDailyChest(userId);
    }
  }
}

export const dailyTasksService = new DailyTasksService();
