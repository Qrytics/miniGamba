/**
 * Slot machine symbol definitions - individual cropped icon images
 */

// Individual icon imports (cropped from sprite sheet)
import iconBell from '../../../../assets/images/games/slot-symbols/icons/bell.png';
import iconBar from '../../../../assets/images/games/slot-symbols/icons/bar.png';
import iconSeven from '../../../../assets/images/games/slot-symbols/icons/seven.png';
import iconWin from '../../../../assets/images/games/slot-symbols/icons/win.png';
import iconOrange from '../../../../assets/images/games/slot-symbols/icons/orange.png';
import iconDiamond from '../../../../assets/images/games/slot-symbols/icons/diamond.png';
import iconCherries from '../../../../assets/images/games/slot-symbols/icons/cherries.png';
import iconHorseshoe from '../../../../assets/images/games/slot-symbols/icons/horseshoe.png';
import iconLemon from '../../../../assets/images/games/slot-symbols/icons/lemon.png';
import iconWatermelon from '../../../../assets/images/games/slot-symbols/icons/watermelon.png';
import iconBananas from '../../../../assets/images/games/slot-symbols/icons/bananas.png';
import iconPlum from '../../../../assets/images/games/slot-symbols/icons/plum.png';
import iconChip from '../../../../assets/images/games/slot-symbols/icons/chip.png';
import iconDice from '../../../../assets/images/games/slot-symbols/icons/dice.png';
import iconClover from '../../../../assets/images/games/slot-symbols/icons/clover.png';
import iconWheat from '../../../../assets/images/games/slot-symbols/icons/wheat.png';

export type SlotSymbolId =
  | 'bell'
  | 'bar'
  | 'seven'
  | 'win'
  | 'orange'
  | 'diamond'
  | 'cherries'
  | 'horseshoe'
  | 'lemon'
  | 'watermelon'
  | 'bananas'
  | 'plum'
  | 'chip'
  | 'dice'
  | 'clover'
  | 'wheat';

export interface SlotSymbolSprite {
  id: SlotSymbolId;
  name: string;
  weight: number;
  multiplier: number;
}

/** Map symbol IDs to their cropped icon image URLs */
export const SLOT_SYMBOL_IMAGES: Record<SlotSymbolId, string> = {
  bell: iconBell,
  bar: iconBar,
  seven: iconSeven,
  win: iconWin,
  orange: iconOrange,
  diamond: iconDiamond,
  cherries: iconCherries,
  horseshoe: iconHorseshoe,
  lemon: iconLemon,
  watermelon: iconWatermelon,
  bananas: iconBananas,
  plum: iconPlum,
  chip: iconChip,
  dice: iconDice,
  clover: iconClover,
  wheat: iconWheat,
};

/** Classic theme - fruits, gems, and lucky seven */
export const CLASSIC_SYMBOLS: SlotSymbolSprite[] = [
  { id: 'cherries', name: 'Cherry', weight: 30, multiplier: 2 },
  { id: 'lemon', name: 'Lemon', weight: 25, multiplier: 3 },
  { id: 'orange', name: 'Orange', weight: 20, multiplier: 4 },
  { id: 'plum', name: 'Plum', weight: 15, multiplier: 5 },
  { id: 'watermelon', name: 'Watermelon', weight: 8, multiplier: 10 },
  { id: 'diamond', name: 'Diamond', weight: 1.5, multiplier: 50 },
  { id: 'seven', name: 'Lucky Seven', weight: 0.5, multiplier: 100 },
];

/** Extended theme - includes BAR, bell, horseshoe, clover */
export const EXTENDED_SYMBOLS: SlotSymbolSprite[] = [
  { id: 'cherries', name: 'Cherry', weight: 25, multiplier: 2 },
  { id: 'lemon', name: 'Lemon', weight: 22, multiplier: 3 },
  { id: 'orange', name: 'Orange', weight: 18, multiplier: 4 },
  { id: 'plum', name: 'Plum', weight: 12, multiplier: 5 },
  { id: 'horseshoe', name: 'Horseshoe', weight: 8, multiplier: 10 },
  { id: 'clover', name: 'Clover', weight: 5, multiplier: 25 },
  { id: 'bell', name: 'Bell', weight: 2, multiplier: 50 },
  { id: 'seven', name: 'Lucky Seven', weight: 0.5, multiplier: 100 },
];

/** All 16 icons - full symbol set for slot machine */
export const ALL_SYMBOLS: SlotSymbolSprite[] = [
  { id: 'cherries', name: 'Cherry', weight: 28, multiplier: 2 },
  { id: 'lemon', name: 'Lemon', weight: 24, multiplier: 3 },
  { id: 'orange', name: 'Orange', weight: 22, multiplier: 4 },
  { id: 'plum', name: 'Plum', weight: 18, multiplier: 5 },
  { id: 'watermelon', name: 'Watermelon', weight: 15, multiplier: 6 },
  { id: 'bananas', name: 'Bananas', weight: 12, multiplier: 8 },
  { id: 'horseshoe', name: 'Horseshoe', weight: 10, multiplier: 10 },
  { id: 'clover', name: 'Clover', weight: 8, multiplier: 12 },
  { id: 'chip', name: 'Chip', weight: 6, multiplier: 15 },
  { id: 'dice', name: 'Dice', weight: 5, multiplier: 20 },
  { id: 'wheat', name: 'Wheat', weight: 4, multiplier: 25 },
  { id: 'diamond', name: 'Diamond', weight: 2, multiplier: 50 },
  { id: 'bell', name: 'Bell', weight: 1.5, multiplier: 75 },
  { id: 'bar', name: 'Bar', weight: 1, multiplier: 100 },
  { id: 'win', name: 'Win', weight: 0.6, multiplier: 125 },
  { id: 'seven', name: 'Lucky Seven', weight: 0.4, multiplier: 150 },
];
