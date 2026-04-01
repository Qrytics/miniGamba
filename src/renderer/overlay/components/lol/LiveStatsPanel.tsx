/**
 * Live Game Stats Panel (Overlay)
 *
 * A compact scoreboard showing the current in-game stats (from the Live Client
 * Data API on port 2999), designed to fit inside the miniGamba overlay.
 * Auto-refreshes every 5 seconds while in a game.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StatusPill } from '../../../dashboard/components/StitchPrimitives';

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
      <div className="overlay-live-loading">
        Loading live stats...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="overlay-live-empty">
        <div className="overlay-live-empty-icon">🎮</div>
        <p>Not in a game</p>
        <p>Start a League match to see live stats.</p>
      </div>
    );
  }

  const blueTeam = data.players.filter((p) => p.team === 'ORDER');
  const redTeam = data.players.filter((p) => p.team === 'CHAOS');

  const renderTeam = (players: LivePlayer[], color: string, label: string) => (
    <section className="overlay-live-team">
      <div className="overlay-live-team-title" style={{ color }}>
        {label}
      </div>
      {players.map((p, i) => (
        <div key={i} className={`overlay-live-row ${i < players.length - 1 ? 'with-divider' : ''}`}>
          <span className="overlay-live-row-name">{p.championName || p.summonerName}</span>
          <span className="overlay-live-row-score">
            {p.kills}/{p.deaths}/{p.assists}
          </span>
        </div>
      ))}
    </section>
  );

  return (
    <div className="overlay-live-panel">
      <div className="overlay-live-header">
        <span className="overlay-live-clock">⏱ {formatTime(data.gameTime)}</span>
        {data.events && (
          <StatusPill tone="cyan">🐉 {data.events.dragonKills} • 👁️ {data.events.baronKills}</StatusPill>
        )}
      </div>

      {data.activePlayer && (
        <div className="overlay-live-player-stats">
          <StatusPill tone="neutral">Lv{data.activePlayer.level}</StatusPill>
          <StatusPill tone="gold">{Math.round(data.activePlayer.currentGold)}g</StatusPill>
          <StatusPill tone="green">
            HP {Math.round(data.activePlayer.championStats.health)}/{Math.round(data.activePlayer.championStats.maxHealth)}
          </StatusPill>
        </div>
      )}

      {renderTeam(blueTeam, '#4fc3f7', '🔵 Blue')}
      {renderTeam(redTeam, '#ef5350', '🔴 Red')}
    </div>
  );
};

export default LiveStatsPanel;
