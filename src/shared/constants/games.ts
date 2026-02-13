/**
 * Game constants and configuration
 */

import { GameType } from '../types/game.types';

export const GAME_NAMES: Record<GameType, string> = {
  'slot-machine': 'Slot Machine',
  'blackjack': 'Blackjack',
  'coin-flip': 'Coin Flip',
  'higher-or-lower': 'Higher or Lower',
  'mine-sweeper': 'Mine Sweeper',
  'scratch-cards': 'Scratch Cards',
  'wheel-of-fortune': 'Wheel of Fortune',
  'mini-derby': 'Mini Derby',
  'dice-roll': 'Dice Roll',
  'mini-poker': 'Mini Poker',
};

export const GAME_ICONS: Record<GameType, string> = {
  'slot-machine': '🎰',
  'blackjack': '🃏',
  'coin-flip': '🪙',
  'higher-or-lower': '🎯',
  'mine-sweeper': '🧨',
  'scratch-cards': '🎰',
  'wheel-of-fortune': '🎡',
  'mini-derby': '🏇',
  'dice-roll': '🎲',
  'mini-poker': '🃏',
};

export const GAME_MIN_BETS: Record<GameType, number> = {
  'slot-machine': 10,
  'blackjack': 10,
  'coin-flip': 5,
  'higher-or-lower': 10,
  'mine-sweeper': 20,
  'scratch-cards': 50,
  'wheel-of-fortune': 100,
  'mini-derby': 20,
  'dice-roll': 10,
  'mini-poker': 25,
};

export const GAME_MAX_BETS: Record<GameType, number> = {
  'slot-machine': 1000,
  'blackjack': 1000,
  'coin-flip': 5000,
  'higher-or-lower': 1000,
  'mine-sweeper': 2000,
  'scratch-cards': 5000,
  'wheel-of-fortune': 500,
  'mini-derby': 2000,
  'dice-roll': 1000,
  'mini-poker': 1000,
};

// TODO: Add more game-specific constants
// - Unlock levels
// - Default settings
// - Game descriptions
