import React, { useState, useEffect, useRef } from 'react';
import { MiniPoker as MiniPokerEngine, Card, GameStage } from '../../../game-logic/mini-poker';
import { PixelIcon } from '../../../../components/PixelIcon';
import PlayingCard from '../../ui/PlayingCard';
import ChipSelector from '../../ui/ChipSelector';
import { playCardDeal, playCardFlip, playWin, playBigWin, playLoss, playBet, playClick } from '../../../utils/sounds';
import { particles } from '../../../utils/particles';

interface MiniPokerProps {
  onCoinsUpdate: () => void;
}

export const MiniPoker: React.FC<MiniPokerProps> = ({ onCoinsUpdate }) => {
  const [anteBet, setAnteBet] = useState(10);
  const [stage, setStage] = useState<GameStage>('betting');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerRankDesc, setPlayerRankDesc] = useState<string>('');
  const [dealerRankDesc, setDealerRankDesc] = useState<string>('');
  const [result, setResult] = useState<any>(null);

  const engineRef = useRef<MiniPokerEngine | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    const engine = new MiniPokerEngine();
    engine.init();
    engineRef.current = engine;
    return () => {
      engineRef.current = null;
    };
  }, []);

  const handleDeal = async () => {
    const engine = engineRef.current;
    if (!engine || stage !== 'betting') return;

    try {
      const startRes = await window.electronAPI.startGame('mini-poker', anteBet);
      if (!startRes?.success) {
        setResult({ error: startRes?.error || 'Insufficient coins to place bet', win: false, bet: anteBet, payout: 0 });
        return;
      }
      onCoinsUpdate();

      sessionIdRef.current = startRes.sessionId ?? null;
      playBet();
      engine.start(anteBet);
      engine.init();
      engine.deal();

      playCardDeal();
      const state = engine.getState();
      setPlayerHand(state.playerHand);
      setDealerHand(state.dealerHand);
      setStage('decision');
      setPlayerRankDesc(state.playerHandRank?.description ?? '');
      setDealerRankDesc('');
      setResult(null);
    } catch (error) {
      console.error('Deal failed:', error);
    }
  };

  const handlePlay = async () => {
    const engine = engineRef.current;
    if (!engine || stage !== 'decision') return;

    playClick();
    playBet();
    playCardFlip();
    engine.play();

    const state = engine.getState();
    const endResult = engine.end();
    const isWin = endResult.result === 'win';

    setDealerRankDesc(state.dealerHandRank?.description ?? '');
    setStage('complete');

    const totalBet = anteBet * 2;
    const gameResult = {
      bet: totalBet,
      payout: endResult.payout,
      result: endResult.result,
      win: isWin,
      playerRank: state.playerHandRank?.description,
      dealerRank: state.dealerHandRank?.description,
      sessionId: sessionIdRef.current,
    };

    setResult(gameResult);

    if (endResult.payout >= totalBet * 4) {
      playBigWin();
      particles.burstConfetti(undefined, undefined, 45);
    } else if (isWin) {
      playWin();
      particles.burstCoins(undefined, undefined, 25);
    } else {
      playLoss();
    }

    await window.electronAPI.endGame('mini-poker', gameResult);
    sessionIdRef.current = null;
    onCoinsUpdate();
  };

  const handleFold = async () => {
    const engine = engineRef.current;
    if (!engine || stage !== 'decision') return;

    playClick();
    engine.fold();
    const state = engine.getState();
    const endResult = engine.end();

    setDealerRankDesc(state.dealerHandRank?.description ?? '');
    setStage('complete');

    const gameResult = {
      bet: anteBet,
      payout: 0,
      result: 'loss',
      win: false,
      playerRank: state.playerHandRank?.description,
      sessionId: sessionIdRef.current,
    };

    setResult(gameResult);
    playLoss();

    await window.electronAPI.endGame('mini-poker', gameResult);
    sessionIdRef.current = null;
    onCoinsUpdate();
  };

  const handleReset = () => {
    const engine = engineRef.current;
    if (engine) engine.init();
    setStage('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setResult(null);
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="spade" size={24} aria-hidden /> Mini Poker (3-Card)</h2>
      </div>

      <div className="game-interface">
        {result?.error ? (
          <div className="result-display error error-message">
            ⚠️ {result.error}
          </div>
        ) : result && (
          <div className={`result-display ${result.win ? 'win' : result.result === 'push' ? '' : 'loss'}`}>
            {result.win
              ? `🃏 You won ${result.payout} coins! (${result.playerRank} beats ${result.dealerRank})`
              : result.result === 'push'
              ? 'Push! Ante and Play bets returned.'
              : `Dealer wins with ${result.dealerRank || 'High Card'}. Lost ${result.bet} coins.`}
          </div>
        )}

        <div className="game-display" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          {dealerHand.length > 0 && (
            <div>
              <p className="text-muted text-center mb-1" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Dealer {dealerRankDesc ? `(${dealerRankDesc})` : '(Needs Queen to qualify)'}
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {dealerHand.map((c, i) => (
                  <PlayingCard
                    key={i}
                    card={c.display}
                    faceDown={stage === 'decision'}
                    size="md"
                  />
                ))}
              </div>
            </div>
          )}

          {playerHand.length > 0 && (
            <div>
              <p className="text-muted text-center mb-1" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Your Hand {playerRankDesc && `(${playerRankDesc})`}
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {playerHand.map((c, i) => (
                  <PlayingCard
                    key={i}
                    card={c.display}
                    size="md"
                    highlighted={stage === 'complete' && result?.win}
                  />
                ))}
              </div>
            </div>
          )}

          {stage === 'betting' && (
            <p className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'center', padding: '10px' }}>
              Ante up! 3 cards to you, 3 to dealer. Pair or better beats dealer!
            </p>
          )}
        </div>

        <div className="game-controls">
          {stage === 'betting' && (
            <>
              <ChipSelector
                currentBet={anteBet}
                onBetChange={setAnteBet}
              />
              <button
                className="play-btn"
                onClick={handleDeal}
                style={{ marginTop: '8px' }}
              >
                DEAL ({anteBet} coins)
              </button>
            </>
          )}

          {stage === 'decision' && (
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                className="step-btn"
                onClick={handleFold}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                FOLD (Lose {anteBet})
              </button>
              <button
                className="play-btn"
                onClick={handlePlay}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                PLAY (Match {anteBet})
              </button>
            </div>
          )}

          {stage === 'complete' && (
            <button
              className="play-btn"
              onClick={handleReset}
              style={{ width: '100%' }}
            >
              🔄 Deal Next Hand
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniPoker;
