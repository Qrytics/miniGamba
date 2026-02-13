/**
 * Process monitoring service
 * Detects running games and triggers coin rewards
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { getSupportedGames, GameProfile } from './supported-games';

const execAsync = promisify(exec);

let monitoringInterval: NodeJS.Timeout | null = null;
let currentGame: GameProfile | null = null;
let listeners: Array<(game: GameProfile | null) => void> = [];

/**
 * Start game detection
 */
export function startGameDetection(): void {
  console.log('Starting game detection...');
  
  // Start monitoring running processes
  monitoringInterval = setInterval(checkRunningGames, 5000); // Check every 5 seconds
  
  console.log('Game detection started');
}

/**
 * Stop game detection
 */
export function stopGameDetection(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  console.log('Game detection stopped');
}

/**
 * Check for running games
 */
async function checkRunningGames(): Promise<void> {
  try {
    const runningProcesses = await getRunningProcesses();
    const supportedGames = getSupportedGames();
    
    // Check if any supported game is running
    let foundGame: GameProfile | null = null;
    
    for (const game of supportedGames) {
      for (const executable of game.executables) {
        if (runningProcesses.includes(executable.toLowerCase())) {
          foundGame = game;
          break;
        }
      }
      if (foundGame) break;
    }
    
    // Handle game state changes
    if (foundGame && !currentGame) {
      onGameDetected(foundGame);
    } else if (!foundGame && currentGame) {
      onGameClosed(currentGame);
    } else if (foundGame && currentGame && foundGame.name !== currentGame.name) {
      onGameClosed(currentGame);
      onGameDetected(foundGame);
    }
  } catch (error) {
    console.error('Error checking running games:', error);
  }
}

/**
 * Get list of running processes based on platform
 */
async function getRunningProcesses(): Promise<string[]> {
  try {
    let command: string;
    
    if (process.platform === 'win32') {
      command = 'tasklist /FO CSV /NH';
    } else if (process.platform === 'darwin') {
      command = 'ps -A -o comm=';
    } else {
      command = 'ps -eo comm';
    }
    
    const { stdout } = await execAsync(command);
    
    if (process.platform === 'win32') {
      // Parse Windows tasklist output
      return stdout
        .split('\n')
        .map(line => line.split(',')[0])
        .map(name => name.replace(/"/g, '').toLowerCase())
        .filter(Boolean);
    } else {
      // Parse Unix-like ps output
      return stdout
        .split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(Boolean);
    }
  } catch (error) {
    console.error('Error getting running processes:', error);
    return [];
  }
}

/**
 * Handle game detected
 */
function onGameDetected(game: GameProfile): void {
  currentGame = game;
  console.log('Game detected:', game.name);
  
  // Notify listeners
  listeners.forEach(listener => listener(game));
}

/**
 * Handle game closed
 */
function onGameClosed(game: GameProfile): void {
  console.log('Game closed:', game.name);
  currentGame = null;
  
  // Notify listeners
  listeners.forEach(listener => listener(null));
}

/**
 * Get currently running game
 */
export function getCurrentGame(): GameProfile | null {
  return currentGame;
}

/**
 * Add game detection listener
 */
export function addGameListener(listener: (game: GameProfile | null) => void): void {
  listeners.push(listener);
}

/**
 * Remove game detection listener
 */
export function removeGameListener(listener: (game: GameProfile | null) => void): void {
  listeners = listeners.filter(l => l !== listener);
}

/**
 * Manually trigger game detection check
 */
export async function checkGamesNow(): Promise<GameProfile | null> {
  await checkRunningGames();
  return currentGame;
}
