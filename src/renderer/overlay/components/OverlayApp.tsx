/**
 * Main Overlay Application Component
 */

import React, { useState } from 'react';
// TODO: Import game components when created
// import SlotMachine from './games/SlotMachine/SlotMachine';
// import Blackjack from './games/Blackjack/Blackjack';

const OverlayApp: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [coins, setCoins] = useState<number>(1000); // TODO: Load from user data

  // TODO: Load user data on mount
  // TODO: Set up game state management

  return (
    <div className="overlay-app">
      <div className="overlay-header">
        <div className="coin-display">
          💰 {coins} coins
        </div>
        <button className="close-btn">×</button>
      </div>

      <div className="overlay-content">
        {currentGame === null ? (
          <div className="game-selector">
            <h2>Select a Game</h2>
            <div className="game-grid">
              <button onClick={() => setCurrentGame('slot-machine')}>
                🎰 Slots
              </button>
              <button onClick={() => setCurrentGame('blackjack')}>
                🃏 Blackjack
              </button>
              <button onClick={() => setCurrentGame('coin-flip')}>
                🪙 Coin Flip
              </button>
              <button onClick={() => setCurrentGame('higher-or-lower')}>
                🎯 Higher or Lower
              </button>
              {/* TODO: Add more games */}
            </div>
          </div>
        ) : (
          <div className="game-container">
            {/* TODO: Render game component based on currentGame */}
            <div className="game-placeholder">
              <h3>{currentGame}</h3>
              <p>Game component will go here</p>
              <button onClick={() => setCurrentGame(null)}>
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverlayApp;
