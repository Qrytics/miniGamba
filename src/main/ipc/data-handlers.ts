/**
 * IPC handlers for data operations
 * Handles communication between renderer and main process for data
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { userDataService } from '../services/data/user-data';
import { achievementService } from '../services/data/achievement-service';
import { dailyTasksService } from '../services/games/daily-tasks';
import { hourlyBonusService } from '../services/games/hourly-bonus';
import { investmentService } from '../services/games/investment';
import { RiskLevel } from '../services/games/investment';

// User data handlers
ipcMain.handle('data:getUser', async () => {
  try {
    const user = userDataService.getUser();
    return { success: true, user };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('data:getUserProfile', async () => {
  try {
    const user = userDataService.getUser();
    const profile = userDataService.getUserProfile(user.id);
    return { success: true, profile };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('data:updateUser', async (_event: IpcMainInvokeEvent, updates: Partial<import('../../shared/types/user.types').User>) => {
  try {
    userDataService.updateUser(updates);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('data:updateProfile', async (_event: IpcMainInvokeEvent, updates: Partial<import('../../shared/types/user.types').UserProfile>) => {
  try {
    const user = userDataService.getUser();
    userDataService.updateUserProfile(user.id, updates);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Achievement handlers
ipcMain.handle('data:getAchievements', async () => {
  try {
    const user = userDataService.getUser();
    const unlocked = achievementService.getUnlockedAchievements(user.id);
    const totalPoints = achievementService.getTotalAchievementPoints(user.id);
    const completion = achievementService.getCompletionPercentage(user.id);
    const unlockedIdStrings = new Set(unlocked.map((u) => u.achievementId as string));

    // Import achievement definitions and merge with unlock status so the
    // renderer can display all achievements (locked + unlocked) in one list.
    const { achievements: achievementDefs } = await import('../../shared/constants/achievements');
    const allAchievements = Object.values(achievementDefs).map((def) => ({
      ...def,
      unlocked: unlockedIdStrings.has(def.id),
      unlockedAt: unlocked.find((u) => (u.achievementId as string) === def.id)?.unlockedAt ?? null,
    }));

    return { success: true, achievements: allAchievements, totalPoints, completion };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Daily tasks handlers
ipcMain.handle('data:getDailyTasks', async () => {
  try {
    const user = userDataService.getUser();
    const tasks = dailyTasksService.getDailyTasks(user.id);
    const progress = dailyTasksService.getTaskProgress(user.id);
    const allCompleted = dailyTasksService.areAllTasksCompleted(user.id);
    return { success: true, tasks, progress, allCompleted };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('data:updateTaskProgress', async (_event: IpcMainInvokeEvent, taskId: string, increment: number) => {
  try {
    const user = userDataService.getUser();
    const completed = dailyTasksService.updateTaskProgress(user.id, taskId, increment);
    return { success: true, completed };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Hourly bonus handlers
ipcMain.handle('data:getHourlyBonusStatus', async () => {
  try {
    const user = userDataService.getUser();
    const status = hourlyBonusService.getStatus(user.id);
    return { success: true, status };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Alias: renderer preload uses 'data:getHourlyBonus' – returns status flattened
ipcMain.handle('data:getHourlyBonus', async () => {
  try {
    const user = userDataService.getUser();
    const status = hourlyBonusService.getStatus(user.id);
    const timeUntilNext = status.canClaim ? null : hourlyBonusService.getTimeUntilNextFormatted(user.id);
    const totalMs = 60 * 60 * 1000;
    const usedMs = status.lastClaimed ? (Date.now() - status.lastClaimed.getTime()) : totalMs;
    const progress = Math.min(100, (usedMs / totalMs) * 100);
    return {
      success: true,
      canClaim: status.canClaim,
      amount: 50,
      timeUntilNext: timeUntilNext ?? 'Ready!',
      progress: status.canClaim ? 100 : progress,
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('data:claimHourlyBonus', async () => {
  try {
    const user = userDataService.getUser();
    const result = hourlyBonusService.claimBonus(user.id);
    return { success: true, ...result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Investment handlers
ipcMain.handle('data:createInvestment', async (_event: IpcMainInvokeEvent, amount: number, riskLevel: RiskLevel) => {
  try {
    const user = userDataService.getUser();
    const investment = investmentService.createInvestment(user.id, amount, riskLevel);
    return { success: true, investment };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('data:getInvestments', async () => {
  try {
    const user = userDataService.getUser();
    const investments = investmentService.getActiveInvestments(user.id);
    return { success: true, investments };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('data:collectInvestment', async (_event: IpcMainInvokeEvent, investmentId: number) => {
  try {
    const user = userDataService.getUser();
    const result = investmentService.collectInvestment(user.id, investmentId);
    return { success: true, ...result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Alias used by preload API
ipcMain.handle('data:cashOutInvestment', async (_event: IpcMainInvokeEvent, investmentId: number) => {
  try {
    const user = userDataService.getUser();
    const result = investmentService.collectInvestment(user.id, investmentId);
    return { success: true, ...result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Data export/import
ipcMain.handle('data:export', async () => {
  try {
    const user = userDataService.getUser();
    const data = userDataService.exportUserData(user.id);
    return { success: true, data: JSON.stringify(data, null, 2) };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('data:import', async (_event: IpcMainInvokeEvent, jsonData: string) => {
  try {
    const data = JSON.parse(jsonData) as unknown;
    userDataService.importUserData(data);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Test-only handler: Add coins (only works in test mode)
ipcMain.handle('data:addCoins', async (_event: IpcMainInvokeEvent, amount: number) => {
  // Only allow in test mode
  if (process.env.PLAYWRIGHT_TEST !== 'true' && process.env.NODE_ENV !== 'test') {
    return { success: false, error: 'This handler is only available in test mode' };
  }
  
  try {
    const user = userDataService.getUser();
    userDataService.addCoins(user.id, amount, false); // Don't count as earned
    const updatedUser = userDataService.getUser();
    return { success: true, coins: updatedUser.coins };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});
