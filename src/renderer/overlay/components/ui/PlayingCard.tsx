import React from 'react';

export type Suit = '♠' | '♥' | '♦' | '♣' | 'spades' | 'hearts' | 'diamonds' | 'clubs';

interface PlayingCardProps {
  card?: string | { rank: string; suit: string };
  faceDown?: boolean;
  highlighted?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function parseCard(input?: string | { rank: string; suit: string }): { rank: string; suit: string } {
  if (!input) return { rank: 'A', suit: '♠' };
  if (typeof input === 'object') return { rank: input.rank, suit: input.suit };
  const str = input.trim();
  const suitChar = str.slice(-1);
  const rankStr = str.slice(0, -1);
  return { rank: rankStr || 'A', suit: suitChar || '♠' };
}

function normalizeSuit(suitStr: string): { symbol: string; isRed: boolean; name: string } {
  if (suitStr === '♥' || suitStr.toLowerCase().includes('heart')) {
    return { symbol: '♥', isRed: true, name: 'hearts' };
  }
  if (suitStr === '♦' || suitStr.toLowerCase().includes('diamond')) {
    return { symbol: '♦', isRed: true, name: 'diamonds' };
  }
  if (suitStr === '♣' || suitStr.toLowerCase().includes('club')) {
    return { symbol: '♣', isRed: false, name: 'clubs' };
  }
  return { symbol: '♠', isRed: false, name: 'spades' };
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  faceDown = false,
  highlighted = false,
  selected = false,
  dimmed = false,
  size = 'md',
  onClick,
  className = '',
  style,
}) => {
  const { rank, suit } = parseCard(card);
  const { symbol, isRed, name: suitName } = normalizeSuit(suit);

  const sizeClasses = {
    sm: 'card-sm',
    md: 'card-md',
    lg: 'card-lg',
  }[size];

  if (faceDown) {
    return (
      <div
        className={`balatro-card card-back ${sizeClasses} ${className}`}
        style={style}
        onClick={onClick}
      >
        <div className="card-back-pattern">
          <div className="card-back-crest">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#FFD84B">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`balatro-card ${isRed ? 'card-red' : 'card-black'} ${sizeClasses} ${
        highlighted ? 'card-highlighted' : ''
      } ${selected ? 'card-selected' : ''} ${dimmed ? 'card-dimmed' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      <div className="card-corner top-left">
        <span className="card-rank">{rank}</span>
        <span className={`card-suit suit-${suitName}`}>{symbol}</span>
      </div>

      <div className="card-center">
        <span className={`card-center-suit suit-${suitName}`}>{symbol}</span>
      </div>

      <div className="card-corner bottom-right">
        <span className="card-rank">{rank}</span>
        <span className={`card-suit suit-${suitName}`}>{symbol}</span>
      </div>
    </div>
  );
};

export default PlayingCard;
