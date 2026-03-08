/**
 * Live Game Stats Panel (Overlay)
 *
 * A compact scoreboard showing the current in-game stats (from the Live Client
 * Data API on port 2999), designed to fit inside the miniGamba overlay.
 * Auto-refreshes every 5 seconds while in a game.
 */

import React, { useEffect, useState, useCallback } from 'react';

interface LivePlayer {
  summonerName: string;
  championName: string;
  team: string;
  level: number;
  kills: number;
  deaths: number;
  assists: number;
  scores: {
    creepScore: number;
  };
}

interface LiveGameData {
  isActive: boolean;
  gameTime: number;
  players: LivePlayer[];
  activePlayer?: {
    currentGold: number;
    level: number;
    championStats: {
      health: number;
      maxHealth: number;
    };
  };
  events?: {
    dragonKills: number;
    baronKills: number;
  };
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const LiveStatsPanel: React.FC = () => {
  const [data, setData] = useState<LiveGameData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await window.electronAPI.lolGetLiveGameData();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (loading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎮</div>
        <p>Not in a game</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Start a League match to see live stats.</p>
      </div>
    );
  }

  const blueTeam = data.players.filter((p) => p.team === 'ORDER');
  const redTeam = data.players.filter((p) => p.team === 'CHAOS');

  const renderTeam = (players: LivePlayer[], color: string, label: string) => (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.7rem', color, fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' }}>
        {label}
      </div>
      {players.map((p, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.2rem 0',
            borderBottom: i < players.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            fontSize: '0.75rem',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '8rem' }}>
            {p.championName || p.summonerName}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
            {p.kills}/{p.deaths}/{p.assists}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: '0.75rem' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: 700, color: 'var(--secondary-color)', fontSize: '0.875rem' }}>
          ⏱ {formatTime(data.gameTime)}
        </span>
        {data.events && (
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            🐉 {data.events.dragonKills} · 👁️ {data.events.baronKills}
          </span>
        )}
      </div>

      {/* Your stats */}
      {data.activePlayer && (
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 4,
            padding: '0.4rem 0.6rem',
            marginBottom: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
          }}
        >
          <span>Lv{data.activePlayer.level}</span>
          <span style={{ color: 'var(--gold)' }}>
            {Math.round(data.activePlayer.currentGold)}g
          </span>
          <span>
            HP {Math.round(data.activePlayer.championStats.health)}/{Math.round(data.activePlayer.championStats.maxHealth)}
          </span>
        </div>
      )}

      {renderTeam(blueTeam, '#4fc3f7', '🔵 Blue')}
      {renderTeam(redTeam, '#ef5350', '🔴 Red')}
    </div>
  );
};

export default LiveStatsPanel;
