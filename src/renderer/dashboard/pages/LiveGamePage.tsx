/**
 * Live Game Page
 *
 * Shows real-time in-game data (Live Client Data API, port 2999) when the user
 * is in an active match, and champion select information (LCU API) when they
 * are in champion select.  When neither is active, prompts the user to open LoL.
 */

import React, { useState, useEffect, useCallback } from 'react';

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

function hpColor(current: number, max: number): string {
  const pct = max > 0 ? current / max : 0;
  if (pct > 0.6) return 'var(--success)';
  if (pct > 0.3) return 'var(--warning)';
  return 'var(--danger)';
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
      <div className="card" style={{ flex: 1, borderTop: `3px solid ${color}` }}>
        <div className="card-header">
          <h3 className="card-title" style={{ color }}>{label}</h3>
        </div>
        {players.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0',
              borderBottom: i < players.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div>
              <span style={{ fontWeight: 600 }}>
                {p.championName || (p.championId ? `Champ ${p.championId}` : '—')}
              </span>
              {p.summonerName && (
                <span className="text-muted" style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                  ({p.summonerName})
                </span>
              )}
            </div>
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
              {POSITION_LABELS[p.assignedPosition] ?? p.assignedPosition}
            </span>
          </div>
        ))}
      </div>
    );

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3>Champion Select</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>{phase}</span>
            {timeLeft > 0 && (
              <span style={{ color: timeLeft < 15 ? 'var(--danger)' : 'var(--warning)', fontWeight: 700 }}>
                ⏱ {timeLeft}s
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {renderTeam(champSelect.myTeam, '🔵 Your Team', 'var(--secondary-color)')}
          {renderTeam(champSelect.theirTeam, '🔴 Enemy Team', 'var(--danger)')}
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
      <div className="card" style={{ flex: 1, borderTop: `3px solid ${color}` }}>
        <div className="card-header">
          <h3 className="card-title" style={{ color }}>{label}</h3>
        </div>
        {players.map((p, i) => {
          const kda = p.deaths === 0
            ? '∞'
            : ((p.kills + p.assists) / p.deaths).toFixed(1);
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0',
                borderBottom: i < players.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>{p.championName}</span>
                <span className="text-muted" style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                  Lv{p.level}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, minWidth: '5rem', textAlign: 'center' }}>
                  {p.kills}/{p.deaths}/{p.assists}
                </span>
                <span className="text-muted" style={{ fontSize: '0.8rem', minWidth: '3.5rem', textAlign: 'right' }}>
                  {kda} KDA
                </span>
                <span className="text-muted" style={{ fontSize: '0.8rem', minWidth: '3rem', textAlign: 'right' }}>
                  {p.scores.creepScore} CS
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );

    return (
      <div>
        {/* Game info bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div className="stat-card" style={{ flex: '0 0 auto' }}>
            <div className="stat-label">Game Time</div>
            <div className="stat-value">⏱ {formatGameTime(liveData.gameTime)}</div>
          </div>
          {liveData.events && (
            <>
              <div className="stat-card" style={{ flex: '0 0 auto' }}>
                <div className="stat-label">Dragons</div>
                <div className="stat-value">🐉 {liveData.events.dragonKills}</div>
              </div>
              <div className="stat-card" style={{ flex: '0 0 auto' }}>
                <div className="stat-label">Barons</div>
                <div className="stat-value">👁️ {liveData.events.baronKills}</div>
              </div>
              <div className="stat-card" style={{ flex: '0 0 auto' }}>
                <div className="stat-label">Turrets</div>
                <div className="stat-value">🗼 {liveData.events.turretKills}</div>
              </div>
            </>
          )}
        </div>

        {/* Active player stats */}
        {liveData.activePlayer && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-header">
              <h3 className="card-title">⚡ Your Stats</h3>
            </div>
            <div className="grid grid-4">
              <div>
                <div className="text-muted">Level</div>
                <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>{liveData.activePlayer.level}</div>
              </div>
              <div>
                <div className="text-muted">Gold</div>
                <div style={{ fontWeight: 700, color: 'var(--gold)', marginTop: '0.25rem' }}>
                  {Math.round(liveData.activePlayer.currentGold).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-muted">HP</div>
                <div style={{ fontWeight: 700, color: hpColor(liveData.activePlayer.championStats.health, liveData.activePlayer.championStats.maxHealth), marginTop: '0.25rem' }}>
                  {Math.round(liveData.activePlayer.championStats.health)}/{Math.round(liveData.activePlayer.championStats.maxHealth)}
                </div>
              </div>
              <div>
                <div className="text-muted">Mana</div>
                <div style={{ fontWeight: 700, color: 'var(--secondary-color)', marginTop: '0.25rem' }}>
                  {Math.round(liveData.activePlayer.championStats.mana)}/{Math.round(liveData.activePlayer.championStats.maxMana)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scoreboards */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {renderTeam(blueTeam, '🔵 Blue Team', 'var(--secondary-color)')}
          {renderTeam(redTeam, '🔴 Red Team', 'var(--danger)')}
        </div>
      </div>
    );
  };

  // ── Not connected ─────────────────────────────────────────────────────────
  const renderNotConnected = () => (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</div>
      <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>League Client Not Detected</p>
      <p style={{ fontSize: '0.875rem' }}>
        Open the League of Legends client and log in, then this page will automatically show your champion select and in-game stats.
      </p>
    </div>
  );

  // ── Waiting for game ──────────────────────────────────────────────────────
  const renderWaiting = () => (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
      <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>League Client Connected</p>
      <p style={{ fontSize: '0.875rem' }}>
        Waiting for champion select or a game to start...
      </p>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2>🎮 Live Game</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : ''}
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.875rem',
            }}
          >
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
          <button className="btn" onClick={refresh} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}>
            ↺ Refresh
          </button>
        </div>
      </div>

      {!lcuConnected && !inGame && renderNotConnected()}
      {lcuConnected && !inGame && !champSelect && renderWaiting()}
      {champSelect && renderChampSelect()}
      {inGame && liveData && renderLiveGame()}
    </div>
  );
};

export default LiveGamePage;
