import React, { useState, useEffect, useRef } from 'react';
import { Blackjack as BlackjackEngine } from '../../../game-logic/blackjack';
import { PixelIcon } from '../../../../components/PixelIcon';

interface BlackjackProps {
  onCoinsUpdate: () => void;
}

const Blackjack: React.FC<BlackjackProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [gameState, setGameState] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [playing, setPlaying] = useState(false);

  const engineRef = useRef<BlackjackEngine | null>(null);

  useEffect(() => {
    const engine = new BlackjackEngine();
    engine.init();
    engineRef.current = engine;
    return () => {
      engineRef.current = null;
    };
  }, []);

  const handleDeal = async () => {
    const engine = engineRef.current;
    if (!engine) return;

    try {
      await window.electronAPI.startGame('blackjack', bet);
      engine.start(bet);
      engine.deal();
      const state = engine.getState();
      setGameState(state);
      setResult(null);
      setPlaying(true);
    } catch (error) {
      console.error('Deal failed:', error);
    }
  };

  const handleHit = () => {
    const engine = engineRef.current;
    if (!engine || !gameState) return;

    engine.hit();
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

  const finishGame = async (state: any) => {
    const engine = engineRef.current;
    if (!engine) return;

    setPlaying(false);
    const endResult = engine.end();
    const gameResult = {
      ...state,
      bet: bet, // Include bet in result
      outcome: endResult.result,
      payout: endResult.payout,
      result: endResult.result,
      win: endResult.result === 'win',
      blackjack: false,
    };
    setResult(gameResult);
    try {
      await window.electronAPI.endGame('blackjack', gameResult);
      onCoinsUpdate();
    } catch (error) {
      console.error('Finish game failed:', error);
    }
  };

  const renderCard = (card: string, hidden = false) => {
    if (hidden) {
      return <div className="playing-card" style={{ background: '#4a5568', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PixelIcon name="card-back" size={48} aria-hidden={true} /></div>;
    }
    const isRed = card.includes('♥') || card.includes('♦');
    return (
      <div className={`playing-card ${isRed ? 'red' : ''}`}>
        {card}
      </div>
    );
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="card" size={28} aria-hidden={true} /> Blackjack</h2>
      </div>

      <div className="game-interface">
        {result && (
          <div className={`result-display ${result.win ? 'win' : 'loss'}`}>
            {result.outcome === 'win' && `You won ${result.payout} coins!`}
            {result.outcome === 'loss' && `You lost ${bet} coins`}
            {result.outcome === 'push' && `Push! Bet returned`}
            {result.blackjack && ' BLACKJACK!'}
          </div>
        )}

        {gameState ? (
          <div className="game-display" style={{ flexDirection: 'column', gap: '2rem' }}>
            <div>
              <p className="text-muted text-center mb-1">Dealer ({gameState.dealerScore})</p>
              <div className="card-display">
                {gameState.dealerHand.map((card: string, idx: number) => 
                  renderCard(card, playing && idx === 1)
                )}
              </div>
            </div>

            <div>
              <p className="text-muted text-center mb-1">Your Hand ({gameState.playerScore})</p>
              <div className="card-display">
                {gameState.playerHand.map((card: string, idx: number) => 
                  <div key={idx}>{renderCard(card)}</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="game-display">
            <p className="text-muted">Place your bet and deal!</p>
          </div>
        )}

        <div className="game-controls">
          {!playing ? (
            <>
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
              <button className="play-btn" onClick={handleDeal}>
                DEAL ({bet} coins)
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="action-btn" onClick={handleHit} style={{ flex: 1 }}>
                HIT
              </button>
              <button className="action-btn" onClick={handleStand} style={{ flex: 1 }}>
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
