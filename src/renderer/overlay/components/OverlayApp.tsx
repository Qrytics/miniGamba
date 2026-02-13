/**
 * Main Overlay Application Component
 */

import React, { useState, useEffect } from 'react';
import SlotMachine from './games/SlotMachine';
import Blackjack from './games/Blackjack';
import CoinFlip from './games/CoinFlip';
import HigherOrLower from './games/HigherOrLower';
import MineSweeper from './games/MineSweeper';
import ScratchCards from './games/ScratchCards';
import WheelOfFortune from './games/WheelOfFortune';
import MiniDerby from './games/MiniDerby';
import DiceRoll from './games/DiceRoll';
import MiniPoker from './games/MiniPoker';
import '../styles/overlay.css';

const GAMES = [
  { id: 'slot-machine', name: 'Slots', icon: '🎰', component: SlotMachine },
  { id: 'blackjack', name: 'Blackjack', icon: '🃏', component: Blackjack },
  { id: 'coin-flip', name: 'Coin Flip', icon: '🪙', component: CoinFlip },
  { id: 'higher-or-lower', name: 'Hi/Lo', icon: '🎯', component: HigherOrLower },
  { id: 'mine-sweeper', name: 'Mines', icon: '💣', component: MineSweeper },
  { id: 'scratch-cards', name: 'Scratch', icon: '🎫', component: ScratchCards },
  { id: 'wheel-of-fortune', name: 'Wheel', icon: '🎡', component: WheelOfFortune },
  { id: 'mini-derby', name: 'Derby', icon: '🏇', component: MiniDerby },
  { id: 'dice-roll', name: 'Dice', icon: '🎲', component: DiceRoll },
  { id: 'mini-poker', name: 'Poker', icon: '♠️', component: MiniPoker },
];

const OverlayApp: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await window.electronAPI.getUserData();
      setUserData(data);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleClose = () => {
    if (window.electronAPI.closeOverlay) {
      window.electronAPI.closeOverlay();
    }
  };

  const handleMinimize = () => {
    if (window.electronAPI.minimizeOverlay) {
      window.electronAPI.minimizeOverlay();
    }
  };

  const handleOpenDashboard = () => {
    if (window.electronAPI.openDashboard) {
      window.electronAPI.openDashboard();
    }
  };

  const CurrentGameComponent = currentGame 
    ? GAMES.find(g => g.id === currentGame)?.component 
    : null;

  return (
    <div className="overlay-app">
      <div className="overlay-header">
        <div className="header-left">
          <div className="coin-display">
            💰 {userData?.coins?.toLocaleString() || 0}
          </div>
          {currentGame && (
            <button className="control-btn" onClick={() => setCurrentGame(null)}>
              ← Back
            </button>
          )}
        </div>
        <div className="header-controls">
          <button className="control-btn" onClick={handleOpenDashboard}>
            📊
          </button>
          <button className="control-btn" onClick={handleMinimize}>
            −
          </button>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>
      </div>

      <div className="overlay-content">
        {currentGame === null ? (
          <div className="game-selector">
            <h2>Select a Game</h2>
            <div className="game-grid">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  className="game-btn"
                  onClick={() => setCurrentGame(game.id)}
                >
                  <span className="game-btn-icon">{game.icon}</span>
                  <span>{game.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : CurrentGameComponent ? (
          <CurrentGameComponent onCoinsUpdate={loadUserData} />
        ) : (
          <div className="text-center">
            <p>Game not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverlayApp;
