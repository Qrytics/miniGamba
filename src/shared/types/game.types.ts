/**
 * Game-related type definitions
 */

export type GameType =
  | 'slot-machine'
  | 'blackjack'
  | 'coin-flip'
  | 'higher-or-lower'
  | 'mine-sweeper'
  | 'scratch-cards'
  | 'wheel-of-fortune'
  | 'mini-derby'
  | 'dice-roll'
  | 'mini-poker';

export type GameResult = 'win' | 'loss' | 'push';

export interface GameSession {
  id: string;
  gameType: GameType;
  startTime: Date;
  bet: number;
}

export interface GameOutcome {
  result: GameResult;
  payout: number;
  details: any; // Game-specific details
}

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  biggestWin: number;
  biggestLoss: number;
  currentStreak: number;
  bestStreak: number;
}

// TODO: Add specific game state interfaces
export interface SlotMachineState {
  reels: string[][];
  spinning: boolean;
  holdReels?: boolean[];
}

export interface BlackjackState {
  playerHand: string[];
  dealerHand: string[];
  playerScore: number;
  dealerScore: number;
  stage: 'betting' | 'playing' | 'dealer' | 'complete';
}

export interface CoinFlipState {
  choice: 'heads' | 'tails' | null;
  result: 'heads' | 'tails' | null;
  flipping: boolean;
}

// TODO: Add more game state interfaces for each game
