import React, { useEffect, useState } from 'react';
import { PixelIcon } from '../../components/PixelIcon';
import { EmptyState, MetricTile, StatusPill, SurfaceCard } from '../components/StitchPrimitives';

interface HomePageProps {
  userData: {
    username?: string;
    coins?: number;
    level?: number;
    totalGamesPlayed?: number;
    xp?: number;
    xpNeeded?: number;
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
  const levelProgress = Math.min(100, Math.round(((userData?.xp || 0) / Math.max(1, userData?.xpNeeded || 100)) * 100));
  const nextLevelXp = userData?.xpNeeded || 100;

  return (
    <div className="dashboard-page">
      <div className="stitch-home-hero">
        <section className="stitch-hero-panel stitch-home-welcome">
          <div className="stitch-hero-watermark">⚔</div>
          <p className="stitch-eyebrow">Command Center</p>
          <h1 className="stitch-page-hero-title">
            Welcome back, <span>{userData?.username || 'Summoner'}</span>
          </h1>
          <p className="stitch-section-description">
            Tactical display is active. Track your economy, daily objectives, and module performance from one live control surface.
          </p>
          <div className="stitch-level-progress">
            <div className="stitch-level-progress-header">
              <span>Level {userData?.level || 1} progress</span>
              <span>{levelProgress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${levelProgress}%` }} />
            </div>
            <p className="text-muted">
              {(userData?.xp || 0).toLocaleString()} / {nextLevelXp.toLocaleString()} XP
            </p>
          </div>
        </section>

        <SurfaceCard
          className="stitch-bonus-card"
          title={hourlyBonus?.canClaim ? 'Claim Hourly Bonus' : 'Bonus Charging'}
          subtitle={hourlyBonus?.canClaim ? 'Reward ready to collect' : `Next window: ${hourlyBonus?.timeUntilNext || 'Loading...'}`}
          action={<StatusPill tone={hourlyBonus?.canClaim ? 'green' : 'gold'}>{hourlyBonus?.canClaim ? 'Ready' : 'Standby'}</StatusPill>}
        >
          <div className="stitch-stack">
            <div className="stitch-bonus-icon">
              <PixelIcon name="money" size={34} aria-hidden={true} />
            </div>
            {hourlyBonus?.canClaim ? (
              <button className="btn btn-success" onClick={handleClaimBonus}>
                Claim {hourlyBonus.amount || 50} Coins
              </button>
            ) : (
              <div className="stitch-stack">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${hourlyBonus?.progress || 0}%` }} />
                </div>
              </div>
            )}
          </div>
        </SurfaceCard>
      </div>

      <div className="stitch-snapshot-grid">
        <div className="stitch-snapshot-card">
          <div className="stitch-snapshot-icon"><PixelIcon name="money" size={22} aria-hidden={true} /></div>
          <div>
            <p>Available Gold</p>
            <h3>{(userData?.coins || 0).toLocaleString()}</h3>
          </div>
        </div>
        <div className="stitch-snapshot-card">
          <div className="stitch-snapshot-icon"><PixelIcon name="star" size={22} aria-hidden={true} /></div>
          <div>
            <p>Current Level</p>
            <h3>Lv. {userData?.level || 1}</h3>
          </div>
        </div>
        <div className="stitch-snapshot-card">
          <div className="stitch-snapshot-icon"><PixelIcon name="game" size={22} aria-hidden={true} /></div>
          <div>
            <p>Total Games</p>
            <h3>{stats?.totalGames || userData?.totalGamesPlayed || 0}</h3>
          </div>
        </div>
      </div>

      <div className="stitch-split-grid">
        <SurfaceCard
          title="Daily Tasks"
          subtitle="High-signal goals for this cycle"
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
              title="No daily tasks"
              description="Task service did not return objectives yet."
            />
          )}
        </SurfaceCard>

        <SurfaceCard title="Quick Stats" subtitle="Live tactical metrics">
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
