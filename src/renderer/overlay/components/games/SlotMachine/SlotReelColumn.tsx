import React, { useEffect, useState } from 'react';
import SlotSymbol from './SlotSymbol';
import type { SlotSymbolId } from '../../../constants/slot-symbols';

const SYMBOL_SIZE = 56;
const REEL_HEIGHT = 70;
const SPIN_DURATION_MS = 1500;
const EXTRA_SPINS = 30; // Number of extra symbols to spin through

interface SlotReelColumnProps {
  resultSymbols: [SlotSymbolId, SlotSymbolId, SlotSymbolId];
  allSymbolIds: SlotSymbolId[];
  isSpinning: boolean;
  onSpinComplete?: () => void;
}

const SlotReelColumn: React.FC<SlotReelColumnProps> = ({
  resultSymbols,
  allSymbolIds,
  isSpinning,
  onSpinComplete,
}) => {
  const [strip, setStrip] = useState<SlotSymbolId[]>(() => resultSymbols ?? []);
  const [translateY, setTranslateY] = useState(0);
  const [useTransition, setUseTransition] = useState(false);
  const [currentVisibleSymbols, setCurrentVisibleSymbols] = useState<SlotSymbolId[]>(() => resultSymbols ?? []);

  const rand = () => allSymbolIds[Math.floor(Math.random() * allSymbolIds.length)];

  useEffect(() => {
    if (!isSpinning) {
      // When spin ends, remember what's currently visible
      setCurrentVisibleSymbols([...resultSymbols]);
      return;
    }

    // Build strip: [EXTRA_SPINS random, result 3, current 3] - lots of spinning!
    const randomPart = Array.from({ length: EXTRA_SPINS }, () => rand());
    const newStrip = [...randomPart, ...(resultSymbols ?? []), ...(currentVisibleSymbols ?? [])];
    setStrip(newStrip);

    // Start showing the current symbols at bottom (offset upward)
    setUseTransition(false);
    setTranslateY(-(EXTRA_SPINS + 3) * REEL_HEIGHT); // Position to show current symbols

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setUseTransition(true);
        setTranslateY(-EXTRA_SPINS * REEL_HEIGHT); // Scroll up through all random symbols to result
      });
    });

    const timeout = setTimeout(() => {
      onSpinComplete?.();
    }, SPIN_DURATION_MS);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeout);
    };
  }, [isSpinning, resultSymbols, allSymbolIds, onSpinComplete]);

  const stripStyle: React.CSSProperties = {
    transform: `translateY(${translateY}px)`,
    transition: useTransition ? 'transform 1.5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
  };

  return (
    <div className="slot-reel-column">
      <div className="slot-reel-strip" style={stripStyle}>
        {(strip ?? []).map((symbolId, idx) => (
          <div key={idx} className="slot-reel-cell">
            <SlotSymbol symbolId={symbolId} size={SYMBOL_SIZE} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlotReelColumn;
