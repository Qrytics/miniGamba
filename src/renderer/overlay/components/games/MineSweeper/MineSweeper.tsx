import React, { useState, useEffect, useRef } from 'react';
import { MineSweeper as MineSweeperEngine, MineSweeperState } from '../../../game-logic/mine-sweeper';
import { PixelIcon } from '../../../../components/PixelIcon';
import ChipSelector from '../../ui/ChipSelector';
import { playWin, playLoss, playBet, playReveal, playExplosion, playCashOut, playClick } from '../../../utils/sounds';
import { particles } from '../../../utils/particles';

interface MineSweeperProps {
  onCoinsUpdate: () => void;
}

const MineSweeper: React.FC<MineSweeperProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [difficulty, setDifficulty] = useState<3 | 5 | 10>(3);
  const [gameState, setGameState] = useState<MineSweeperState | null>(null);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const engineRef = useRef<MineSweeperEngine | null>(null);

  useEffect(() => {
    const engine = new MineSweeperEngine();
    engine.setDifficulty(difficulty);
    engine.init();
    engineRef.current = engine;
    setGameState(engine.getState());
    return () => {
      engineRef.current = null;
    };
  }, [difficulty]);

  const handleStart = async () => {
    const engine = engineRef.current;
    if (!engine || playing) return;

    try {
      const startResult = await window.electronAPI.startGame('mine-sweeper', bet);
      if (!startResult?.success) {
        setResult({ error: startResult?.error || 'Insufficient coins to place bet', win: false, bet, payout: 0 });
        return;
      }
      onCoinsUpdate();

      setSessionId(startResult.sessionId ?? null);
      playBet();
      engine.start(bet);
      engine.setDifficulty(difficulty);
      engine.init();

      setGameState(engine.getState());
      setResult(null);
      setPlaying(true);
    } catch (error) {
      console.error('Start failed:', error);
    }
  };

  const handleTileClick = async (row: number, col: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const engine = engineRef.current;
    if (!engine || !playing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;

    const isSafe = engine.reveal(row, col);
    const state = engine.getState();
    setGameState(state);

    if (isSafe) {
      playReveal();
      particles.burstSparkles(clickX, clickY, 10);

      // Check if auto-win (all safe tiles cleared)
      if (!state.gameActive && state.canCashOut) {
        handleCashOut();
      }
    } else {
      // Hit a mine!
      playExplosion();
      particles.burstSmoke(clickX, clickY, 28);
      setPlaying(false);

      const gameResult = {
        bet,
        payout: 0,
        result: 'loss',
        win: false,
        hit: 'mine',
        revealed: state.revealedCount,
        sessionId,
      };
      setResult(gameResult);
      playLoss();
      await window.electronAPI.endGame('mine-sweeper', gameResult);
      setSessionId(null);
      onCoinsUpdate();
    }
  };

  const handleLuckyReveal = () => {
    const engine = engineRef.current;
    if (!engine || !playing) return;

    playClick();
    const hint = engine.luckyReveal();
    if (hint) {
      playReveal();
      setGameState(engine.getState());
    }
  };

  const handleCashOut = async () => {
    const engine = engineRef.current;
    if (!engine || !playing) return;

    const payout = engine.cashOut();
    const state = engine.getState();
    setGameState(state);
    setPlaying(false);

    const gameResult = {
      bet,
      payout,
      result: 'win',
      win: true,
      revealed: state.revealedCount,
      multiplier: state.multiplier,
      sessionId,
    };
    setResult(gameResult);
    playCashOut();
    particles.burstCoins(undefined, undefined, 28);

    await window.electronAPI.endGame('mine-sweeper', gameResult);
    setSessionId(null);
    onCoinsUpdate();
  };

  const grid = gameState?.grid ?? [];
  const multiplier = gameState?.multiplier ?? 1;
  const potentialWinning = Math.floor(bet * multiplier);
  const luckyLeft = gameState?.luckyRevealsRemaining ?? 0;

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="mine" size={28} aria-hidden={true} /> Mine Sweeper</h2>
        {playing && (
          <span style={{ fontSize: '11px', color: 'var(--balatro-green)', fontWeight: 800 }}>
            {multiplier.toFixed(2)}× ({potentialWinning} COINS)
          </span>
        )}
      </div>

      <div className="game-interface">
        {result?.error ? (
          <div className="result-display error error-message">
            ⚠️ {result.error}
          </div>
        ) : result && (
          <div className={`result-display ${result.win ? 'win' : 'loss'}`}>
            {result.win ? `Cashed out at ${multiplier.toFixed(2)}×! Won ${result.payout} coins!` : `Detonated a mine! Lost ${bet} coins.`}
          </div>
        )}

        {/* Difficulty Selector (when not playing) */}
        {!playing && (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '8px' }}>
            {([3, 5, 10] as const).map((count) => (
              <button
                key={count}
                type="button"
                className={`step-btn ${difficulty === count ? 'active' : ''}`}
                onClick={() => setDifficulty(count)}
                style={{
                  background: difficulty === count ? 'var(--balatro-purple)' : undefined,
                  borderColor: difficulty === count ? 'var(--balatro-yellow)' : undefined,
                }}
              >
                {count === 3 ? 'EASY (3)' : count === 5 ? 'MEDIUM (5)' : 'HARD (10)'}
              </button>
            ))}
          </div>
        )}

        {/* Cyber 5x5 Grid */}
        <div className="minesweeper-cyber-grid">
          {grid.map((rowArr, rIdx) =>
            rowArr.map((tile, cIdx) => {
              const isRevealed = tile.revealed;
              const isMine = tile.type === 'mine';
              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  type="button"
                  style={{ width: '50px', height: '50px' }}
                  className={`mine-cyber-tile ${
                    isRevealed ? (isMine ? 'revealed-mine' : 'revealed-gem') : ''
                  }`}
                  onClick={(e) => handleTileClick(rIdx, cIdx, e)}
                  disabled={!playing || isRevealed}
                >
                  {isRevealed ? (isMine ? '💥' : '💎') : ''}
                </button>
              );
            })
          )}
        </div>

        <div className="game-controls">
          {!playing ? (
            <>
              <ChipSelector
                currentBet={bet}
                onBetChange={setBet}
              />
              <button
                className="play-btn"
                onClick={handleStart}
                style={{ marginTop: '8px' }}
              >
                START GAME ({bet} coins)
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="step-btn"
                  onClick={handleLuckyReveal}
                  disabled={luckyLeft <= 0}
                  style={{ flex: 1, padding: '8px' }}
                >
                  🔍 LUCKY HINT ({luckyLeft})
                </button>
                {gameState && gameState.canCashOut && (
                  <button
                    className="play-btn"
                    onClick={handleCashOut}
                    style={{
                      flex: 2,
                      background: 'linear-gradient(90deg, #10B981, #059669)',
                      borderColor: '#34D399',
                      padding: '8px',
                    }}
                  >
                    💰 CASH OUT ({potentialWinning})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MineSweeper;
