import React, { useState, useEffect, useRef } from 'react';
import { HigherOrLower as HigherOrLowerEngine } from '../../../game-logic/higher-or-lower';
import { PixelIcon } from '../../../../components/PixelIcon';
import PlayingCard from '../../ui/PlayingCard';
import ChipSelector from '../../ui/ChipSelector';
import { playCardDeal, playCardFlip, playWin, playLoss, playBet, playCashOut, playStreakUp } from '../../../utils/sounds';
import { particles } from '../../../utils/particles';

interface HigherOrLowerProps {
  onCoinsUpdate: () => void;
}

const MULTIPLIERS = [1.2, 1.5, 2.0, 3.0, 5.0, 8.0, 12.0, 20.0, 35.0, 50.0];

const HigherOrLower: React.FC<HigherOrLowerProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [currentCard, setCurrentCard] = useState<string>('K♠');
  const [nextCard, setNextCard] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [result, setResult] = useState<{ win?: boolean; payout?: number; streak?: number; bet?: number; error?: string } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const engineRef = useRef<HigherOrLowerEngine | null>(null);

  useEffect(() => {
    const engine = new HigherOrLowerEngine();
    engine.init();
    engineRef.current = engine;
    const state = engine.getState();
    if (state.currentCard) {
      setCurrentCard(state.currentCard.display);
    }
    return () => {
      engineRef.current = null;
    };
  }, []);

  const handleStart = async () => {
    const engine = engineRef.current;
    if (!engine || playing || isRevealing) return;

    try {
      const startResult = await window.electronAPI.startGame('higher-or-lower', bet);
      if (!startResult?.success) {
        setResult({ error: startResult?.error || 'Insufficient coins to place bet', win: false, bet, payout: 0 });
        return;
      }
      onCoinsUpdate();

      setSessionId(startResult.sessionId ?? null);
      playBet();
      engine.start(bet);
      engine.init();
      playCardDeal();

      const state = engine.getState();
      setCurrentCard(state.currentCard?.display ?? 'K♠');
      setNextCard(null);
      setStreak(0);
      setResult(null);
      setPlaying(true);
    } catch (error) {
      console.error('Start failed:', error);
    }
  };

  const handleGuess = async (choice: 'higher' | 'lower') => {
    const engine = engineRef.current;
    if (!engine || !playing || isRevealing) return;

    setIsRevealing(true);
    playCardFlip();

    const isCorrect = await engine.guess(choice);
    const state = engine.getState();
    const drawn = state.nextCard?.display ?? '2♥';
    setNextCard(drawn);

    setTimeout(async () => {
      if (isCorrect) {
        const newStreak = state.streak;
        setStreak(newStreak);
        playStreakUp(newStreak);
        setCurrentCard(drawn);
        setNextCard(null);
        setIsRevealing(false);

        if (newStreak >= 10) {
          // Auto cash-out at max streak
          handleCashOut();
        }
      } else {
        // Loss
        const gameResult = {
          bet,
          payout: 0,
          result: 'loss',
          win: false,
          streak: state.streak,
          sessionId,
        };
        setResult({ win: false, payout: 0, streak: state.streak });
        setPlaying(false);
        setIsRevealing(false);
        playLoss();
        await window.electronAPI.endGame('higher-or-lower', gameResult);
        setSessionId(null);
        onCoinsUpdate();
      }
    }, 120);
  };

  const handleCashOut = async () => {
    const engine = engineRef.current;
    if (!engine || !playing || isRevealing) return;

    const payout = engine.cashOut();
    const gameResult = {
      bet,
      payout,
      result: 'win',
      win: true,
      streak,
      sessionId,
    };

    setResult({ win: true, payout, streak });
    setPlaying(false);
    playCashOut();

    if (streak >= 5) {
      particles.burstConfetti(undefined, undefined, 40);
    } else {
      particles.burstCoins(undefined, undefined, 25);
    }

    await window.electronAPI.endGame('higher-or-lower', gameResult);
    setSessionId(null);
    onCoinsUpdate();
  };

  const currentMultiplier = streak > 0 ? (MULTIPLIERS[streak - 1] ?? 50) : 1;
  const potentialWinnings = Math.floor(bet * currentMultiplier);

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="target" size={28} aria-hidden={true} /> Higher or Lower</h2>
        {playing && streak > 0 && (
          <span style={{ fontSize: '11px', color: 'var(--balatro-yellow)', fontWeight: 800 }}>
            🔥 {streak} STREAK ({currentMultiplier}×)
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
            {result.win ? `Cashed out at ${result.streak} streak! Won ${result.payout} coins!` : `Wrong guess! Streak lost.`}
          </div>
        )}

        <div className="game-display" style={{ flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          {/* Card comparison display */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p className="text-muted mb-1" style={{ fontSize: '10px' }}>CURRENT</p>
              <PlayingCard card={currentCard} size="lg" />
            </div>

            <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>➔</div>

            <div style={{ textAlign: 'center' }}>
              <p className="text-muted mb-1" style={{ fontSize: '10px' }}>NEXT</p>
              {nextCard ? (
                <PlayingCard card={nextCard} size="lg" highlighted />
              ) : (
                <PlayingCard faceDown size="lg" />
              )}
            </div>
          </div>

          {/* Multiplier Track */}
          {playing && (
            <div style={{ display: 'flex', gap: '4px', maxWidth: '320px', width: '100%', overflowX: 'auto', padding: '4px 0' }}>
              {MULTIPLIERS.map((mult, idx) => {
                const isCurrent = streak === idx + 1;
                const isPassed = streak > idx + 1;
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: '9px',
                      padding: '3px 2px',
                      borderRadius: '3px',
                      background: isCurrent
                        ? 'var(--balatro-yellow)'
                        : isPassed
                        ? 'var(--balatro-green)'
                        : 'var(--balatro-panel-shadow)',
                      color: isCurrent ? '#000' : isPassed ? '#000' : 'var(--text-secondary)',
                      fontWeight: isCurrent || isPassed ? 800 : 500,
                    }}
                  >
                    {mult}×
                  </div>
                );
              })}
            </div>
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
                  className="action-btn"
                  onClick={() => handleGuess('higher')}
                  disabled={isRevealing}
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                >
                  ▲ HIGHER
                </button>
                <button
                  className="action-btn"
                  onClick={() => handleGuess('lower')}
                  disabled={isRevealing}
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                >
                  ▼ LOWER
                </button>
              </div>

              {streak > 0 && (
                <button
                  className="play-btn"
                  onClick={handleCashOut}
                  disabled={isRevealing}
                  style={{
                    background: 'linear-gradient(90deg, #10B981, #059669)',
                    borderColor: '#34D399',
                    fontSize: '0.85rem',
                  }}
                >
                  💰 CASH OUT ({potentialWinnings} coins)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HigherOrLower;
