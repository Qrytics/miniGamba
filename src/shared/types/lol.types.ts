/**
 * League of Legends shared types
 * Used by both main process services and renderer components
 */

/** LCU connection status */
export interface LCUStatus {
  connected: boolean;
  port?: number;
}

/** Basic summoner info from LCU */
export interface Summoner {
  summonerId: number;
  accountId: number;
  puuid: string;
  gameName: string;
  tagLine: string;
  /** Display name (gameName#tagLine or legacy name) */
  displayName: string;
  summonerLevel: number;
  profileIconId: number;
}

/** Tier/division ranking */
export interface RankedEntry {
  queueType: string;
  tier: string;
  division: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: number;
  hotStreak: boolean;
}

/** Champion mastery record */
export interface ChampionMastery {
  championId: number;
  championName: string;
  championLevel: number;
  championPoints: number;
}

/** One participant in a match history entry */
export interface MatchParticipant {
  summonerName: string;
  championId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  role: string;
  lane: string;
}

/** Match history entry */
export interface MatchHistoryEntry {
  gameId: number;
  gameMode: string;
  gameDuration: number;
  gameCreation: number;
  participants: MatchParticipant[];
  /** The current summoner's participant data */
  selfParticipant?: MatchParticipant;
}

/** Champion select session - one player slot */
export interface ChampSelectPlayer {
  summonerId: number;
  summonerName: string;
  championId: number;
  championName: string;
  assignedPosition: string;
  team: 'ally' | 'enemy';
}

/** Champion select session data */
export interface ChampSelectSession {
  isActive: boolean;
  localPlayerCellId: number;
  myTeam: ChampSelectPlayer[];
  theirTeam: ChampSelectPlayer[];
  timer: {
    phase: string;
    adjustedTimeLeftInPhase: number;
  };
}

/** Live in-game player data (from Live Client Data API) */
export interface LiveGamePlayer {
  summonerName: string;
  championName: string;
  team: string;
  position: string;
  level: number;
  kills: number;
  deaths: number;
  assists: number;
  goldEarned: number;
  items: number[];
  scores: {
    assists: number;
    creepScore: number;
    deaths: number;
    kills: number;
    wardScore: number;
  };
}

/** Live game data from port 2999 */
export interface LiveGameData {
  isActive: boolean;
  gameTime: number;
  players: LiveGamePlayer[];
  activePlayer?: {
    summonerName: string;
    championStats: {
      abilityPower: number;
      armor: number;
      attackDamage: number;
      health: number;
      maxHealth: number;
      mana: number;
      maxMana: number;
    };
    currentGold: number;
    level: number;
  };
  events?: {
    dragonKills: number;
    baronKills: number;
    turretKills: number;
  };
}

/** Summoner profile with all stats combined */
export interface SummonerProfile {
  summoner: Summoner;
  rankedEntries: RankedEntry[];
  championMasteries: ChampionMastery[];
  recentMatches: MatchHistoryEntry[];
}
