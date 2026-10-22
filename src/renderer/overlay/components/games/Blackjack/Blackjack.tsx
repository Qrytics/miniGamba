import React, { useState, useEffect, useRef } from 'react';
import { Blackjack as BlackjackEngine } from '../../../game-logic/blackjack';
import { PixelIcon } from '../../../../components/PixelIcon';
import PlayingCard from '../../ui/PlayingCard';
import ChipSelector from '../../ui/ChipSelector';
import { playCardDeal, playCardFlip, playWin, playBigWin, playLoss, playBet, playClick } from '../../../utils/sounds';
import { particles } from '../../../utils/particles';

interface BlackjackProps {
  onCoinsUpdate: () => void;
}

const Blackjack: React.FC<BlackjackProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [gameState, setGameState] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [playing, setPlaying] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const engineRef = useRef<BlackjackEngine | null>(null);

  useEffect(() => {
    const engine = new BlackjackEngine();
    engine.init();
    engineRef.current = engine;
    return () => {
      engineRef.current = null;
    };
  }, []);

  const finishGame = async (state: any) => {
    const engine = engineRef.current;
    if (!engine) return;

    setPlaying(false);
    playCardFlip();
    const endResult = engine.end();
    const isWin = endResult.result === 'win';
    const isBJ = Boolean(state.blackjack);

    const gameResult = {
      ...state,
      bet,
      outcome: endResult.result,
      payout: endResult.payout,
      result: endResult.result,
      win: isWin,
      blackjack: isBJ,
      sessionId,
    };

    setResult(gameResult);
    try {
      await window.electronAPI.endGame('blackjack', gameResult);
      if (isBJ) {
        playBigWin();
        particles.burstConfetti(undefined, undefined, 45);
      } else if (isWin) {
        playWin();
        particles.burstCoins(undefined, undefined, 25);
      } else if (endResult.result === 'push') {
        playWin();
      } else {
        playLoss();
      }
      onCoinsUpdate();
    } catch (error) {
      console.error('Finish game failed:', error);
    } finally {
      setSessionId(null);
    }
  };

  const handleDeal = async () => {
    const engine = engineRef.current;
    if (!engine) return;

    try {
      const startResult = await window.electronAPI.startGame('blackjack', bet);
      if (!startResult?.success) {
        setResult({ error: startResult?.error || 'Insufficient coins to place bet', win: false, bet, payout: 0 });
        return;
      }
      onCoinsUpdate();

      setSessionId(startResult.sessionId ?? null);
      playBet();
      engine.start(bet);
      engine.deal();
      playCardDeal();
      const state = engine.getState();
      setGameState(state);
      setResult(null);

      if (state.stage === 'complete') {
        // Natural blackjack occurred!
        setTimeout(() => {
          finishGame(state);
        }, 600);
      } else {
        setPlaying(true);
      }
    } catch (error) {
      console.error('Deal failed:', error);
    }
  };

  const handleHit = () => {
    const engine = engineRef.current;
    if (!engine || !gameState) return;

    playClick();
    engine.hit();
    playCardDeal();
    const state = engine.getState();
    setGameState(state);

    if (state.stage === 'complete') {
      finishGame(state);
    }
  };

  const handleStand = () => {
    const engine = engineRef.current;
    if (!engine || !gameState) return;

    engine.stand();
    const state = engine.getState();
    setGameState(state);
    finishGame(state);
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="card" size={28} aria-hidden={true} /> Blackjack</h2>
      </div>

      <div className="game-interface">
        {result?.error ? (
          <div className="result-display error error-message">
            ⚠️ {result.error}
          </div>
        ) : result && (
          <div className={`result-display ${result.win ? 'win' : result.outcome === 'push' ? '' : 'loss'}`}>
            {result.blackjack && '🔥 NATURAL BLACKJACK (3:2)! '}
            {result.outcome === 'win' && !result.blackjack && `You won ${result.payout} coins!`}
            {result.outcome === 'loss' && `Dealer wins (${result.dealerScore}). Lost ${bet} coins`}
            {result.outcome === 'push' && `Push (${result.playerScore} vs ${result.dealerScore}). Bet returned.`}
          </div>
        )}

        {gameState ? (
          <div className="game-display" style={{ flexDirection: 'column', gap: '1rem' }}>
            {/* Dealer Hand */}
            <div>
              <p className="text-muted text-center mb-1" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Dealer ({playing ? `${gameState.visibleDealerScore} + ?` : gameState.dealerScore})
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {gameState.dealerHand.map((card: string, idx: number) => (
                  <PlayingCard
                    key={idx}
                    card={card}
                    faceDown={playing && idx === 1}
                    size="md"
                  />
                ))}
              </div>
            </div>

            {/* Player Hand */}
            <div>
              <p className="text-muted text-center mb-1" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Your Hand ({gameState.playerScore})
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {gameState.playerHand.map((card: string, idx: number) => (
                  <PlayingCard
                    key={idx}
                    card={card}
                    size="md"
                    highlighted={gameState.playerScore === 21}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="game-display" style={{ minHeight: '140px', justifyContent: 'center', alignItems: 'center' }}>
            <p className="text-muted">Place your bet and tap Deal!</p>
          </div>
        )}

        <div className="game-controls">
          {!playing ? (
            <>
              <ChipSelector
                currentBet={bet}
                onBetChange={setBet}
              />
              <button
                className="play-btn"
                onClick={handleDeal}
                style={{ marginTop: '8px' }}
              >
                DEAL ({bet} coins)
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                className="action-btn"
                onClick={handleHit}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                HIT
              </button>
              <button
                className="action-btn"
                onClick={handleStand}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                STAND
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blackjack;
