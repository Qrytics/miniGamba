import React, { useEffect, useState } from 'react';

const GAMES = [
  { id: 'slot-machine', name: 'Slot Machine', icon: '🎰', description: '3-reel slots with hold & respin' },
  { id: 'blackjack', name: 'Blackjack', icon: '🃏', description: 'Classic 21 card game' },
  { id: 'coin-flip', name: 'Coin Flip', icon: '🪙', description: '50/50 odds with Martingale mode' },
  { id: 'higher-or-lower', name: 'Higher or Lower', icon: '🎯', description: 'Streak-based multipliers' },
  { id: 'mine-sweeper', name: 'Mine Sweeper', icon: '💣', description: '5x5 grid with progressive multipliers' },
  { id: 'scratch-cards', name: 'Scratch Cards', icon: '🎫', description: 'Match symbols to win' },
  { id: 'wheel-of-fortune', name: 'Wheel of Fortune', icon: '🎡', description: 'Spin the wheel for prizes' },
  { id: 'mini-derby', name: 'Mini Derby', icon: '🏇', description: 'Bet on racing outcomes' },
  { id: 'dice-roll', name: 'Dice Roll', icon: '🎲', description: '10 different bet types' },
  { id: 'mini-poker', name: 'Mini Poker', icon: '♠️', description: '3-card poker with dealer' },
];

const GamesPage: React.FC = () => {
  const [gameStats, setGameStats] = useState<any>({});

  useEffect(() => {
    loadGameStats();
  }, []);

  const loadGameStats = async () => {
    try {
      const stats: any = {};
      for (const game of GAMES) {
        if (window.electronAPI.getGameStats) {
          const gameStat = await window.electronAPI.getGameStats(game.id);
          stats[game.id] = gameStat;
        }
      }
      setGameStats(stats);
    } catch (error) {
      console.error('Failed to load game stats:', error);
    }
  };

  const handleLaunchGame = () => {
    if (window.electronAPI.launchOverlay) {
      window.electronAPI.launchOverlay();
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>🎮 Games</h2>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Choose from 10 unique mini-casino games. Launch the overlay to start playing!
      </p>

      <div className="grid grid-3">
        {GAMES.map((game) => {
          const stats = gameStats[game.id];
          return (
            <div key={game.id} className="game-card" onClick={handleLaunchGame}>
              <div className="game-icon">{game.icon}</div>
              <div className="game-name">{game.name}</div>
              <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {game.description}
              </p>
              {stats && (
                <div className="game-stats">
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{stats.gamesPlayed || 0}</div>
                    <div>Played</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: stats.netProfit > 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {stats.netProfit > 0 ? '+' : ''}{stats.netProfit || 0}
                    </div>
                    <div>Net</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GamesPage;
