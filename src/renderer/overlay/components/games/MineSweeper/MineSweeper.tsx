import React, { useState } from 'react';
import { PixelIcon } from '../../../../components/PixelIcon';

interface MineSweeperProps {
  onCoinsUpdate: () => void;
}

const MineSweeper: React.FC<MineSweeperProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [grid, setGrid] = useState<string[]>(Array(25).fill('⬜'));
  const [revealed, setRevealed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleStart = async () => {
    try {
      await window.electronAPI.startGame('mine-sweeper', bet);
      setGrid(Array(25).fill('⬜'));
      setRevealed(0);
      setResult(null);
      setPlaying(true);
    } catch (error) {
      console.error('Start failed:', error);
    }
  };

  const handleReveal = async (index: number) => {
    if (!playing || grid[index] !== '⬜') return;
    const isMine = Math.random() < 0.15; // Simplified
    const newGrid = [...grid];
    newGrid[index] = isMine ? '💣' : '💎';
    setGrid(newGrid);
    
    if (isMine) {
      setPlaying(false);
      const gameResult = { 
        bet: bet,
        payout: 0, 
        result: 'loss',
        win: false,
        hit: 'mine' 
      };
      setResult(gameResult);
      await window.electronAPI.endGame('mine-sweeper', gameResult);
      onCoinsUpdate();
    } else {
      setRevealed(revealed + 1);
    }
  };

  const handleCashOut = async () => {
    const multiplier = 1 + revealed * 0.3;
    const payout = bet * multiplier;
    const gameResult = { 
      bet: bet,
      payout: payout,
      result: 'win',
      win: true,
      revealed 
    };
    setResult(gameResult);
    setPlaying(false);
    await window.electronAPI.endGame('mine-sweeper', gameResult);
    onCoinsUpdate();
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="mine" size={28} aria-hidden={true} /> Mine Sweeper</h2>
      </div>
      <div className="game-interface">
        {result && (
          <div className={`result-display ${result.payout > 0 ? 'win' : 'loss'}`}>
            {result.payout > 0 ? <>Cashed out {result.payout} coins!</> : <><PixelIcon name="mine" size={20} aria-hidden={true} /> Hit a mine!</>}
          </div>
        )}
        <div className="game-display">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', maxWidth: '300px' }}>
            {grid.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleReveal(idx)}
                disabled={!playing || cell !== '⬜'}
                style={{
                  width: '50px',
                  height: '50px',
                  fontSize: '1.5rem',
                  border: '1px solid var(--border)',
                  background: cell === '⬜' ? 'var(--surface-hover)' : 'transparent',
                  cursor: playing && cell === '⬜' ? 'pointer' : 'default',
                  borderRadius: 0,
                }}
              >
                {cell === '⬜' && '?'}
                {cell === '💣' && <PixelIcon name="mine" size={28} aria-hidden={true} />}
                {cell === '💎' && <PixelIcon name="star" size={28} aria-hidden={true} />}
              </button>
            ))}
          </div>
          {playing && <p className="text-muted mt-2">Revealed: {revealed} | Multiplier: {(1 + revealed * 0.3).toFixed(2)}x</p>}
        </div>
        <div className="game-controls">
          {!playing ? (
            <>
              <div className="bet-controls">
                <button className="bet-btn" onClick={() => setBet(Math.max(1, bet - 10))}>-10</button>
                <input type="number" className="bet-input" value={bet} onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
                <button className="bet-btn" onClick={() => setBet(bet + 10)}>+10</button>
              </div>
              <button className="play-btn" onClick={handleStart}>START ({bet} coins)</button>
            </>
          ) : (
            <button className="play-btn" onClick={handleCashOut} disabled={revealed === 0}>
              <PixelIcon name="cashout" size={20} aria-hidden={true} /> CASH OUT
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MineSweeper;
