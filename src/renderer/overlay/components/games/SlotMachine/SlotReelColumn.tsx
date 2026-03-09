import React, { useEffect, useState, useRef } from 'react';
import SlotSymbol from './SlotSymbol';
import type { SlotSymbolId } from '../../../constants/slot-symbols';

const REEL_HEIGHT = 70;
const SPIN_DURATION_MS = 1500;
const EXTRA_SPINS = 24; // Number of extra symbols to spin through

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
  // Strip layout: [resultSymbols, randomPart, currentVisible]
  // We animate translateY from -(EXTRA_SPINS+3)*H (showing currentVisible)
  // back toward 0 (showing resultSymbols) — the strip scrolls DOWNWARD
  // (translateY increases toward less-negative) so symbols fall from above.
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

    // Build strip: [resultSymbols, randomPart (EXTRA_SPINS), currentVisible]
    // Visible viewport sits at the TOP of the strip (index 0).
    // We start showing currentVisible (bottom of strip) and animate up to
    // resultSymbols (top of strip), passing through all random symbols.
    const randomPart: SlotSymbolId[] = Array.from({ length: EXTRA_SPINS }, () => rand());
    const newStrip: SlotSymbolId[] = [
      ...resultSymbols,
      ...randomPart,
      ...currentRef.current,
    ];
    setStrip(newStrip);

    // Position strip so currentVisible is in the viewport (bottom of strip).
    // Total cells = resultSymbols(3) + randomPart(EXTRA_SPINS) + current(3)
    // currentVisible starts at index (3 + EXTRA_SPINS) → translate = -(3+EXTRA_SPINS)*H
    const startY = -(3 + EXTRA_SPINS) * REEL_HEIGHT;

    // Disable transition, jump to start position
    setUseTransition(false);
    setTranslateY(startY);

    // After a paint, enable transition and move to result (index 0 → translateY = 0)
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setUseTransition(true);
        setTranslateY(0);
      });
    });

    const timeout = setTimeout(() => {
      onSpinComplete?.();
    }, SPIN_DURATION_MS);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning]);

  const stripStyle: React.CSSProperties = {
    transform: `translateY(${translateY}px)`,
    transition: useTransition ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.25, 1)` : 'none',
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
