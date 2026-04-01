import React, { useEffect, useState } from 'react';
import { PixelIcon } from '../../components/PixelIcon';
import { EmptyState, MetricTile, SectionHeader, StatusPill, SurfaceCard } from '../components/StitchPrimitives';

interface HomePageProps {
  userData: {
    username?: string;
    coins?: number;
    level?: number;
    totalGamesPlayed?: number;
  } | null;
  onRefresh: () => void;
}

interface DailyTask {
  id?: string;
  description: string;
  completed?: boolean;
  rewardCoins?: number;
  rewardXp?: number;
}

interface HourlyBonus {
  canClaim?: boolean;
  amount?: number;
  timeUntilNext?: string;
  progress?: number;
}

interface GameStats {
  totalGames?: number;
  winRate?: number;
  totalWagered?: number;
  biggestWin?: number;
  currentStreak?: number;
}

const HomePage: React.FC<HomePageProps> = ({ userData, onRefresh }) => {
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [hourlyBonus, setHourlyBonus] = useState<HourlyBonus | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      if (window.electronAPI.getDailyTasks) {
        const res = await window.electronAPI.getDailyTasks();
        setDailyTasks(res?.tasks ?? []);
      }
      if (window.electronAPI.getHourlyBonus) {
        const res = await window.electronAPI.getHourlyBonus();
        setHourlyBonus(res);
      }
      const statsRes = await window.electronAPI.getGameStats();
      setStats(statsRes?.stats ?? statsRes ?? null);
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  };

  const handleClaimBonus = async () => {
    try {
      if (window.electronAPI.claimHourlyBonus) {
        await window.electronAPI.claimHourlyBonus();
        await loadData();
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to claim bonus:', error);
    }
  };

  const completedTasks = dailyTasks.filter((task) => task.completed).length;
  const displayedWinRate = typeof stats?.winRate === 'number' ? `${stats.winRate.toFixed(1)}%` : '0.0%';

  return (
    <div className="dashboard-page">
      <div className="stitch-hero-grid">
        <section className="stitch-hero-panel">
          <SectionHeader
            eyebrow="Command Center"
            title={`Welcome back, ${userData?.username || 'Player'}`}
            description="The Stitch exports were strongest when they behaved like a tactical dashboard. This production version keeps that same command-center hierarchy, but feeds it live user, reward, and game data."
          />

          <div className="stitch-metric-grid" style={{ marginTop: '1.5rem' }}>
            <MetricTile
              label="Available Gold"
              value={<span style={{ color: 'var(--balatro-yellow)' }}>{(userData?.coins || 0).toLocaleString()}</span>}
              accent="gold"
              detail="Current spendable balance across every game."
            />
            <MetricTile
              label="Current Level"
              value={`Lv. ${userData?.level || 1}`}
              accent="cyan"
              detail="Level progression is driven by play volume and wagers."
            />
            <MetricTile
              label="Games Logged"
              value={stats?.totalGames || userData?.totalGamesPlayed || 0}
              accent="green"
              detail="All-time mini-casino sessions recorded in the history log."
            />
          </div>
        </section>

        <SurfaceCard
          title="Hourly Bonus"
          subtitle={hourlyBonus?.canClaim ? 'Reward is ready to collect' : 'Charge cycle in progress'}
          action={<StatusPill tone={hourlyBonus?.canClaim ? 'green' : 'gold'}>{hourlyBonus?.canClaim ? 'Ready' : 'Cooling Down'}</StatusPill>}
        >
          {hourlyBonus?.canClaim ? (
            <div className="stitch-stack">
              <p className="text-muted">Claim your refresh payout and top your balance back up before your next queue pops.</p>
              <button className="btn btn-success" onClick={handleClaimBonus}>
                <PixelIcon name="money" size={18} aria-hidden={true} /> Claim {hourlyBonus.amount || 50} Coins
              </button>
            </div>
          ) : (
            <div className="stitch-stack" style={{ flexDirection: 'column' }}>
              <p className="text-muted">Next bonus window: {hourlyBonus?.timeUntilNext || 'Loading...'}</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${hourlyBonus?.progress || 0}%` }} />
              </div>
            </div>
          )}
        </SurfaceCard>
      </div>

      <div className="stitch-split-grid">
        <SurfaceCard
          title="Daily Tasks"
          subtitle="High-signal goals for quick engagement"
          action={<StatusPill tone="cyan">{completedTasks}/{dailyTasks.length || 0} Complete</StatusPill>}
        >
          {dailyTasks.length > 0 ? (
            <div className="stitch-list">
              {dailyTasks.slice(0, 4).map((task, idx) => (
                <div key={task.id || idx} className="stitch-list-item">
                  <div>
                    <div className="stitch-list-item-title">{task.description}</div>
                    <div className="stitch-list-item-meta">
                      {(task.rewardXp || 0) > 0 || (task.rewardCoins || 0) > 0
                        ? `Rewards: ${task.rewardXp || 0} XP • ${task.rewardCoins || 0} coins`
                        : 'Reward metadata not provided by the task service'}
                    </div>
                  </div>
                  <StatusPill tone={task.completed ? 'green' : 'neutral'}>
                    {task.completed ? 'Done' : 'Pending'}
                  </StatusPill>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📋"
              title="No daily tasks yet"
              description="Task data will appear here as soon as the service returns today's rotation."
            />
          )}
        </SurfaceCard>

        <SurfaceCard title="Snapshot" subtitle="The most reusable Stitch pattern was the compact stat-wall">
          <div className="stitch-card-grid stats-grid">
            <MetricTile label="Win Rate" value={displayedWinRate} accent="cyan" />
            <MetricTile label="Total Wagered" value={(stats?.totalWagered || 0).toLocaleString()} accent="neutral" />
            <MetricTile label="Biggest Win" value={(stats?.biggestWin || 0).toLocaleString()} accent="green" />
            <MetricTile label="Current Streak" value={stats?.currentStreak || 0} accent="gold" />
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
};

export default HomePage;
