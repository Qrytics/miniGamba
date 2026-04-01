import React, { useEffect, useState } from 'react';
import { PixelIcon, type PixelIconName } from '../../components/PixelIcon';
import { FeatureCard, SectionHeader, StatusPill } from '../components/StitchPrimitives';

const GAMES: { id: string; name: string; icon: PixelIconName; description: string }[] = [
  { id: 'slot-machine', name: 'Slot Machine', icon: 'slots', description: '3-reel slots with hold & respin' },
  { id: 'blackjack', name: 'Blackjack', icon: 'card', description: 'Classic 21 card game' },
  { id: 'coin-flip', name: 'Coin Flip', icon: 'coin', description: '50/50 odds with Martingale mode' },
  { id: 'higher-or-lower', name: 'Higher or Lower', icon: 'target', description: 'Streak-based multipliers' },
  { id: 'mine-sweeper', name: 'Mine Sweeper', icon: 'mine', description: '5x5 grid with progressive multipliers' },
  { id: 'scratch-cards', name: 'Scratch Cards', icon: 'ticket', description: 'Match symbols to win' },
  { id: 'wheel-of-fortune', name: 'Wheel of Fortune', icon: 'wheel', description: 'Spin the wheel for prizes' },
  { id: 'mini-derby', name: 'Mini Derby', icon: 'horse', description: 'Bet on racing outcomes' },
  { id: 'dice-roll', name: 'Dice Roll', icon: 'dice', description: '10 different bet types' },
  { id: 'mini-poker', name: 'Mini Poker', icon: 'spade', description: '3-card poker with dealer' },
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
          stats[game.id] = gameStat?.stats ?? gameStat ?? null;
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
    <div className="dashboard-page">
      <SectionHeader
        eyebrow="Games Directory"
        title="Choose your module"
        description="High-performance technical gambling modules ready to launch in the overlay."
        action={
          <button className="btn btn-primary" onClick={handleLaunchGame}>
            <PixelIcon name="rocket" size={18} aria-hidden={true} /> Launch Overlay
          </button>
        }
      />

      <section className="stitch-featured-game">
        <div className="stitch-featured-copy">
          <p className="stitch-eyebrow">Trending Module</p>
          <h2>Gilded Fortune Slots</h2>
          <p>
            Experience the highest-volume module in the casino suite and push your net gains with rapid play rounds.
          </p>
          <button className="btn btn-primary" onClick={handleLaunchGame}>
            <PixelIcon name="slots" size={18} aria-hidden={true} /> Play in Overlay
          </button>
        </div>
      </section>

      <div className="stitch-card-grid games-grid">
        {GAMES.map((game) => {
          const stats = gameStats[game.id];
          return (
            <FeatureCard
              key={game.id}
              icon={<PixelIcon name={game.icon} size={42} aria-hidden={true} />}
              title={game.name}
              description={game.description}
              accent={game.id === 'slot-machine' ? 'gold' : game.id === 'blackjack' ? 'cyan' : 'neutral'}
              footer={
                <>
                  <StatusPill tone="neutral">{stats?.totalGames || 0} Played</StatusPill>
                  <StatusPill tone={(stats?.netProfit || 0) >= 0 ? 'green' : 'red'}>
                    {(stats?.netProfit || 0) >= 0 ? '+' : ''}{stats?.netProfit || 0} Net
                  </StatusPill>
                </>
              }
              onClick={handleLaunchGame}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GamesPage;
