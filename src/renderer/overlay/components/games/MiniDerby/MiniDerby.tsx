import React, { useState, useEffect, useRef } from 'react';
import { MiniDerby as MiniDerbyEngine, Racer } from '../../../game-logic/mini-derby';
import { PixelIcon } from '../../../../components/PixelIcon';
import ChipSelector from '../../ui/ChipSelector';
import { playWin, playBigWin, playLoss, playBet, playHorseGallop } from '../../../utils/sounds';
import { particles } from '../../../utils/particles';

interface MiniDerbyProps {
  onCoinsUpdate: () => void;
}

const RACER_SILKS = [
  { bg: '#E53E3E', text: '#FFF', icon: '🐎' },
  { bg: '#3182CE', text: '#FFF', icon: '🐴' },
  { bg: '#D69E2E', text: '#000', icon: '🦄' },
  { bg: '#805AD5', text: '#FFF', icon: '🏇' },
];

export const MiniDerby: React.FC<MiniDerbyProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [selectedRacer, setSelectedRacer] = useState<number | null>(1);
  const [racing, setRacing] = useState(false);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [winner, setWinner] = useState<Racer | null>(null);
  const [result, setResult] = useState<any>(null);

  const engineRef = useRef<MiniDerbyEngine | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const raceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const engine = new MiniDerbyEngine();
    engine.init();
    engineRef.current = engine;
    const state = engine.getState();
    // Use top 4 racers for compact overlay layout
    setRacers(state.racers.slice(0, 4));
    return () => {
      engineRef.current = null;
      if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
    };
  }, []);

  const handleStartRace = async () => {
    const engine = engineRef.current;
    if (!engine || selectedRacer === null || racing) return;

    try {
      const startRes = await window.electronAPI.startGame('mini-derby', bet);
      if (!startRes?.success) {
        setResult({ error: startRes?.error || 'Insufficient coins to place bet', win: false, bet, payout: 0 });
        setRacing(false);
        return;
      }
      onCoinsUpdate();

      sessionIdRef.current = startRes.sessionId ?? null;
      playBet();
      playHorseGallop();
      setRacing(true);
      setResult(null);
      setWinner(null);

      engine.start(bet);
      engine.init();
      engine.selectRacer(selectedRacer);

      const activeRacers = engine.getState().racers.slice(0, 4);
      setRacers(activeRacers.map((r) => ({ ...r, progress: 0 })));

      const speeds = activeRacers.map((r) => r.speed * (0.8 + Math.random() * 0.4));
      const currentProgress = [0, 0, 0, 0];

      raceIntervalRef.current = setInterval(async () => {
        for (let i = 0; i < 4; i++) {
          if (currentProgress[i] < 100) {
            currentProgress[i] = Math.min(100, currentProgress[i] + speeds[i] * (0.8 + Math.random() * 0.8));
          }
        }

        setRacers(activeRacers.map((r, i) => ({ ...r, progress: currentProgress[i] })));

        const doneIdx = currentProgress.findIndex((p) => p >= 100);
        if (doneIdx !== -1) {
          if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
          const winningRacer = activeRacers[doneIdx];
          setWinner(winningRacer);
          setRacing(false);

          const isWin = winningRacer.id === selectedRacer;
          const payout = isWin ? Math.floor(bet * winningRacer.odds) : 0;
          const gameResult = {
            bet,
            payout,
            result: isWin ? 'win' : 'loss',
            win: isWin,
            horse: winningRacer.name,
            sessionId: sessionIdRef.current,
          };

          setResult(gameResult);
          if (isWin) {
            playBigWin();
            particles.burstConfetti(undefined, undefined, 45);
          } else {
            playLoss();
          }

          await window.electronAPI.endGame('mini-derby', gameResult);
          sessionIdRef.current = null;
          onCoinsUpdate();
        }
      }, 90);
    } catch (error) {
      console.error('Race failed:', error);
      setRacing(false);
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="horse" size={24} aria-hidden /> Mini Derby</h2>
      </div>

      <div className="game-interface">
        {result?.error ? (
          <div className="result-display error error-message">
            ⚠️ {result.error}
          </div>
        ) : result && (
          <div className={`result-display ${result.win ? 'win' : 'loss'}`}>
            {result.win
              ? `🏆 ${result.horse} took 1st place! Won ${result.payout} coins!`
              : `💸 ${winner?.name} won. Better luck next race!`}
          </div>
        )}

        {/* Turf Track */}
        <div className="derby-track-container">
          {racers.map((racer, idx) => {
            const silk = RACER_SILKS[idx % RACER_SILKS.length];
            const isPicked = selectedRacer === racer.id;
            return (
              <div key={racer.id} className="derby-lane">
                <div
                  className="derby-horse-runner"
                  style={{
                    left: `${Math.min(84, (racer.progress / 100) * 82)}%`,
                  }}
                >
                  <div
                    className="derby-horse-avatar"
                    style={{
                      background: silk.bg,
                      color: silk.text,
                      border: isPicked ? '2px solid #FFD84B' : '1px solid rgba(255,255,255,0.4)',
                    }}
                  >
                    <span style={{ fontSize: '13px' }}>{silk.icon}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#FFF', fontWeight: 700, textShadow: '0 1px 2px #000' }}>
                    #{racer.id} {racer.name} ({racer.odds}×)
                  </span>
                </div>
                <div className="derby-finish-line" />
              </div>
            );
          })}
        </div>

        {/* Racer Bet Selector */}
        {!racing && (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '8px' }}>
            {racers.map((racer, idx) => {
              const silk = RACER_SILKS[idx % RACER_SILKS.length];
              const isSelected = selectedRacer === racer.id;
              return (
                <button
                  key={racer.id}
                  type="button"
                  className={`step-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedRacer(racer.id)}
                  style={{
                    flex: 1,
                    borderColor: isSelected ? '#FFD84B' : undefined,
                    background: isSelected ? silk.bg : undefined,
                    color: isSelected ? silk.text : undefined,
                    fontSize: '11px',
                    padding: '6px 4px',
                  }}
                >
                  {silk.icon} #{racer.id} ({racer.odds}×)
                </button>
              );
            })}
          </div>
        )}

        <div className="game-controls">
          {!racing ? (
            <>
              <ChipSelector
                currentBet={bet}
                onBetChange={setBet}
              />
              <button
                className="play-btn"
                onClick={handleStartRace}
                style={{ marginTop: '8px' }}
              >
                🏁 START RACE ({bet} coins)
              </button>
            </>
          ) : (
            <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.8rem', padding: '10px' }}>
              🏇 Horses are off! Racing to the finish...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniDerby;
