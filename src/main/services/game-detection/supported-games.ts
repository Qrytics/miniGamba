/**
 * Supported games configuration
 * List of games that miniGamba can detect and reward
 */

export interface SupportedGame {
  id: string;
  name: string;
  executable: string; // Process name to detect
  rewards: {
    killCoins: number;
    assistCoins: number;
    winCoins: number;
    deathTimerBonus: number;
  };
}

/**
 * List of officially supported games
 * TODO: Expand this list based on popular games
 */
export const SUPPORTED_GAMES: SupportedGame[] = [
  {
    id: 'league-of-legends',
    name: 'League of Legends',
    executable: 'League of Legends.exe',
    rewards: {
      killCoins: 10,
      assistCoins: 5,
      winCoins: 50,
      deathTimerBonus: 15,
    },
  },
  {
    id: 'valorant',
    name: 'VALORANT',
    executable: 'VALORANT.exe',
    rewards: {
      killCoins: 8,
      assistCoins: 4,
      winCoins: 40,
      deathTimerBonus: 10,
    },
  },
  // TODO: Add more games
  // - Counter-Strike 2
  // - Dota 2
  // - Overwatch 2
  // - Apex Legends
  // - Fortnite
  // - etc.
];

/**
 * Get game by executable name
 */
export function getGameByExecutable(executable: string): SupportedGame | undefined {
  return SUPPORTED_GAMES.find(game => game.executable === executable);
}

/**
 * Get game by ID
 */
export function getGameById(id: string): SupportedGame | undefined {
  return SUPPORTED_GAMES.find(game => game.id === id);
}

/**
 * Check if game is supported
 */
export function isGameSupported(executable: string): boolean {
  return SUPPORTED_GAMES.some(game => game.executable === executable);
}
