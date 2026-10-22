import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SlotMachine as SlotMachineEngine } from '../../../game-logic/slot-machine';
import { PixelIcon } from '../../../../components/PixelIcon';
import SlotReelColumn from './SlotReelColumn';
import ChipSelector from '../../ui/ChipSelector';
import { ALL_SYMBOLS } from '../../../constants/slot-symbols';
import { playSpin, playWin, playBigWin, playLoss, playBet } from '../../../utils/sounds';
import { particles } from '../../../utils/particles';
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
  const sessionIdRef = useRef<string | null>(null);

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
          sessionId: sessionIdRef.current,
        };
        const finalizedSessionId = gameResult.sessionId;
        setResult(gameResult);
        void window.electronAPI.endGame('slot-machine', gameResult).finally(() => {
          if (sessionIdRef.current === finalizedSessionId) {
            sessionIdRef.current = null;
          }
        });

        if (endResult.payout >= bet * 5) {
          playBigWin();
          particles.burstConfetti(undefined, undefined, 50);
        } else if (endResult.result === 'win') {
          playWin();
          particles.burstCoins(undefined, undefined, 30);
        } else {
          playLoss();
        }
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
      const startResult = await window.electronAPI.startGame('slot-machine', bet);
      if (!startResult?.success) {
        setResult({ error: startResult?.error || 'Insufficient coins to place bet', win: false, bet, payout: 0 });
        setSpinning(false);
        return;
      }
      onCoinsUpdate();
      sessionIdRef.current = startResult?.sessionId ?? null;
      playBet();
      playSpin();
      engine.start(bet);

      // Generate result immediately for staggered animation
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
        {result?.error ? (
          <div className="result-display error error-message">
            ⚠️ {result.error}
          </div>
        ) : result && (
          <div className={`result-display ${result.payout > 0 ? 'win' : 'loss'}`}>
            {result.payout > 0 ? `You won ${result.payout} coins!` : `No win this time`}
            {result.matchType && <div className="mt-1" style={{ fontSize: '0.8rem', color: 'var(--balatro-yellow)' }}>{result.matchType}</div>}
          </div>
        )}

        <div className="game-display">
          <div className="slot-reels-wrapper">
            <div className="slot-reels-grid">
              {[0, 1, 2].map((col) => (
                <SlotReelColumn
                  key={col}
                  reelIndex={col}
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
          <ChipSelector
            currentBet={bet}
            onBetChange={setBet}
            disabled={spinning}
          />

          <button
            className="play-btn"
            onClick={handleSpin}
            disabled={spinning}
            style={{ marginTop: '8px' }}
          >
            {spinning ? 'SPINNING...' : `SPIN (${bet} coins)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;
