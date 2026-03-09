import React, { useEffect, useState } from 'react';

interface HomePageProps {
  userData: any;
  onRefresh: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ userData, onRefresh }) => {
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [hourlyBonus, setHourlyBonus] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (window.electronAPI.getDailyTasks) {
        const res = await window.electronAPI.getDailyTasks();
        // IPC returns { success, tasks, progress, allCompleted }
        setDailyTasks(res?.tasks || res || []);
      }
      if (window.electronAPI.getHourlyBonus) {
        const res = await window.electronAPI.getHourlyBonus();
        // IPC now returns flat { success, canClaim, amount, timeUntilNext, progress }
        setHourlyBonus(res);
      }
      if (window.electronAPI.getGameStats) {
        const res = await window.electronAPI.getGameStats();
        // IPC returns { success, stats }
        setStats(res?.stats ?? res);
      }
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  };

  const handleClaimBonus = async () => {
    try {
      if (window.electronAPI.claimHourlyBonus) {
        await window.electronAPI.claimHourlyBonus();
        loadData();
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to claim bonus:', error);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Welcome back, {userData?.username || 'Player'}!</h2>
      
      <div className="grid grid-3">
        <div className="stat-card">
          <div className="stat-label">Total Coins</div>
          <div className="stat-value">💰 {userData?.coins?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Level</div>
          <div className="stat-value">⭐ {userData?.level || 1}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Games</div>
          <div className="stat-value">🎮 {stats?.totalGames || 0}</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⏰ Hourly Bonus</h3>
          </div>
          {hourlyBonus?.canClaim ? (
            <div>
              <p className="text-muted mb-2">Your hourly bonus is ready!</p>
              <button className="btn btn-success" onClick={handleClaimBonus}>
                Claim {hourlyBonus.amount || 50} Coins
              </button>
            </div>
          ) : (
            <div>
              <p className="text-muted">Next bonus in: {hourlyBonus?.timeUntilNext || 'Loading...'}</p>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: `${hourlyBonus?.progress || 0}%` }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Daily Tasks</h3>
          </div>
          {dailyTasks.length > 0 ? (
            <div>
              <p className="text-muted mb-2">{dailyTasks.filter(t => t.completed).length} of {dailyTasks.length} completed</p>
              {dailyTasks.slice(0, 3).map((task, idx) => (
                <div key={idx} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{task.completed ? '✅' : '⬜'}</span>
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>{task.description}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No tasks available</p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">📈 Quick Stats</h3>
        </div>
        <div className="grid grid-4">
          <div>
            <div className="text-muted">Win Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
              {stats?.winRate ? `${(stats.winRate * 100).toFixed(1)}%` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-muted">Total Wagered</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
              {stats?.totalWagered?.toLocaleString() || 0}
            </div>
          </div>
          <div>
            <div className="text-muted">Biggest Win</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--success)' }}>
              {stats?.biggestWin?.toLocaleString() || 0}
            </div>
          </div>
          <div>
            <div className="text-muted">Current Streak</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
              {stats?.currentStreak || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
