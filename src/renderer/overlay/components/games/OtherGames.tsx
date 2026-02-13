import React, { useState } from 'react';
import { PixelIcon } from '../../../components/PixelIcon';

interface GameProps {
  onCoinsUpdate: () => void;
}

export const ScratchCards: React.FC<GameProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);
  const [playing, setPlaying] = useState(false);

  const handlePlay = async () => {
    try {
      await window.electronAPI.startGame('scratch-cards', bet);
      const result = { 
        bet: bet,
        payout: Math.random() > 0.7 ? bet * 2 : 0,
        result: Math.random() > 0.7 ? 'win' : 'loss',
        win: Math.random() > 0.7,
      };
      await window.electronAPI.endGame('scratch-cards', result);
      onCoinsUpdate();
    } catch (error) {
      console.error('Play failed:', error);
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="ticket" size={28} aria-hidden={true} /> Scratch Cards</h2>
      </div>
      <div className="game-interface">
        <div className="game-display">
          <p className="text-muted">Choose a card tier and scratch to win!</p>
        </div>
        <div className="game-controls">
          <div className="bet-controls">
            <button className="bet-btn" onClick={() => setBet(Math.max(1, bet - 10))}>-10</button>
            <input type="number" className="bet-input" value={bet} onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
            <button className="bet-btn" onClick={() => setBet(bet + 10)}>+10</button>
          </div>
          <button className="play-btn" onClick={handlePlay} disabled={playing}>SCRATCH ({bet} coins)</button>
        </div>
      </div>
    </div>
  );
};

export const WheelOfFortune: React.FC<GameProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);

  const handleSpin = async () => {
    try {
      await window.electronAPI.startGame('wheel-of-fortune', bet);
      const payout = bet * (1 + Math.random() * 5);
      const result = { 
        bet: bet,
        payout: payout,
        result: payout > bet ? 'win' : 'loss',
        win: payout > bet,
      };
      await window.electronAPI.endGame('wheel-of-fortune', result);
      onCoinsUpdate();
    } catch (error) {
      console.error('Spin failed:', error);
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="wheel" size={28} aria-hidden={true} /> Wheel of Fortune</h2>
      </div>
      <div className="game-interface">
        <div className="game-display">
          <div style={{ width: '200px', height: '200px', borderRadius: 0, background: 'linear-gradient(45deg, #f59e0b, #ef4444, #8b5cf6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PixelIcon name="wheel" size={80} aria-hidden={true} />
          </div>
        </div>
        <div className="game-controls">
          <div className="bet-controls">
            <button className="bet-btn" onClick={() => setBet(Math.max(1, bet - 10))}>-10</button>
            <input type="number" className="bet-input" value={bet} onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
            <button className="bet-btn" onClick={() => setBet(bet + 10)}>+10</button>
          </div>
          <button className="play-btn" onClick={handleSpin}>SPIN ({bet} coins)</button>
        </div>
      </div>
    </div>
  );
};

export const MiniDerby: React.FC<GameProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);

  const handleRace = async () => {
    try {
      await window.electronAPI.startGame('mini-derby', bet);
      const payout = Math.random() > 0.75 ? bet * 3 : 0;
      const result = { 
        bet: bet,
        payout: payout,
        result: payout > 0 ? 'win' : 'loss',
        win: payout > 0,
      };
      await window.electronAPI.endGame('mini-derby', result);
      onCoinsUpdate();
    } catch (error) {
      console.error('Race failed:', error);
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="horse" size={28} aria-hidden={true} /> Mini Derby</h2>
      </div>
      <div className="game-interface">
        <div className="game-display">
          <p className="text-muted">Pick a racer and watch them compete!</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
            <PixelIcon name="horse" size={48} aria-hidden={true} />
            <PixelIcon name="horse" size={48} aria-hidden={true} />
            <PixelIcon name="horse" size={48} aria-hidden={true} />
            <PixelIcon name="horse" size={48} aria-hidden={true} />
          </div>
        </div>
        <div className="game-controls">
          <div className="bet-controls">
            <button className="bet-btn" onClick={() => setBet(Math.max(1, bet - 10))}>-10</button>
            <input type="number" className="bet-input" value={bet} onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
            <button className="bet-btn" onClick={() => setBet(bet + 10)}>+10</button>
          </div>
          <button className="play-btn" onClick={handleRace}>RACE ({bet} coins)</button>
        </div>
      </div>
    </div>
  );
};

export const DiceRoll: React.FC<GameProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);

  const handleRoll = async () => {
    try {
      await window.electronAPI.startGame('dice-roll', bet);
      const payout = Math.random() > 0.6 ? bet * 2 : 0;
      const result = { 
        bet: bet,
        payout: payout,
        result: payout > 0 ? 'win' : 'loss',
        win: payout > 0,
      };
      await window.electronAPI.endGame('dice-roll', result);
      onCoinsUpdate();
    } catch (error) {
      console.error('Roll failed:', error);
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="dice" size={28} aria-hidden={true} /> Dice Roll</h2>
      </div>
      <div className="game-interface">
        <div className="game-display">
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <PixelIcon name="dice" size={64} aria-hidden={true} />
            <PixelIcon name="dice" size={64} aria-hidden={true} />
          </div>
        </div>
        <div className="game-controls">
          <div className="bet-controls">
            <button className="bet-btn" onClick={() => setBet(Math.max(1, bet - 10))}>-10</button>
            <input type="number" className="bet-input" value={bet} onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
            <button className="bet-btn" onClick={() => setBet(bet + 10)}>+10</button>
          </div>
          <button className="play-btn" onClick={handleRoll}>ROLL ({bet} coins)</button>
        </div>
      </div>
    </div>
  );
};

export const MiniPoker: React.FC<GameProps> = ({ onCoinsUpdate }) => {
  const [bet, setBet] = useState(10);

  const handlePlay = async () => {
    try {
      await window.electronAPI.startGame('mini-poker', bet);
      const payout = Math.random() > 0.65 ? bet * 2 : 0;
      const result = { 
        bet: bet,
        payout: payout,
        result: payout > 0 ? 'win' : 'loss',
        win: payout > 0,
      };
      await window.electronAPI.endGame('mini-poker', result);
      onCoinsUpdate();
    } catch (error) {
      console.error('Play failed:', error);
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title"><PixelIcon name="spade" size={28} aria-hidden={true} /> Mini Poker</h2>
      </div>
      <div className="game-interface">
        <div className="game-display">
          <p className="text-muted">3-Card Poker - Beat the dealer!</p>
          <div className="card-display mt-2">
            <div className="playing-card">A♠</div>
            <div className="playing-card red">K♥</div>
            <div className="playing-card">Q♣</div>
          </div>
        </div>
        <div className="game-controls">
          <div className="bet-controls">
            <button className="bet-btn" onClick={() => setBet(Math.max(1, bet - 10))}>-10</button>
            <input type="number" className="bet-input" value={bet} onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
            <button className="bet-btn" onClick={() => setBet(bet + 10)}>+10</button>
          </div>
          <button className="play-btn" onClick={handlePlay}>DEAL ({bet} coins)</button>
        </div>
      </div>
    </div>
  );
};

export default ScratchCards;
