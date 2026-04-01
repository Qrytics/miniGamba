import React, { useState } from 'react';
import { PixelIcon } from '../../../../components/PixelIcon';
import { playWin, playLoss, playBet, playCardDeal, playReveal } from '../../../utils/sounds';

interface HigherOrLowerProps {
  onCoinsUpdate: () => void;
}

// Simple card deck for comparison
const CARD_VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const CARD_SUITS = ['♠', '♥', '♦', '♣'];

function randomCard(): { label: string; value: number } {
  const val = Math.floor(Math.random() * 13);
  const suit = CARD_SUITS[Math.floor(Math.random() * 4)];
  return { label: `${CARD_VALUES[val]}${suit}`, value: val };
}

const HigherOrLower: React.FC<HigherOrLowerProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [currentCard, setCurrentCard] = useState<{ label: string; value: number }>({ label: 'K♠', value: 11 });
  const [nextCard, setNextCard] = useState<{ label: string; value: number } | null>(null);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState<{ win: boolean; payout: number; streak: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleStart = async () => {
    try {
      const startResult = await window.electronAPI.startGame('higher-or-lower', bet);
      if (!startResult?.success) {
        return;
      }
      setSessionId(startResult?.sessionId || null);
      setCurrentCard(randomCard());
      setNextCard(null);
      setStreak(0);
      setResult(null);
      setPlaying(true);
      playBet();
      playCardDeal();
    } catch (error) {
      console.error('Start failed:', error);
    }
  };

  const handleGuess = async (higher: boolean) => {
    const next = randomCard();
    setNextCard(next);
    // Win if the player's guess matches the actual comparison
    const win = higher ? next.value > currentCard.value : next.value < currentCard.value;
    // Ties count as a loss to keep it simple
    playReveal();
    if (win) {
      setStreak(streak + 1);
      setTimeout(() => {
        setCurrentCard(next);
        setNextCard(null);
      }, 800);
    } else {
      const gameResult = {
        bet,
        payout: 0,
        result: 'loss',
        win: false,
        streak,
        sessionId,
      };
      setResult({ win: false, payout: 0, streak });
      setPlaying(false);
      playLoss();
      await window.electronAPI.endGame('higher-or-lower', gameResult);
      onCoinsUpdate();
    }
  };

  const handleCashOut = async () => {
    const payout = Math.floor(bet * (1 + streak * 0.5));
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
    playWin();
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
          <div className={`result-display ${result.win ? 'win' : 'loss'}`}>
            {result.win
              ? `🎉 Cashed out ${result.payout} coins! Streak: ${result.streak}`
              : `💸 Wrong guess! Streak was ${result.streak}`}
          </div>
        )}
        <div className="game-display" style={{ flexDirection: 'row', gap: '1.5rem', alignItems: 'center', justifyContent: 'center' }}>
          <div className="playing-card" style={{ width: '80px', height: '112px', fontSize: '1.4rem' }}>
            {currentCard.label}
          </div>
          {nextCard && (
            <>
              <span style={{ fontSize: '1.5rem' }}>→</span>
              <div className="playing-card" style={{ width: '80px', height: '112px', fontSize: '1.4rem',
                background: nextCard.value > currentCard.value
                  ? 'rgba(72,255,154,0.15)' : 'rgba(255,75,75,0.15)' }}>
                {nextCard.label}
              </div>
            </>
          )}
          {playing && !nextCard && <p className="text-muted">?</p>}
        </div>
        {playing && (
          <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Streak: {streak} | Cash out multiplier: {(1 + streak * 0.5).toFixed(1)}×
          </p>
        )}
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
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                <button className="action-btn" onClick={() => handleGuess(true)} style={{ flex: 1 }}>
                  <PixelIcon name="higher" size={18} aria-hidden={true} /> HIGHER
                </button>
                <button className="action-btn" onClick={() => handleGuess(false)} style={{ flex: 1 }}>
                  <PixelIcon name="lower" size={18} aria-hidden={true} /> LOWER
                </button>
              </div>
              <button className="play-btn" onClick={handleCashOut} disabled={streak === 0}>
                <PixelIcon name="cashout" size={20} aria-hidden={true} /> CASH OUT
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HigherOrLower;
