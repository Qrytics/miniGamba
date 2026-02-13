import React, { useState, useRef, useEffect } from 'react';
import { CoinFlip as CoinFlipEngine } from '../../game-logic/coin-flip';
import { PixelIcon } from '../../../components/PixelIcon';

interface CoinFlipProps {
  onCoinsUpdate: () => void;
}

const CoinFlip: React.FC<CoinFlipProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [choice, setChoice] = useState<'heads' | 'tails'>('heads');
  const [result, setResult] = useState<any>(null);
  const [flipping, setFlipping] = useState(false);
  const [coinFace, setCoinFace] = useState('heads');

  const engineRef = useRef<CoinFlipEngine | null>(null);

  useEffect(() => {
    const engine = new CoinFlipEngine();
    engine.init();
    engineRef.current = engine;
    return () => {
      engineRef.current = null;
    };
  }, []);

  const handleFlip = async () => {
    const engine = engineRef.current;
    if (!engine) return;

    if (flipping) return;
    
    setFlipping(true);
    setResult(null);

    try {
      await window.electronAPI.startGame('coin-flip', bet);
      engine.start(bet);
      
      // Flip animation
      const animationFrames = 10;
      for (let i = 0; i < animationFrames; i++) {
        setCoinFace(i % 2 === 0 ? 'heads' : 'tails');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Get actual result
      await engine.flip(choice);
      const state = engine.getState();
      const endResult = engine.end();

      const gameResult = {
        ...state,
        ...endResult,
        bet: bet, // Include bet in result
        payout: endResult.payout,
        win: endResult.result === 'win',
        result: endResult.result,
      };

      setCoinFace(state.coinResult || 'heads');
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
        <h2 className="game-title"><PixelIcon name="coin" size={28} aria-hidden={true} /> Coin Flip</h2>
      </div>

      <div className="game-interface">
        {result && (
          <div className={`result-display ${result.win ? 'win' : 'loss'}`}>
            {result.win ? `You won ${result.payout} coins!` : `You lost ${bet} coins`}
          </div>
        )}

        <div className="game-display">
          <div className={`coin ${flipping ? 'flipping' : ''}`}>
            {coinFace === 'heads' ? <PixelIcon name="crown" size={64} aria-hidden={true} /> : <PixelIcon name="coin" size={64} aria-hidden={true} />}
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
              <PixelIcon name="crown" size={20} aria-hidden={true} /> Heads
            </button>
            <button 
              className={`action-btn ${choice === 'tails' ? '' : 'btn-secondary'}`}
              onClick={() => setChoice('tails')}
              disabled={flipping}
              style={{ width: '120px' }}
            >
              <PixelIcon name="coin" size={20} aria-hidden={true} /> Tails
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
