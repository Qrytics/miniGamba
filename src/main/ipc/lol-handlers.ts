/**
 * IPC handlers for League of Legends features
 *
 * Exposes the LCU API and Live Client Data API to the renderer process
 * in a safe, structured way via Electron's IPC mechanism.
 */

import { ipcMain } from 'electron';
import { lcuService } from '../services/lol/lcu-service';
import { liveClientService } from '../services/lol/live-client-service';

// ── LCU status ─────────────────────────────────────────────────────────────

ipcMain.handle('lol:getStatus', () => {
  return {
    lcuConnected: lcuService.isConnected,
    inGame: liveClientService.isActive,
  };
});

// ── Current summoner ────────────────────────────────────────────────────────

ipcMain.handle('lol:getCurrentSummoner', async () => {
  try {
    const summoner = await lcuService.getCurrentSummoner();
    return { success: true, summoner };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// ── Summoner lookup ─────────────────────────────────────────────────────────

ipcMain.handle('lol:getSummonerByName', async (_event, name: string) => {
  try {
    if (!name || typeof name !== 'string') {
      return { success: false, error: 'Invalid summoner name' };
    }
    const trimmed = name.trim().slice(0, 64);
    if (!trimmed) {
      return { success: false, error: 'Summoner name cannot be empty' };
    }
    const summoner = await lcuService.getSummonerByName(trimmed);
    return { success: true, summoner };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// ── Ranked stats ─────────────────────────────────────────────────────────────

ipcMain.handle('lol:getRankedStats', async (_event, summonerId: number) => {
  try {
    if (!summonerId || typeof summonerId !== 'number') {
      return { success: false, error: 'Invalid summoner ID' };
    }
    const ranked = await lcuService.getRankedStats(summonerId);
    return { success: true, ranked };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// ── Champion masteries ────────────────────────────────────────────────────────

ipcMain.handle('lol:getChampionMasteries', async (_event, puuid: string) => {
  try {
    if (!puuid || typeof puuid !== 'string') {
      return { success: false, error: 'Invalid PUUID' };
    }
    const masteries = await lcuService.getChampionMasteries(puuid);
    return { success: true, masteries };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// ── Match history ─────────────────────────────────────────────────────────────

ipcMain.handle('lol:getMatchHistory', async (_event, puuid: string, begIndex = 0, endIndex = 19) => {
  try {
    if (!puuid || typeof puuid !== 'string') {
      return { success: false, error: 'Invalid PUUID' };
    }
    const matches = await lcuService.getMatchHistory(puuid, begIndex, endIndex);
    return { success: true, matches };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// ── Champion select ──────────────────────────────────────────────────────────

ipcMain.handle('lol:getChampSelectSession', async () => {
  try {
    const session = await lcuService.getChampSelectSession();
    return { success: true, session };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// ── Live in-game data ─────────────────────────────────────────────────────────

ipcMain.handle('lol:getLiveGameData', async () => {
  try {
    if (!liveClientService.isActive) {
      // Try a direct fetch in case polling hasn't run yet
      try {
        const data = await liveClientService.getAllGameData();
        return { success: true, data };
      } catch {
        return { success: true, data: null };
      }
    }
    const data = liveClientService.getCachedData();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
