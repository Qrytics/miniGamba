import React, { useEffect, useState } from 'react';

const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      if (window.electronAPI.getGameStats) {
        const gameStats = await window.electronAPI.getGameStats();
        setStats(gameStats);
      }
      if (window.electronAPI.getGameHistory) {
        const gameHistory = await window.electronAPI.getGameHistory(10, 0);
        setHistory(gameHistory || []);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading stats...</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }} data-testid="stats-page-header">📊 Statistics</h2>

      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">Total Games</div>
          <div className="stat-value">{stats?.totalGames || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {stats?.winRate ? `${(stats.winRate * 100).toFixed(1)}%` : 'N/A'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Wagered</div>
          <div className="stat-value">💰 {stats?.totalWagered?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Profit</div>
          <div 
            className="stat-value" 
            style={{ color: (stats?.netProfit || 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}
          >
            {(stats?.netProfit || 0) >= 0 ? '+' : ''}{stats?.netProfit?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 Best Performances</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div className="text-muted">Biggest Win</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)', marginTop: '0.25rem' }}>
                +{stats?.biggestWin?.toLocaleString() || 0}
              </div>
            </div>
            <div>
              <div className="text-muted">Longest Win Streak</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                {stats?.longestWinStreak || 0} games
              </div>
            </div>
            <div>
              <div className="text-muted">Most Profitable Game</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                {stats?.mostProfitableGame || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📉 Records</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div className="text-muted">Biggest Loss</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)', marginTop: '0.25rem' }}>
                -{stats?.biggestLoss?.toLocaleString() || 0}
              </div>
            </div>
            <div>
              <div className="text-muted">Longest Loss Streak</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                {stats?.longestLossStreak || 0} games
              </div>
            </div>
            <div>
              <div className="text-muted">Total Losses</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                {stats?.totalLosses || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">🕐 Recent Games</h3>
        </div>
        {history.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Game</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Bet</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Payout</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Result</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((game: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem' }}>{game.gameType}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{game.bet}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{game.payout}</td>
                  <td 
                    style={{ 
                      padding: '0.75rem', 
                      textAlign: 'right',
                      color: game.payout > game.bet ? 'var(--success)' : 'var(--danger)',
                      fontWeight: 'bold'
                    }}
                  >
                    {game.payout > game.bet ? 'Win' : 'Loss'}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {new Date(game.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-muted" style={{ padding: '2rem' }}>
            No game history yet. Start playing to see your stats!
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
