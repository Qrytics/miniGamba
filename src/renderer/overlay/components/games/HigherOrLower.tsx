import React, { useState } from 'react';
import { PixelIcon } from '../../../components/PixelIcon';

interface HigherOrLowerProps {
  onCoinsUpdate: () => void;
}

const HigherOrLower: React.FC<HigherOrLowerProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [currentCard, setCurrentCard] = useState('K♠');
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [playing, setPlaying] = useState(false);

  const handleStart = async () => {
    try {
      await window.electronAPI.startGame('higher-or-lower', bet);
      setCurrentCard('K♠');
      setStreak(0);
      setResult(null);
      setPlaying(true);
    } catch (error) {
      console.error('Start failed:', error);
    }
  };

  const handleGuess = async (higher: boolean) => {
    // Simplified - real implementation would use the engine
    const win = Math.random() > 0.5;
    if (win) {
      setStreak(streak + 1);
      setCurrentCard(['A♥', 'K♦', 'Q♣', '10♠'][Math.floor(Math.random() * 4)]);
    } else {
      const payout = bet * (1 + streak * 0.2);
      const gameResult = { 
        bet: bet,
        payout: payout,
        result: 'loss',
        win: false,
        streak 
      };
      setResult(gameResult);
      setPlaying(false);
      await window.electronAPI.endGame('higher-or-lower', gameResult);
      onCoinsUpdate();
    }
  };

  const handleCashOut = async () => {
    const payout = bet * (1 + streak * 0.2);
    const gameResult = { 
      bet: bet,
      payout: payout,
      result: 'win',
      win: true,
      streak 
    };
    setResult(gameResult);
    setPlaying(false);
    await window.electronAPI.endGame('higher-or-lower', gameResult);
    onCoinsUpdate();
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="target" size={28} aria-hidden={true} /> Higher or Lower</h2>
      </div>
      <div className="game-interface">
        {result && (
          <div className="result-display win">
            Cashed out {result.payout} coins! Streak: {result.streak}
          </div>
        )}
        <div className="game-display">
          <div className="playing-card" style={{ width: '120px', height: '168px', fontSize: '3rem' }}>
            {currentCard}
          </div>
          {playing && <p className="text-muted mt-2">Streak: {streak}</p>}
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
            <>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button className="action-btn" onClick={() => handleGuess(true)} style={{ flex: 1 }}><PixelIcon name="higher" size={18} aria-hidden={true} /> HIGHER</button>
                <button className="action-btn" onClick={() => handleGuess(false)} style={{ flex: 1 }}><PixelIcon name="lower" size={18} aria-hidden={true} /> LOWER</button>
              </div>
              <button className="play-btn" onClick={handleCashOut}><PixelIcon name="cashout" size={20} aria-hidden={true} /> CASH OUT</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HigherOrLower;
