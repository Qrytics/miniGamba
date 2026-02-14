import React from 'react';
import { SLOT_SYMBOL_IMAGES, type SlotSymbolId } from '../../../constants/slot-symbols';

interface SlotSymbolProps {
  symbolId: SlotSymbolId;
  size?: number;
  className?: string;
}

const SlotSymbol: React.FC<SlotSymbolProps> = ({ symbolId, size = 64, className = '' }) => {
  const src = SLOT_SYMBOL_IMAGES[symbolId];

  return (
    <img
      src={src}
      alt={symbolId}
      className={`slot-symbol ${className}`}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        imageRendering: 'pixelated',
      }}
    />
  );
};

export default SlotSymbol;
