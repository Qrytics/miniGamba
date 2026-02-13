/**
 * Process monitoring service
 * Detects running games and triggers coin rewards
 */

// TODO: Import process monitoring library (node-process-list or similar)

let monitoringInterval: NodeJS.Timeout | null = null;
let currentGame: string | null = null;

/**
 * Start game detection
 * TODO: Implement process monitoring
 */
export function startGameDetection(): void {
  console.log('Starting game detection...');
  
  // TODO: Start monitoring running processes
  // monitoringInterval = setInterval(checkRunningGames, 5000);
  
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
 * TODO: Implement process checking
 */
function checkRunningGames(): void {
  // TODO: Get list of running processes
  // TODO: Check against supported games list
  // TODO: Trigger onGameDetected if new game found
  // TODO: Trigger onGameClosed if game closed
}

/**
 * Handle game detected
 * TODO: Implement game detection handler
 */
function onGameDetected(gameName: string): void {
  currentGame = gameName;
  console.log('Game detected:', gameName);
  // TODO: Notify renderer process
  // TODO: Start game-specific tracking
}

/**
 * Handle game closed
 * TODO: Implement game closed handler
 */
function onGameClosed(gameName: string): void {
  currentGame = null;
  console.log('Game closed:', gameName);
  // TODO: Notify renderer process
  // TODO: Stop game-specific tracking
}

/**
 * Get currently running game
 */
export function getCurrentGame(): string | null {
  return currentGame;
}

/**
 * Manually add a game to monitoring
 * TODO: Implement custom game profile
 */
export function addCustomGame(executableName: string, displayName: string): void {
  // TODO: Add to supported games list
  console.log('Custom game added:', displayName);
}
