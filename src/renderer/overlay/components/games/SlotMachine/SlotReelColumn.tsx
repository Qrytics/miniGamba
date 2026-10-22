import React, { useEffect, useState, useRef } from 'react';
import SlotSymbol from './SlotSymbol';
import type { SlotSymbolId } from '../../../constants/slot-symbols';
import { playReelStop } from '../../../utils/sounds';

const REEL_HEIGHT = 70;

interface SlotReelColumnProps {
  resultSymbols: [SlotSymbolId, SlotSymbolId, SlotSymbolId];
  allSymbolIds: SlotSymbolId[];
  isSpinning: boolean;
  reelIndex?: number;
  durationMs?: number;
  onSpinComplete?: () => void;
}

const SlotReelColumn: React.FC<SlotReelColumnProps> = ({
  resultSymbols,
  allSymbolIds,
  isSpinning,
  reelIndex = 0,
  durationMs,
  onSpinComplete,
}) => {
  const actualDuration = durationMs ?? (1100 + reelIndex * 450);
  const extraSpins = 18 + reelIndex * 6;
  const rand = () => allSymbolIds[Math.floor(Math.random() * allSymbolIds.length)];

  const [strip, setStrip] = useState<SlotSymbolId[]>(() => [...resultSymbols]);
  const [translateY, setTranslateY] = useState(0);
  const [useTransition, setUseTransition] = useState(false);
  const currentRef = useRef<SlotSymbolId[]>([...resultSymbols]);

  useEffect(() => {
    if (!isSpinning) {
      currentRef.current = [...resultSymbols];
      return;
    }

    const randomPart: SlotSymbolId[] = Array.from({ length: extraSpins }, () => rand());
    const newStrip: SlotSymbolId[] = [
      ...resultSymbols,
      ...randomPart,
      ...currentRef.current,
    ];
    setStrip(newStrip);

    const startY = -(3 + extraSpins) * REEL_HEIGHT;
    setUseTransition(false);
    setTranslateY(startY);

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setUseTransition(true);
        setTranslateY(0);
      });
    });

    const timeout = setTimeout(() => {
      playReelStop(reelIndex);
      onSpinComplete?.();
    }, actualDuration);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning]);

  const stripStyle: React.CSSProperties = {
    transform: `translateY(${translateY}px)`,
    transition: useTransition
      ? `transform ${actualDuration}ms cubic-bezier(0.25, 1, 0.5, 1)`
      : 'none',
    filter: isSpinning && useTransition ? 'blur(1.2px)' : 'none',
  };

  return (
    <div className="slot-reel-column">
      <div className="slot-reel-strip" style={stripStyle}>
        {strip.map((symbolId, idx) => (
          <div key={idx} className="slot-reel-cell">
            <SlotSymbol symbolId={symbolId} size={48} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlotReelColumn;
