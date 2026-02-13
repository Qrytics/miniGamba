/**
 * Supported games configuration
 * List of games that miniGamba can detect and reward
 */

export interface GameProfile {
  id: string;
  name: string;
  executables: string[]; // Process names to detect (multiple for different versions)
  rewards: {
    perMinute: number; // Coins earned per minute of gameplay
    killCoins?: number;
    assistCoins?: number;
    winCoins?: number;
    deathTimerBonus?: number;
  };
  category: string;
}

/**
 * List of officially supported games
 */
export const SUPPORTED_GAMES: GameProfile[] = [
  // MOBAs
  {
    id: 'league-of-legends',
    name: 'League of Legends',
    executables: ['league of legends.exe', 'leagueclient.exe', 'lol.exe'],
    rewards: {
      perMinute: 2,
      killCoins: 10,
      assistCoins: 5,
      winCoins: 50,
      deathTimerBonus: 15,
    },
    category: 'MOBA',
  },
  {
    id: 'dota-2',
    name: 'Dota 2',
    executables: ['dota2.exe', 'dota 2.exe'],
    rewards: {
      perMinute: 2,
      killCoins: 10,
      assistCoins: 5,
      winCoins: 50,
      deathTimerBonus: 15,
    },
    category: 'MOBA',
  },
  
  // FPS Games
  {
    id: 'valorant',
    name: 'VALORANT',
    executables: ['valorant.exe', 'valorant-win64-shipping.exe'],
    rewards: {
      perMinute: 2,
      killCoins: 8,
      assistCoins: 4,
      winCoins: 40,
      deathTimerBonus: 10,
    },
    category: 'FPS',
  },
  {
    id: 'cs2',
    name: 'Counter-Strike 2',
    executables: ['cs2.exe', 'csgo.exe'],
    rewards: {
      perMinute: 2,
      killCoins: 8,
      assistCoins: 4,
      winCoins: 40,
      deathTimerBonus: 10,
    },
    category: 'FPS',
  },
  {
    id: 'apex-legends',
    name: 'Apex Legends',
    executables: ['r5apex.exe', 'apex_legends.exe'],
    rewards: {
      perMinute: 2,
      killCoins: 7,
      assistCoins: 3,
      winCoins: 45,
      deathTimerBonus: 12,
    },
    category: 'FPS',
  },
  {
    id: 'overwatch-2',
    name: 'Overwatch 2',
    executables: ['overwatch.exe', 'overwatch2.exe'],
    rewards: {
      perMinute: 2,
      killCoins: 5,
      assistCoins: 3,
      winCoins: 35,
      deathTimerBonus: 8,
    },
    category: 'FPS',
  },
  
  // Battle Royale
  {
    id: 'fortnite',
    name: 'Fortnite',
    executables: ['fortniteclient-win64-shipping.exe', 'fortnite.exe'],
    rewards: {
      perMinute: 2,
      killCoins: 6,
      winCoins: 60,
      deathTimerBonus: 15,
    },
    category: 'Battle Royale',
  },
  {
    id: 'pubg',
    name: 'PUBG',
    executables: ['tslgame.exe', 'pubg.exe'],
    rewards: {
      perMinute: 2,
      killCoins: 7,
      winCoins: 55,
      deathTimerBonus: 12,
    },
    category: 'Battle Royale',
  },
  
  // MMORPGs
  {
    id: 'world-of-warcraft',
    name: 'World of Warcraft',
    executables: ['wow.exe', 'wowclassic.exe', 'worldofwarcraft.exe'],
    rewards: {
      perMinute: 1,
    },
    category: 'MMORPG',
  },
  {
    id: 'final-fantasy-14',
    name: 'Final Fantasy XIV',
    executables: ['ffxiv_dx11.exe', 'ffxiv.exe'],
    rewards: {
      perMinute: 1,
    },
    category: 'MMORPG',
  },
  
  // Other Popular Games
  {
    id: 'rocket-league',
    name: 'Rocket League',
    executables: ['rocketleague.exe'],
    rewards: {
      perMinute: 2,
      winCoins: 25,
    },
    category: 'Sports',
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    executables: ['minecraft.exe', 'javaw.exe'],
    rewards: {
      perMinute: 1,
    },
    category: 'Sandbox',
  },
];

/**
 * Get all supported games
 */
export function getSupportedGames(): GameProfile[] {
  return SUPPORTED_GAMES;
}

/**
 * Get game by executable name
 */
export function getGameByExecutable(executable: string): GameProfile | undefined {
  const execLower = executable.toLowerCase();
  return SUPPORTED_GAMES.find(game => 
    game.executables.some(exe => exe.toLowerCase() === execLower)
  );
}

/**
 * Get game by ID
 */
export function getGameById(id: string): GameProfile | undefined {
  return SUPPORTED_GAMES.find(game => game.id === id);
}

/**
 * Check if game is supported
 */
export function isGameSupported(executable: string): boolean {
  return getGameByExecutable(executable) !== undefined;
}

/**
 * Get games by category
 */
export function getGamesByCategory(category: string): GameProfile[] {
  return SUPPORTED_GAMES.filter(game => game.category === category);
}

/**
 * Get all categories
 */
export function getCategories(): string[] {
  return [...new Set(SUPPORTED_GAMES.map(game => game.category))];
}
