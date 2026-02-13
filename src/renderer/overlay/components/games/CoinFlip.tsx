import React, { useState } from 'react';
import CoinFlipEngine from '../../game-logic/coin-flip';

interface CoinFlipProps {
  onCoinsUpdate: () => void;
}

const CoinFlip: React.FC<CoinFlipProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [choice, setChoice] = useState<'heads' | 'tails'>('heads');
  const [result, setResult] = useState<any>(null);
  const [flipping, setFlipping] = useState(false);
  const [coinFace, setCoinFace] = useState('heads');

  const engine = new CoinFlipEngine();

  const handleFlip = async () => {
    if (flipping) return;
    
    setFlipping(true);
    setResult(null);

    try {
      await window.electronAPI.startGame('coin-flip', bet);
      
      // Flip animation
      const animationFrames = 10;
      for (let i = 0; i < animationFrames; i++) {
        setCoinFace(i % 2 === 0 ? 'heads' : 'tails');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Get actual result
      const gameResult = engine.flip(bet, choice);
      setCoinFace(gameResult.result);
      setResult(gameResult);
      
      await window.electronAPI.endGame('coin-flip', gameResult);
      onCoinsUpdate();
    } catch (error) {
      console.error('Flip failed:', error);
    } finally {
      setFlipping(false);
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title">🪙 Coin Flip</h2>
      </div>

      <div className="game-interface">
        {result && (
          <div className={`result-display ${result.win ? 'win' : 'loss'}`}>
            {result.win ? `🎉 You won ${result.payout} coins!` : `💔 You lost ${bet} coins`}
          </div>
        )}

        <div className="game-display">
          <div className={`coin ${flipping ? 'flipping' : ''}`}>
            {coinFace === 'heads' ? '👑' : '🪙'}
          </div>
          <p className="text-muted text-center">
            {flipping ? 'Flipping...' : `Landed on ${coinFace}`}
          </p>
        </div>

        <div className="game-controls">
          <div className="bet-controls">
            <button 
              className={`action-btn ${choice === 'heads' ? '' : 'btn-secondary'}`}
              onClick={() => setChoice('heads')}
              disabled={flipping}
              style={{ width: '120px' }}
            >
              👑 Heads
            </button>
            <button 
              className={`action-btn ${choice === 'tails' ? '' : 'btn-secondary'}`}
              onClick={() => setChoice('tails')}
              disabled={flipping}
              style={{ width: '120px' }}
            >
              🪙 Tails
            </button>
          </div>

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
            onClick={handleFlip}
            disabled={flipping}
          >
            {flipping ? 'FLIPPING...' : `FLIP (${bet} coins)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinFlip;
