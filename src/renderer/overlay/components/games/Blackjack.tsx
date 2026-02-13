import React, { useState } from 'react';
import BlackjackEngine from '../../game-logic/blackjack';

interface BlackjackProps {
  onCoinsUpdate: () => void;
}

const Blackjack: React.FC<BlackjackProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [gameState, setGameState] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [playing, setPlaying] = useState(false);

  const engine = new BlackjackEngine();

  const handleDeal = async () => {
    try {
      await window.electronAPI.startGame('blackjack', bet);
      const state = engine.deal(bet);
      setGameState(state);
      setResult(null);
      setPlaying(true);
    } catch (error) {
      console.error('Deal failed:', error);
    }
  };

  const handleHit = () => {
    if (!gameState) return;
    const state = engine.hit();
    setGameState(state);
    
    if (state.gameOver) {
      finishGame(state);
    }
  };

  const handleStand = () => {
    if (!gameState) return;
    const state = engine.stand();
    setGameState(state);
    finishGame(state);
  };

  const finishGame = async (state: any) => {
    setPlaying(false);
    setResult(state);
    try {
      await window.electronAPI.endGame('blackjack', state);
      onCoinsUpdate();
    } catch (error) {
      console.error('Finish game failed:', error);
    }
  };

  const renderCard = (card: string, hidden = false) => {
    if (hidden) {
      return <div className="playing-card" style={{ background: '#4a5568' }}>🎴</div>;
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
        <h2 className="game-title">🃏 Blackjack</h2>
      </div>

      <div className="game-interface">
        {result && (
          <div className={`result-display ${result.win ? 'win' : 'loss'}`}>
            {result.outcome === 'win' && `🎉 You won ${result.payout} coins!`}
            {result.outcome === 'loss' && `💔 You lost ${bet} coins`}
            {result.outcome === 'push' && `🤝 Push! Bet returned`}
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
