/**
 * Live Game Page
 *
 * Shows real-time in-game data (Live Client Data API, port 2999) when the user
 * is in an active match, and champion select information (LCU API) when they
 * are in champion select.  When neither is active, prompts the user to open LoL.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { EmptyState, SectionHeader, StatusPill, SurfaceCard } from '../components/StitchPrimitives';

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
    wardScore: number;
  };
}

interface LiveGameData {
  isActive: boolean;
  gameTime: number;
  players: LivePlayer[];
  activePlayer?: {
    summonerName: string;
    currentGold: number;
    level: number;
    championStats: {
      health: number;
      maxHealth: number;
      mana: number;
      maxMana: number;
      attackDamage: number;
      abilityPower: number;
      armor: number;
    };
  };
  events?: {
    dragonKills: number;
    baronKills: number;
    turretKills: number;
  };
}

interface ChampSelectPlayer {
  summonerId: number;
  summonerName: string;
  championId: number;
  championName: string;
  assignedPosition: string;
  team: 'ally' | 'enemy';
}

interface ChampSelectSession {
  isActive: boolean;
  myTeam: ChampSelectPlayer[];
  theirTeam: ChampSelectPlayer[];
  timer: {
    phase: string;
    adjustedTimeLeftInPhase: number;
  };
}

function formatGameTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const POSITION_LABELS: Record<string, string> = {
  TOP: '⚔️ Top',
  JUNGLE: '🌿 Jungle',
  MIDDLE: '🔮 Mid',
  BOTTOM: '🏹 Bot',
  UTILITY: '🛡️ Support',
  '': '❓',
};

const LiveGamePage: React.FC = () => {
  const [lcuConnected, setLcuConnected] = useState(false);
  const [inGame, setInGame] = useState(false);
  const [liveData, setLiveData] = useState<LiveGameData | null>(null);
  const [champSelect, setChampSelect] = useState<ChampSelectSession | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      const statusRes = await window.electronAPI.lolGetStatus();
      setLcuConnected(statusRes.lcuConnected ?? false);
      setInGame(statusRes.inGame ?? false);

      if (statusRes.inGame) {
        const liveRes = await window.electronAPI.lolGetLiveGameData();
        if (liveRes.success && liveRes.data) {
          setLiveData(liveRes.data);
          setChampSelect(null);
        }
      } else if (statusRes.lcuConnected) {
        const csRes = await window.electronAPI.lolGetChampSelectSession();
        if (csRes.success && csRes.session) {
          setChampSelect(csRes.session);
          setLiveData(null);
        } else {
          setChampSelect(null);
          setLiveData(null);
        }
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to refresh live game data:', err);
    }
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  // ── Champion Select view ──────────────────────────────────────────────────
  const renderChampSelect = () => {
    if (!champSelect) return null;
    const phase = champSelect.timer.phase;
    const timeLeft = Math.ceil(champSelect.timer.adjustedTimeLeftInPhase / 1000);

    const renderTeam = (players: ChampSelectPlayer[], label: string, color: string) => (
      <SurfaceCard className="stitch-live-team-card" title={label}>
        <div className="stitch-list">
          {players.map((p, i) => (
            <div key={i} className="stitch-list-item">
              <div>
                <div className="stitch-list-item-title" style={{ color }}>
                  {p.championName || (p.championId ? `Champ ${p.championId}` : '—')}
                </div>
                <div className="stitch-list-item-meta">{p.summonerName || 'Unknown summoner'}</div>
              </div>
              <StatusPill tone="neutral">{POSITION_LABELS[p.assignedPosition] ?? p.assignedPosition}</StatusPill>
            </div>
          ))}
        </div>
      </SurfaceCard>
    );

    return (
      <div className="stitch-stack">
        <SurfaceCard title="Champion Select" subtitle={`Phase: ${phase}`}>
          <div className="stitch-inline-stats">
            <StatusPill tone="gold">{phase}</StatusPill>
            {timeLeft > 0 && <StatusPill tone={timeLeft < 15 ? 'red' : 'cyan'}>⏱ {timeLeft}s</StatusPill>}
          </div>
        </SurfaceCard>
        <div className="stitch-split-grid">
          {renderTeam(champSelect.myTeam, 'Your Team', 'var(--secondary-color)')}
          {renderTeam(champSelect.theirTeam, 'Enemy Team', 'var(--danger)')}
        </div>
      </div>
    );
  };

  // ── Live game scoreboard ──────────────────────────────────────────────────
  const renderLiveGame = () => {
    if (!liveData) return null;

    const blueTeam = liveData.players.filter((p) => p.team === 'ORDER');
    const redTeam = liveData.players.filter((p) => p.team === 'CHAOS');

    const renderTeam = (players: LivePlayer[], label: string, color: string) => (
      <SurfaceCard className="stitch-live-team-card" title={label}>
        <div className="stitch-list">
          {players.map((p, i) => {
            const kda = p.deaths === 0 ? 'Perfect' : ((p.kills + p.assists) / p.deaths).toFixed(1);
            return (
              <div key={i} className="stitch-list-item">
                <div>
                  <div className="stitch-list-item-title" style={{ color }}>{p.championName} <span className="text-muted">Lv{p.level}</span></div>
                  <div className="stitch-list-item-meta">{p.kills}/{p.deaths}/{p.assists} • {kda} KDA • {p.scores.creepScore} CS</div>
                </div>
              </div>
            );
          })}
        </div>
      </SurfaceCard>
    );

    return (
      <div className="stitch-stack">
        <div className="stitch-card-grid stats-grid">
          <SurfaceCard title="Game Time"><p className="stitch-live-kpi">⏱ {formatGameTime(liveData.gameTime)}</p></SurfaceCard>
          {liveData.events && (
            <>
              <SurfaceCard title="Dragons"><p className="stitch-live-kpi">🐉 {liveData.events.dragonKills}</p></SurfaceCard>
              <SurfaceCard title="Barons"><p className="stitch-live-kpi">👁️ {liveData.events.baronKills}</p></SurfaceCard>
              <SurfaceCard title="Turrets"><p className="stitch-live-kpi">🗼 {liveData.events.turretKills}</p></SurfaceCard>
            </>
          )}
        </div>
        {liveData.activePlayer && (
          <SurfaceCard title="Your Stats">
            <div className="stitch-card-grid stats-grid">
              <StatusPill tone="neutral">Level {liveData.activePlayer.level}</StatusPill>
              <StatusPill tone="gold">{Math.round(liveData.activePlayer.currentGold).toLocaleString()} gold</StatusPill>
              <StatusPill tone="green">
                HP {Math.round(liveData.activePlayer.championStats.health)}/{Math.round(liveData.activePlayer.championStats.maxHealth)}
              </StatusPill>
              <StatusPill tone="cyan">
                Mana {Math.round(liveData.activePlayer.championStats.mana)}/{Math.round(liveData.activePlayer.championStats.maxMana)}
              </StatusPill>
            </div>
          </SurfaceCard>
        )}
        <div className="stitch-split-grid">
          {renderTeam(blueTeam, 'Blue Team', 'var(--secondary-color)')}
          {renderTeam(redTeam, 'Red Team', 'var(--danger)')}
        </div>
      </div>
    );
  };

  // ── Not connected ─────────────────────────────────────────────────────────
  const renderNotConnected = () => (
    <EmptyState
      icon="🎮"
      title="League client not detected"
      description="Open the client and log in; this page will auto-populate champion select and in-game stats."
    />
  );

  // ── Waiting for game ──────────────────────────────────────────────────────
  const renderWaiting = () => (
    <EmptyState
      icon="✅"
      title="League client connected"
      description="Waiting for champion select or a live match to begin."
    />
  );

  return (
    <div className="dashboard-page">
      <SectionHeader
        eyebrow="Live Companion"
        title="Match telemetry"
        description="Track champion select, in-game scoreboards, and live objective pacing from the same tactical surface."
        action={
          <StatusPill tone={inGame ? 'green' : lcuConnected ? 'gold' : 'red'}>
            {inGame ? 'In Match' : lcuConnected ? 'Client Ready' : 'Client Offline'}
          </StatusPill>
        }
      />

      <SurfaceCard title="Status Feed" subtitle="Connection and refresh controls">
        <div className="stitch-inline-stats">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : ''}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: inGame ? 'var(--success)' : lcuConnected ? 'var(--warning)' : 'var(--danger)',
                display: 'inline-block',
              }}
            />
            <span className="text-muted">
              {inGame ? 'In Game' : lcuConnected ? 'Client Connected' : 'Client Offline'}
            </span>
          </div>
          <button className="btn btn-secondary" onClick={refresh} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}>
            ↺ Refresh
          </button>
        </div>
      </SurfaceCard>

      {!lcuConnected && !inGame && renderNotConnected()}
      {lcuConnected && !inGame && !champSelect && renderWaiting()}
      {champSelect && renderChampSelect()}
      {inGame && liveData && renderLiveGame()}
    </div>
  );
};

export default LiveGamePage;
