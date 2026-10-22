import React, { useState, useRef, useEffect } from 'react';
import { CoinFlip as CoinFlipEngine } from '../../../game-logic/coin-flip';
import { PixelIcon } from '../../../../components/PixelIcon';
import ChipSelector from '../../ui/ChipSelector';
import { playCoinFlip, playCoinLand, playWin, playLoss, playBet } from '../../../utils/sounds';
import { particles } from '../../../utils/particles';

interface CoinFlipProps {
  onCoinsUpdate: () => void;
}

const CoinFlip: React.FC<CoinFlipProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [choice, setChoice] = useState<'heads' | 'tails'>('heads');
  const [result, setResult] = useState<any>(null);
  const [flipping, setFlipping] = useState(false);
  const [coinFace, setCoinFace] = useState<'heads' | 'tails'>('heads');
  const [streak, setStreak] = useState(0);

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
    if (!engine || flipping) return;

    setFlipping(true);
    setResult(null);

    try {
      const startResult = await window.electronAPI.startGame('coin-flip', bet);
      if (!startResult?.success) {
        const errorMsg = startResult?.error || 'Insufficient coins to place bet';
        setResult({ error: errorMsg, win: false, bet, payout: 0 });
        setFlipping(false);
        return;
      }
      onCoinsUpdate();
      const sessionId = startResult?.sessionId;
      playBet();
      playCoinFlip();
      engine.start(bet);

      // Determine outcome via engine
      await engine.flip(choice);
      const state = engine.getState();
      const endResult = engine.end();
      const finalFace: 'heads' | 'tails' = state.coinResult === 'tails' ? 'tails' : 'heads';

      // Realistic 1.2s flight time
      setTimeout(() => {
        playCoinLand();
        setCoinFace(finalFace);
      }, 1050);

      setTimeout(async () => {
        const isWin = endResult?.result === 'win';
        const gameResult = {
          ...state,
          bet,
          payout: endResult?.payout ?? 0,
          win: isWin,
          result: endResult?.result ?? 'loss',
          sessionId,
        };

        setResult(gameResult);
        if (isWin) {
          playWin();
          particles.burstCoins(undefined, undefined, 24);
          setStreak((prev) => prev + 1);
        } else {
          playLoss();
          setStreak(0);
        }

        await window.electronAPI.endGame('coin-flip', gameResult);
        onCoinsUpdate();
        setFlipping(false);
      }, 1250);
    } catch (error) {
      console.error('Flip failed:', error);
      setFlipping(false);
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="coin" size={28} aria-hidden={true} /> Coin Flip</h2>
        {streak > 1 && (
          <span style={{ fontSize: '11px', color: 'var(--balatro-yellow)', fontWeight: 800 }}>
            🔥 {streak} STREAK
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
            {result.win ? `Landed on ${result.coinResult?.toUpperCase()}! Won ${result.payout} coins!` : `Landed on ${result.coinResult?.toUpperCase()} — Lost ${bet} coins`}
          </div>
        )}

        <div className="game-display" style={{ flexDirection: 'column', gap: '8px' }}>
          {/* 3D Coin Scene */}
          <div className="coin-3d-scene">
            <div
              className={`coin-3d-disc ${flipping ? 'flipping' : ''}`}
              style={{
                transform: !flipping
                  ? coinFace === 'heads'
                    ? 'rotateX(0deg)'
                    : 'rotateX(180deg)'
                  : undefined,
              }}
            >
              <div className="coin-side coin-side-heads">
                <span className="coin-emblem">G</span>
                <span className="coin-text">HEADS</span>
              </div>
              <div className="coin-side coin-side-tails">
                <span className="coin-emblem">1</span>
                <span className="coin-text">TAILS</span>
              </div>
            </div>
          </div>

          {/* Choice Selector */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="button"
              className={`action-btn ${choice === 'heads' ? '' : 'bet-btn'}`}
              onClick={() => !flipping && setChoice('heads')}
              disabled={flipping}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderColor: choice === 'heads' ? 'var(--balatro-yellow)' : undefined,
                boxShadow: choice === 'heads' ? '0 0 10px rgba(255, 216, 75, 0.4)' : undefined,
              }}
            >
              HEADS (2×)
            </button>
            <button
              type="button"
              className={`action-btn ${choice === 'tails' ? '' : 'bet-btn'}`}
              onClick={() => !flipping && setChoice('tails')}
              disabled={flipping}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderColor: choice === 'tails' ? 'var(--balatro-yellow)' : undefined,
                boxShadow: choice === 'tails' ? '0 0 10px rgba(255, 216, 75, 0.4)' : undefined,
              }}
            >
              TAILS (2×)
            </button>
          </div>
        </div>

        <div className="game-controls">
          <ChipSelector
            currentBet={bet}
            onBetChange={setBet}
            disabled={flipping}
          />

          <button
            className="play-btn"
            onClick={handleFlip}
            disabled={flipping}
            style={{ marginTop: '8px' }}
          >
            {flipping ? 'FLIPPING...' : `FLIP COIN (${bet} coins)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinFlip;
