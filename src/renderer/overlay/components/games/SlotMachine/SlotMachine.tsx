import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SlotMachine as SlotMachineEngine } from '../../../game-logic/slot-machine';
import { PixelIcon } from '../../../../components/PixelIcon';
import SlotReelColumn from './SlotReelColumn';
import { ALL_SYMBOLS } from '../../../constants/slot-symbols';
import type { SlotSymbolId } from '../../../constants/slot-symbols';

/** 3x3 grid: reels[col][row], row 0=top, 1=middle (payline), 2=bottom */
type ReelGrid = SlotSymbolId[][];

const DEFAULT_GRID: ReelGrid = [
  ['bar', 'seven', 'win'],
  ['bar', 'seven', 'win'],
  ['bar', 'seven', 'win'],
];

interface SlotMachineProps {
  onCoinsUpdate: () => void;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const allSymbolIds = ALL_SYMBOLS.map((s) => s.id);
  const [reels, setReels] = useState<ReelGrid>(DEFAULT_GRID);
  const [result, setResult] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);

  const engineRef = useRef<SlotMachineEngine | null>(null);
  const completedReelsRef = useRef(0);

  useEffect(() => {
    const engine = new SlotMachineEngine();
    engine.init();
    engine.setTheme('classic');
    engineRef.current = engine;
    return () => {
      engineRef.current = null;
    };
  }, []);

  const handleReelComplete = useCallback(() => {
    completedReelsRef.current += 1;
    if (completedReelsRef.current >= 3) {
      completedReelsRef.current = 0;
      const engine = engineRef.current;
      if (engine) {
        engine.finalizeSpin();
        const endResult = engine.end();
        const state = engine.getState();
        const grid: ReelGrid = [
          [(state.reels[0][0] ?? 'cherries') as SlotSymbolId, (state.reels[0][1] ?? 'cherries') as SlotSymbolId, (state.reels[0][2] ?? 'cherries') as SlotSymbolId],
          [(state.reels[1][0] ?? 'cherries') as SlotSymbolId, (state.reels[1][1] ?? 'cherries') as SlotSymbolId, (state.reels[1][2] ?? 'cherries') as SlotSymbolId],
          [(state.reels[2][0] ?? 'cherries') as SlotSymbolId, (state.reels[2][1] ?? 'cherries') as SlotSymbolId, (state.reels[2][2] ?? 'cherries') as SlotSymbolId],
        ];
        const gameResult = {
          bet,
          payout: endResult.payout,
          matchType: state.result?.type,
          reels: grid,
          result: endResult.result,
          win: endResult.result === 'win',
        };
        setResult(gameResult);
        window.electronAPI.endGame('slot-machine', gameResult);
        onCoinsUpdate();
      }
      setSpinning(false);
    }
  }, [bet, onCoinsUpdate]);

  const handleSpin = async () => {
    const engine = engineRef.current;
    if (!engine || spinning) return;

    setSpinning(true);
    setResult(null);
    completedReelsRef.current = 0;

    try {
      await window.electronAPI.startGame('slot-machine', bet);
      engine.start(bet);

      // Generate result immediately for animation
      const newReels = engine.generateSpin();
      const grid: ReelGrid = [
        [(newReels[0][0] ?? 'cherries') as SlotSymbolId, (newReels[0][1] ?? 'cherries') as SlotSymbolId, (newReels[0][2] ?? 'cherries') as SlotSymbolId],
        [(newReels[1][0] ?? 'cherries') as SlotSymbolId, (newReels[1][1] ?? 'cherries') as SlotSymbolId, (newReels[1][2] ?? 'cherries') as SlotSymbolId],
        [(newReels[2][0] ?? 'cherries') as SlotSymbolId, (newReels[2][1] ?? 'cherries') as SlotSymbolId, (newReels[2][2] ?? 'cherries') as SlotSymbolId],
      ];
      setReels(grid);
    } catch (error) {
      console.error('Spin failed:', error);
      setSpinning(false);
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="slots" size={28} aria-hidden={true} /> Slot Machine</h2>
      </div>

      <div className="game-interface">
        {result && (
          <div className={`result-display ${result.payout > 0 ? 'win' : 'loss'}`}>
            {result.payout > 0 ? `You won ${result.payout} coins!` : `No win this time`}
            {result.matchType && <div className="mt-1">{result.matchType}</div>}
          </div>
        )}

        <div className="game-display">
          <div className="slot-reels-wrapper">
          <div className="slot-reels-grid">
            {[0, 1, 2].map((col) => (
              <SlotReelColumn
                key={col}
                resultSymbols={[reels[col]?.[0] ?? 'cherries', reels[col]?.[1] ?? 'cherries', reels[col]?.[2] ?? 'cherries']}
                allSymbolIds={allSymbolIds}
                isSpinning={spinning}
                onSpinComplete={handleReelComplete}
              />
            ))}
          </div>
          </div>
        </div>

        <div className="game-controls">
          <div className="bet-controls">
            <button className="bet-btn" onClick={() => setBet(Math.max(1, bet - 10))}>
              -10
            </button>
            <input
              type="number"
              className="bet-input"
              value={bet}
              onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
            <button className="bet-btn" onClick={() => setBet(bet + 10)}>
              +10
            </button>
          </div>

          <button
            className="play-btn"
            onClick={handleSpin}
            disabled={spinning}
          >
            {spinning ? 'SPINNING...' : `SPIN (${bet} coins)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;
