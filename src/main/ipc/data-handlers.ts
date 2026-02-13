/**
 * IPC handlers for data operations
 * Handles communication between renderer and main process for data
 */

import { ipcMain } from 'electron';
import { userDataService } from '../services/data/user-data';
import { achievementService } from '../services/data/achievement-service';
import { dailyTasksService } from '../services/games/daily-tasks';
import { hourlyBonusService } from '../services/games/hourly-bonus';
import { investmentService } from '../services/games/investment';

// User data handlers
ipcMain.handle('data:getUser', async () => {
  try {
    const user = userDataService.getUser();
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('data:getUserProfile', async () => {
  try {
    const user = userDataService.getUser();
    const profile = userDataService.getUserProfile(user.id);
    return { success: true, profile };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('data:updateUser', async (event, updates) => {
  try {
    userDataService.updateUser(updates);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('data:updateProfile', async (event, updates) => {
  try {
    const user = userDataService.getUser();
    userDataService.updateUserProfile(user.id, updates);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Achievement handlers
ipcMain.handle('data:getAchievements', async () => {
  try {
    const user = userDataService.getUser();
    const unlocked = achievementService.getUnlockedAchievements(user.id);
    const totalPoints = achievementService.getTotalAchievementPoints(user.id);
    const completion = achievementService.getCompletionPercentage(user.id);
    return { success: true, unlocked, totalPoints, completion };
  } catch (error: any) {
    return { success: false, error: error.message };
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
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('data:updateTaskProgress', async (event, taskId, increment) => {
  try {
    const user = userDataService.getUser();
    const completed = dailyTasksService.updateTaskProgress(user.id, taskId, increment);
    return { success: true, completed };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Hourly bonus handlers
ipcMain.handle('data:getHourlyBonusStatus', async () => {
  try {
    const user = userDataService.getUser();
    const status = hourlyBonusService.getStatus(user.id);
    return { success: true, status };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('data:claimHourlyBonus', async () => {
  try {
    const user = userDataService.getUser();
    const result = hourlyBonusService.claimBonus(user.id);
    return { success: true, ...result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Investment handlers
ipcMain.handle('data:createInvestment', async (event, amount, riskLevel) => {
  try {
    const user = userDataService.getUser();
    const investment = investmentService.createInvestment(user.id, amount, riskLevel);
    return { success: true, investment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('data:getInvestments', async () => {
  try {
    const user = userDataService.getUser();
    const investments = investmentService.getActiveInvestments(user.id);
    return { success: true, investments };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('data:collectInvestment', async (event, investmentId) => {
  try {
    const user = userDataService.getUser();
    const result = investmentService.collectInvestment(user.id, investmentId);
    return { success: true, ...result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Data export/import
ipcMain.handle('data:export', async () => {
  try {
    const user = userDataService.getUser();
    const data = userDataService.exportUserData(user.id);
    return { success: true, data: JSON.stringify(data, null, 2) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('data:import', async (event, jsonData: string) => {
  try {
    const data = JSON.parse(jsonData);
    userDataService.importUserData(data);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
