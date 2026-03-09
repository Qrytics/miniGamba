/**
 * Summoner Lookup Page
 *
 * Allows the user to search for any League of Legends summoner by name and
 * view their profile: rank, champion masteries, and recent match history.
 * Connects via the LCU API (requires the LoL client to be running).
 */

import React, { useState, useCallback } from 'react';

interface RankedEntry {
  queueType: string;
  tier: string;
  division: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: number;
  hotStreak: boolean;
}

interface ChampionMastery {
  championId: number;
  championName: string;
  championLevel: number;
  championPoints: number;
}

interface MatchParticipant {
  summonerName: string;
  championId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  role: string;
  lane: string;
}

interface MatchEntry {
  gameId: number;
  gameMode: string;
  gameDuration: number;
  gameCreation: number;
  participants: MatchParticipant[];
}

interface SummonerData {
  summonerId: number;
  puuid: string;
  gameName: string;
  displayName: string;
  summonerLevel: number;
  profileIconId: number;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

const TIER_COLORS: Record<string, string> = {
  IRON: '#8b8b8b',
  BRONZE: '#cd7f32',
  SILVER: '#a8a9ad',
  GOLD: '#ffd700',
  PLATINUM: '#00e5c8',
  EMERALD: '#00c853',
  DIAMOND: '#b9f2ff',
  MASTER: '#9c27b0',
  GRANDMASTER: '#ff4444',
  CHALLENGER: '#00bcd4',
  UNRANKED: '#666',
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const SummonerPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [summoner, setSummoner] = useState<SummonerData | null>(null);
  const [rankedEntries, setRankedEntries] = useState<RankedEntry[]>([]);
  const [masteries, setMasteries] = useState<ChampionMastery[]>([]);
  const [matches, setMatches] = useState<MatchEntry[]>([]);

  const handleSearch = useCallback(async () => {
    const name = searchInput.trim();
    if (!name) return;

    setLoadingState('loading');
    setError(null);
    setSummoner(null);
    setRankedEntries([]);
    setMasteries([]);
    setMatches([]);

    try {
      // 1. Look up summoner
      const summonerRes = await window.electronAPI.lolGetSummonerByName(name);
      if (!summonerRes.success) {
        throw new Error(summonerRes.error ?? 'Summoner not found');
      }
      const s: SummonerData = summonerRes.summoner;
      setSummoner(s);

      // 2. Load ranked stats, masteries, and match history in parallel
      const [rankedRes, masteryRes, matchRes] = await Promise.allSettled([
        window.electronAPI.lolGetRankedStats(s.summonerId),
        window.electronAPI.lolGetChampionMasteries(s.puuid),
        window.electronAPI.lolGetMatchHistory(s.puuid, 0, 9),
      ]);

      if (rankedRes.status === 'fulfilled' && rankedRes.value.success) {
        setRankedEntries(rankedRes.value.ranked ?? []);
      }
      if (masteryRes.status === 'fulfilled' && masteryRes.value.success) {
        setMasteries(masteryRes.value.masteries ?? []);
      }
      if (matchRes.status === 'fulfilled' && matchRes.value.success) {
        setMatches(matchRes.value.matches ?? []);
      }

      setLoadingState('success');
    } catch (err: any) {
      setError(err.message ?? 'An error occurred');
      setLoadingState('error');
    }
  }, [searchInput]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const soloQueue = rankedEntries.find((r) => r.queueType === 'RANKED_SOLO_5x5');
  const flexQueue = rankedEntries.find((r) => r.queueType === 'RANKED_FLEX_SR');

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>🔍 Summoner Lookup</h2>
      <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
        Look up any summoner&apos;s profile, rank, and match history via the League Client.{' '}
        <strong style={{ color: 'var(--secondary-color)' }}>
          Enter the Riot ID including the hashtag — e.g. <em>YourName#NA1</em>
        </strong>. Requires the LoL client to be open and logged in.
      </p>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="GameName#TAG (e.g. Faker#KR1)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--balatro-radius)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontFamily: 'inherit',
          }}
          maxLength={64}
          aria-label="Riot ID (GameName#TAG)"
        />
        <button
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={loadingState === 'loading' || !searchInput.trim()}
        >
          {loadingState === 'loading' ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Error state */}
      {loadingState === 'error' && (
        <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--danger)' }}>
            ❌ {error}
          </p>
          {error?.includes('not running') && (
            <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Make sure the League of Legends client is open and you are logged in.
            </p>
          )}
        </div>
      )}

      {/* Summoner profile */}
      {summoner && (
        <div>
          {/* Header */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'var(--surface-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  border: '2px solid var(--primary-color)',
                  flexShrink: 0,
                }}
              >
                🎮
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{summoner.displayName}</h3>
                <p className="text-muted">Level {summoner.summonerLevel}</p>
              </div>
            </div>
          </div>

          {/* Ranked stats */}
          <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
            {[soloQueue, flexQueue].map((queue, idx) => {
              const label = idx === 0 ? 'Solo / Duo' : 'Flex 5v5';
              if (!queue) {
                return (
                  <div className="card" key={idx}>
                    <div className="card-header">
                      <h3 className="card-title">Ranked {label}</h3>
                    </div>
                    <p className="text-muted">Unranked</p>
                  </div>
                );
              }
              const color = TIER_COLORS[queue.tier] ?? '#aaa';
              const winRate = Math.round(queue.winRate * 100);
              return (
                <div className="card" key={idx}>
                  <div className="card-header">
                    <h3 className="card-title">Ranked {label}</h3>
                  </div>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color, marginBottom: '0.5rem' }}>
                    {queue.tier} {queue.division}
                    {queue.hotStreak && ' 🔥'}
                  </p>
                  <p style={{ color, marginBottom: '0.25rem' }}>{queue.leaguePoints} LP</p>
                  <p className="text-muted">
                    {queue.wins}W / {queue.losses}L &nbsp;·&nbsp;
                    <span style={{ color: winRate >= 50 ? 'var(--success)' : 'var(--danger)' }}>
                      {winRate}% WR
                    </span>
                  </p>
                </div>
              );
            })}
          </div>

          {/* Champion masteries */}
          {masteries.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h3 className="card-title">🏆 Top Champions</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {masteries.slice(0, 5).map((m, i) => (
                  <div
                    key={i}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--gold)', minWidth: '1.25rem' }}>#{i + 1}</span>
                      <span>{m.championName || `Champion ${m.championId}`}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                        M{m.championLevel}
                      </span>
                      <span style={{ color: 'var(--secondary-color)', fontWeight: 600 }}>
                        {m.championPoints.toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match history */}
          {matches.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📜 Recent Matches</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {matches.map((match) => {
                  // Find the searched summoner's participant by matching against gameName,
                  // the full Riot ID (gameName#tagLine), or legacy summoner name.
                  const searchNameLower = summoner.displayName.toLowerCase();
                  const gameNameLower = summoner.gameName.toLowerCase();
                  const self = match.participants.find(
                    (p) => {
                      const n = p.summonerName.toLowerCase();
                      return n === searchNameLower || n === gameNameLower || searchNameLower.startsWith(n + '#');
                    }
                  ) ?? match.participants[0];

                  if (!self) return null;

                  const kda = self.deaths === 0
                    ? 'Perfect'
                    : ((self.kills + self.assists) / self.deaths).toFixed(2);

                  return (
                    <div
                      key={match.gameId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: self.win ? 'rgba(0, 200, 83, 0.08)' : 'rgba(255, 68, 68, 0.08)',
                        borderRadius: 'var(--balatro-radius)',
                        borderLeft: `3px solid ${self.win ? 'var(--success)' : 'var(--danger)'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 700, color: self.win ? 'var(--success)' : 'var(--danger)', minWidth: '2.5rem' }}>
                          {self.win ? 'WIN' : 'LOSS'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{self.championName || `Champion ${self.championId}`}</div>
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>{match.gameMode}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700 }}>
                          {self.kills}/{self.deaths}/{self.assists}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{kda} KDA</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {formatDuration(match.gameDuration)}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {formatTimeAgo(match.gameCreation)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Idle state */}
      {loadingState === 'idle' && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p>Enter a Riot ID to look up a summoner&apos;s profile.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Format: <strong style={{ color: 'var(--secondary-color)' }}>GameName#TAG</strong> — e.g.{' '}
            <em>Faker#KR1</em>
          </p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            ⚠️ League of Legends client must be open and logged in.
          </p>
        </div>
      )}
    </div>
  );
};

export default SummonerPage;
