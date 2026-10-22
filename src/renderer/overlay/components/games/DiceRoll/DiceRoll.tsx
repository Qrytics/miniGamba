import React, { useState, useRef, useEffect } from 'react';
import { DiceRoll as DiceRollEngine, DiceBetType } from '../../../game-logic/dice-roll';
import { PixelIcon } from '../../../../components/PixelIcon';
import ChipSelector from '../../ui/ChipSelector';
import { playWin, playBigWin, playLoss, playBet, playDiceRoll } from '../../../utils/sounds';
import { particles } from '../../../utils/particles';

interface DiceRollProps {
  onCoinsUpdate: () => void;
}

const BET_OPTIONS: { id: DiceBetType; label: string; payout: number }[] = [
  { id: 'over', label: 'OVER 7', payout: 2 },
  { id: 'under', label: 'UNDER 7', payout: 2 },
  { id: 'even', label: 'EVEN SUM', payout: 2 },
  { id: 'odd', label: 'ODD SUM', payout: 2 },
  { id: 'doubles', label: 'DOUBLES', payout: 6 },
  { id: 'snake-eyes', label: 'SNAKE EYES (1-1)', payout: 35 },
];

const renderDiceFace = (val: number) => {
  const pips = Array.from({ length: val }, (_, i) => <div key={i} className="pip" />);
  return <div className={`dice-cube dice-face-${val}`}>{pips}</div>;
};

export const DiceRoll: React.FC<DiceRollProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [betType, setBetType] = useState<DiceBetType>('over');
  const [rolling, setRolling] = useState(false);
  const [dice, setDice] = useState<[number, number]>([3, 4]);
  const [result, setResult] = useState<any>(null);

  const engineRef = useRef<DiceRollEngine | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    const engine = new DiceRollEngine();
    engine.init();
    engineRef.current = engine;
    return () => {
      engineRef.current = null;
    };
  }, []);

  const handleRoll = async () => {
    const engine = engineRef.current;
    if (!engine || rolling) return;

    try {
      const startRes = await window.electronAPI.startGame('dice-roll', bet);
      if (!startRes?.success) {
        setResult({ error: startRes?.error || 'Insufficient coins to place bet', win: false, bet, payout: 0 });
        setRolling(false);
        return;
      }
      onCoinsUpdate();

      sessionIdRef.current = startRes.sessionId ?? null;
      playBet();
      playDiceRoll();
      setRolling(true);
      setResult(null);

      engine.start(bet);
      engine.setBet(betType, 7);

      // Rapid tumble frames
      let frame = 0;
      const anim = setInterval(() => {
        setDice([
          (Math.floor(Math.random() * 6) + 1) as number,
          (Math.floor(Math.random() * 6) + 1) as number,
        ]);
        frame++;
        if (frame >= 8) {
          clearInterval(anim);
        }
      }, 80);

      setTimeout(async () => {
        clearInterval(anim);
        await engine.roll();
        const state = engine.getState();
        const finalDice: [number, number] = state.dice;
        const endResult = engine.end();
        const isWin = endResult.result === 'win';
        const sum = finalDice[0] + finalDice[1];

        setDice(finalDice);
        const gameResult = {
          bet,
          payout: endResult.payout,
          result: endResult.result,
          win: isWin,
          sum,
          dice: finalDice,
          sessionId: sessionIdRef.current,
        };

        setResult(gameResult);
        setRolling(false);

        if (endResult.payout >= bet * 5) {
          playBigWin();
          particles.burstConfetti(undefined, undefined, 45);
        } else if (isWin) {
          playWin();
          particles.burstCoins(undefined, undefined, 25);
        } else {
          playLoss();
        }

        await window.electronAPI.endGame('dice-roll', gameResult);
        sessionIdRef.current = null;
        onCoinsUpdate();
      }, 950);
    } catch (error) {
      console.error('Roll failed:', error);
      setRolling(false);
    }
  };

  const sum = dice[0] + dice[1];

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="dice" size={24} aria-hidden /> Dice Roll</h2>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          SUM: <strong style={{ color: 'var(--balatro-yellow)', fontSize: '14px' }}>{sum}</strong>
        </span>
      </div>

      <div className="game-interface">
        {result?.error ? (
          <div className="result-display error error-message">
            ⚠️ {result.error}
          </div>
        ) : result && (
          <div className={`result-display ${result.win ? 'win' : 'loss'}`}>
            {result.win ? `🎲 Rolled ${result.sum} (${result.dice[0]}+${result.dice[1]})! Won ${result.payout} coins!` : `🎲 Rolled ${result.sum} (${result.dice[0]}+${result.dice[1]}). No payout.`}
          </div>
        )}

        <div className="game-display" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          {/* 3D Casino Dice Pair */}
          <div className="dice-scene">
            <div className={rolling ? 'dice-cube rolling' : ''}>
              {renderDiceFace(dice[0])}
            </div>
            <div className={rolling ? 'dice-cube rolling' : ''}>
              {renderDiceFace(dice[1])}
            </div>
          </div>

          {/* Bet Type Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', width: '100%' }}>
            {BET_OPTIONS.map((opt) => {
              const isSelected = betType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`step-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setBetType(opt.id)}
                  disabled={rolling}
                  style={{
                    background: isSelected ? 'var(--balatro-purple)' : undefined,
                    borderColor: isSelected ? 'var(--balatro-yellow)' : undefined,
                    color: isSelected ? '#FFF' : undefined,
                    padding: '8px 4px',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  {opt.label} ({opt.payout}×)
                </button>
              );
            })}
          </div>
        </div>

        <div className="game-controls">
          <ChipSelector
            currentBet={bet}
            onBetChange={setBet}
            disabled={rolling}
          />

          <button
            className="play-btn"
            onClick={handleRoll}
            disabled={rolling}
            style={{ marginTop: '8px' }}
          >
            {rolling ? 'ROLLING...' : `🎲 ROLL DICE (${bet} coins)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiceRoll;
