import React, { useEffect, useState } from 'react';
import { EmptyState, MetricTile, StatusPill, SurfaceCard } from '../components/StitchPrimitives';

const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const gameStats = await window.electronAPI.getGameStats();
      setStats(gameStats?.stats ?? gameStats ?? null);

      if (window.electronAPI.getGameHistory) {
        const gameHistory = await window.electronAPI.getGameHistory(10, 0);
        setHistory(gameHistory?.history ?? gameHistory ?? []);
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
    <div className="dashboard-page">
      <header className="stitch-page-header">
        <p className="stitch-eyebrow">Performance</p>
        <h2 className="stitch-page-title">Personal Performance</h2>
        <p className="stitch-section-description">
          Real-time tactical breakdown of your miniGamba activity and wagering trendline.
        </p>
      </header>

      <div className="stitch-metric-grid">
        <MetricTile label="Total Games" value={stats?.totalGames || 0} accent="gold" />
        <MetricTile label="Win Rate" value={`${(stats?.winRate || 0).toFixed(1)}%`} accent="green" />
        <MetricTile label="Total Wagered" value={(stats?.totalWagered || 0).toLocaleString()} accent="neutral" />
        <MetricTile
          label="Net Profit"
          value={`${(stats?.netProfit || 0) >= 0 ? '+' : ''}${(stats?.netProfit || 0).toLocaleString()}`}
          accent={(stats?.netProfit || 0) >= 0 ? 'green' : 'red'}
        />
      </div>

      <div className="stitch-split-grid">
        <SurfaceCard title="Operational Excellence" subtitle="Best performances and record highs">
          <div className="stitch-card-grid stats-grid">
            <MetricTile label="Biggest Win" value={`+${(stats?.biggestWin || 0).toLocaleString()}`} accent="green" />
            <MetricTile label="Best Streak" value={`${stats?.bestStreak || 0} games`} accent="gold" />
            <MetricTile label="Wins" value={stats?.wins || 0} accent="cyan" />
          </div>
        </SurfaceCard>

        <SurfaceCard title="Risk Report" subtitle="Downside and recovery telemetry">
          <div className="stitch-card-grid stats-grid">
            <MetricTile label="Biggest Loss" value={`${stats?.biggestLoss || 0}`} accent="red" />
            <MetricTile label="Losses" value={stats?.losses || 0} accent="neutral" />
            <MetricTile label="Current Streak" value={stats?.currentStreak || 0} accent="gold" />
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard
        title="Live Operations Log"
        subtitle="Resolved from the game history table"
        action={<StatusPill tone="cyan">{history.length} Recent Logs</StatusPill>}
      >
        {history.length > 0 ? (
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Game</th>
                  <th>Bet</th>
                  <th>Multiplier</th>
                  <th>Result</th>
                  <th>Played</th>
                </tr>
              </thead>
              <tbody>
                {history.map((game: any) => (
                  <tr key={game.id}>
                    <td>
                      <StatusPill tone={game.result === 'win' ? 'green' : game.result === 'push' ? 'gold' : 'red'}>
                        {game.result === 'win' ? 'Win' : game.result === 'push' ? 'Push' : 'Loss'}
                      </StatusPill>
                    </td>
                    <td>{game.gameType}</td>
                    <td>{game.betAmount}</td>
                    <td>{game.betAmount > 0 ? `${(game.payout / game.betAmount).toFixed(2)}x` : '0.00x'}</td>
                    <td>{(game.payout - game.betAmount) > 0 ? '+' : ''}{game.payout - game.betAmount}</td>
                    <td>{new Date(game.playedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="📈"
            title="No history yet"
            description="Start a few games in the overlay and this table will fill with real wagering records."
          />
        )}
      </SurfaceCard>
    </div>
  );
};

export default StatsPage;
