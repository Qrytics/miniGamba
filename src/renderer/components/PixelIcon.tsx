/**
 * Pixel-art style icons (inline SVG, 16x16 grid).
 * Use instead of emojis for a consistent retro look.
 */

import React from 'react';

export type PixelIconName =
  | 'slots'
  | 'card'
  | 'coin'
  | 'target'
  | 'mine'
  | 'ticket'
  | 'wheel'
  | 'horse'
  | 'dice'
  | 'spade'
  | 'home'
  | 'game'
  | 'trophy'
  | 'chart'
  | 'user'
  | 'settings'
  | 'rocket'
  | 'back'
  | 'money'
  | 'star'
  | 'crown'
  | 'higher'
  | 'lower'
  | 'cashout'
  | 'celebrate'
  | 'heart'
  | 'card-back'
  | 'cherry'
  | 'seven';

const ICONS: Record<PixelIconName, React.ReactNode> = {
  slots: (
    <g fill="currentColor">
      <rect x="2" y="2" width="3" height="3" />
      <rect x="6" y="2" width="3" height="3" />
      <rect x="10" y="2" width="3" height="3" />
      <rect x="2" y="6" width="3" height="3" />
      <rect x="6" y="6" width="3" height="3" />
      <rect x="10" y="6" width="3" height="3" />
    </g>
  ),
  card: (
    <g fill="currentColor" stroke="currentColor" strokeWidth="0.5">
      <rect x="1" y="2" width="14" height="12" fill="none" />
      <rect x="4" y="5" width="4" height="5" />
      <rect x="10" y="5" width="4" height="5" />
    </g>
  ),
  coin: (
    <g fill="currentColor">
      <rect x="3" y="2" width="10" height="12" />
      <rect x="4" y="4" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
    </g>
  ),
  target: (
    <g fill="currentColor">
      <rect x="7" y="1" width="2" height="2" />
      <rect x="7" y="13" width="2" height="2" />
      <rect x="1" y="7" width="2" height="2" />
      <rect x="13" y="7" width="2" height="2" />
      <rect x="5" y="5" width="6" height="6" />
      <rect x="7" y="7" width="2" height="2" fill="var(--balatro-bg-primary, #0D0D0F)" />
    </g>
  ),
  mine: (
    <g fill="currentColor">
      <rect x="4" y="2" width="2" height="2" />
      <rect x="10" y="2" width="2" height="2" />
      <rect x="2" y="4" width="2" height="2" />
      <rect x="7" y="4" width="2" height="2" />
      <rect x="12" y="4" width="2" height="2" />
      <rect x="4" y="6" width="8" height="4" />
      <rect x="6" y="10" width="2" height="4" />
      <rect x="8" y="10" width="2" height="4" />
    </g>
  ),
  ticket: (
    <g fill="currentColor">
      <rect x="1" y="4" width="14" height="8" />
      <rect x="3" y="6" width="2" height="1" fill="var(--balatro-bg-primary, #0D0D0F)" />
      <rect x="3" y="8" width="2" height="1" fill="var(--balatro-bg-primary, #0D0D0F)" />
      <rect x="11" y="6" width="2" height="1" fill="var(--balatro-bg-primary, #0D0D0F)" />
    </g>
  ),
  wheel: (
    <g fill="currentColor">
      <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="6" y="1" width="4" height="2" />
      <rect x="6" y="13" width="4" height="2" />
      <rect x="1" y="6" width="2" height="4" />
      <rect x="13" y="6" width="2" height="4" />
      <rect x="7" y="7" width="2" height="2" />
    </g>
  ),
  horse: (
    <g fill="currentColor">
      <rect x="2" y="8" width="4" height="4" />
      <rect x="6" y="6" width="4" height="6" />
      <rect x="10" y="4" width="3" height="8" />
      <rect x="4" y="4" width="2" height="2" />
    </g>
  ),
  dice: (
    <g fill="currentColor">
      <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="4" y="4" width="2" height="2" />
      <rect x="10" y="4" width="2" height="2" />
      <rect x="7" y="7" width="2" height="2" />
      <rect x="4" y="10" width="2" height="2" />
      <rect x="10" y="10" width="2" height="2" />
    </g>
  ),
  spade: (
    <g fill="currentColor">
      <rect x="7" y="2" width="2" height="2" />
      <rect x="5" y="4" width="6" height="2" />
      <rect x="3" y="6" width="10" height="4" />
      <rect x="6" y="10" width="4" height="4" />
    </g>
  ),
  home: (
    <g fill="currentColor">
      <rect x="7" y="2" width="2" height="2" />
      <rect x="4" y="4" width="8" height="2" />
      <rect x="2" y="6" width="12" height="8" />
      <rect x="6" y="8" width="4" height="6" fill="var(--balatro-bg-primary, #0D0D0F)" />
    </g>
  ),
  game: (
    <g fill="currentColor">
      <rect x="2" y="4" width="12" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="4" y="6" width="2" height="2" />
      <rect x="8" y="6" width="2" height="2" />
      <rect x="4" y="10" width="4" height="1" />
    </g>
  ),
  trophy: (
    <g fill="currentColor">
      <rect x="5" y="2" width="6" height="2" />
      <rect x="4" y="4" width="8" height="4" />
      <rect x="2" y="8" width="4" height="4" />
      <rect x="10" y="8" width="4" height="4" />
      <rect x="6" y="8" width="4" height="6" />
      <rect x="5" y="14" width="6" height="2" />
    </g>
  ),
  chart: (
    <g fill="currentColor">
      <rect x="2" y="10" width="2" height="4" />
      <rect x="5" y="6" width="2" height="8" />
      <rect x="8" y="4" width="2" height="10" />
      <rect x="11" y="8" width="2" height="6" />
    </g>
  ),
  user: (
    <g fill="currentColor">
      <rect x="5" y="2" width="6" height="4" />
      <rect x="3" y="6" width="10" height="8" />
    </g>
  ),
  settings: (
    <g fill="currentColor">
      <rect x="7" y="2" width="2" height="2" />
      <rect x="2" y="7" width="2" height="2" />
      <rect x="12" y="7" width="2" height="2" />
      <rect x="7" y="12" width="2" height="2" />
      <rect x="5" y="5" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="7" y="7" width="2" height="2" />
    </g>
  ),
  rocket: (
    <g fill="currentColor">
      <rect x="7" y="1" width="2" height="4" />
      <rect x="5" y="5" width="6" height="6" />
      <rect x="4" y="11" width="2" height="2" />
      <rect x="10" y="11" width="2" height="2" />
      <rect x="7" y="13" width="2" height="2" />
    </g>
  ),
  back: (
    <g fill="currentColor">
      <rect x="2" y="7" width="4" height="2" />
      <rect x="4" y="5" width="2" height="2" />
      <rect x="4" y="9" width="2" height="2" />
      <rect x="6" y="3" width="2" height="2" />
      <rect x="6" y="11" width="2" height="2" />
      <rect x="8" y="1" width="2" height="2" />
      <rect x="8" y="13" width="2" height="2" />
      <rect x="10" y="7" width="4" height="2" />
    </g>
  ),
  money: (
    <g fill="currentColor">
      <rect x="4" y="3" width="8" height="10" />
      <rect x="6" y="5" width="4" height="6" fill="var(--balatro-bg-primary, #0D0D0F)" />
      <rect x="7" y="6" width="2" height="4" />
    </g>
  ),
  star: (
    <g fill="currentColor">
      <rect x="7" y="1" width="2" height="2" />
      <rect x="5" y="5" width="2" height="2" />
      <rect x="9" y="5" width="2" height="2" />
      <rect x="1" y="7" width="2" height="2" />
      <rect x="13" y="7" width="2" height="2" />
      <rect x="5" y="9" width="2" height="2" />
      <rect x="9" y="9" width="2" height="2" />
      <rect x="7" y="11" width="2" height="2" />
      <rect x="7" y="5" width="2" height="6" />
      <rect x="3" y="7" width="10" height="2" />
    </g>
  ),
  crown: (
    <g fill="currentColor">
      <rect x="2" y="10" width="12" height="4" />
      <rect x="4" y="6" width="2" height="4" />
      <rect x="7" y="4" width="2" height="6" />
      <rect x="10" y="6" width="2" height="4" />
      <rect x="3" y="8" width="2" height="2" />
      <rect x="7" y="6" width="2" height="2" />
      <rect x="11" y="8" width="2" height="2" />
    </g>
  ),
  higher: (
    <g fill="currentColor">
      <rect x="6" y="2" width="4" height="2" />
      <rect x="7" y="4" width="2" height="2" />
      <rect x="8" y="6" width="2" height="2" />
      <rect x="9" y="8" width="2" height="2" />
      <rect x="10" y="10" width="2" height="4" />
    </g>
  ),
  lower: (
    <g fill="currentColor">
      <rect x="6" y="10" width="4" height="2" />
      <rect x="7" y="8" width="2" height="2" />
      <rect x="8" y="6" width="2" height="2" />
      <rect x="9" y="4" width="2" height="2" />
      <rect x="4" y="2" width="2" height="4" />
    </g>
  ),
  cashout: (
    <g fill="currentColor">
      <rect x="2" y="6" width="4" height="4" />
      <rect x="6" y="4" width="4" height="8" />
      <rect x="10" y="6" width="4" height="4" />
    </g>
  ),
  celebrate: (
    <g fill="currentColor">
      <rect x="7" y="2" width="2" height="2" />
      <rect x="2" y="5" width="2" height="2" />
      <rect x="12" y="5" width="2" height="2" />
      <rect x="5" y="12" width="2" height="2" />
      <rect x="9" y="12" width="2" height="2" />
      <rect x="7" y="7" width="2" height="2" />
    </g>
  ),
  heart: (
    <g fill="currentColor">
      <rect x="4" y="4" width="2" height="2" />
      <rect x="10" y="4" width="2" height="2" />
      <rect x="2" y="6" width="12" height="2" />
      <rect x="4" y="8" width="8" height="2" />
      <rect x="6" y="10" width="4" height="2" />
      <rect x="7" y="12" width="2" height="2" />
    </g>
  ),
  'card-back': (
    <g fill="currentColor">
      <rect x="1" y="2" width="14" height="12" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="3" y="4" width="3" height="2" />
      <rect x="8" y="4" width="3" height="2" />
      <rect x="3" y="8" width="3" height="2" />
      <rect x="8" y="8" width="3" height="2" />
    </g>
  ),
  cherry: (
    <g fill="currentColor">
      <rect x="4" y="4" width="3" height="3" />
      <rect x="9" y="4" width="3" height="3" />
      <rect x="6" y="8" width="2" height="2" />
      <rect x="8" y="8" width="2" height="2" />
      <rect x="7" y="10" width="2" height="4" />
    </g>
  ),
  seven: (
    <g fill="currentColor">
      <rect x="4" y="2" width="8" height="2" />
      <rect x="10" y="4" width="2" height="2" />
      <rect x="10" y="6" width="2" height="2" />
      <rect x="10" y="8" width="2" height="2" />
      <rect x="10" y="10" width="2" height="2" />
      <rect x="4" y="12" width="8" height="2" />
    </g>
  ),
};

export interface PixelIconProps {
  name: PixelIconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean;
}

export const PixelIcon: React.FC<PixelIconProps> = ({
  name,
  size = 24,
  className = '',
  style = {},
  'aria-hidden': ariaHidden = true,
}) => {
  const content = ICONS[name];
  if (!content) return null;
  return (
    <svg
      className={`pixel-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ display: 'block', flexShrink: 0, ...style }}
      aria-hidden={ariaHidden}
    >
      {content}
    </svg>
  );
};

export default PixelIcon;
