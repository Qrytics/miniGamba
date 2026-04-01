/**
 * Summoner Lookup Page
 */

import React, { useCallback, useState } from 'react';
import { EmptyState, SectionHeader, StatusPill, SurfaceCard } from '../components/StitchPrimitives';

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
    <div className="dashboard-page">
      <SectionHeader
        eyebrow="League Intelligence"
        title="Summoner Lookup"
        description="Resolve Riot IDs into ranked status, champion mastery, and recent match telemetry through the live client APIs."
        action={<StatusPill tone="cyan">LCU Lookup</StatusPill>}
      />

      <SurfaceCard className="stitch-search-shell">
        <div className="stitch-search-row">
          <span className="stitch-search-icon" aria-hidden={true}>🔍</span>
          <input
            type="text"
            className="input stitch-search-input"
            placeholder="GameName#TAG (e.g. Faker#KR1)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
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
      </SurfaceCard>

      {loadingState === 'error' && (
        <SurfaceCard className="stitch-error-card">
          <p>❌ {error}</p>
          {error?.includes('not running') && (
            <p className="text-muted">
              Make sure the League of Legends client is open and logged in.
            </p>
          )}
        </SurfaceCard>
      )}

      {summoner && (
        <div className="stitch-stack">
          <SurfaceCard className="stitch-summoner-hero">
            <div className="stitch-summoner-avatar" aria-hidden={true}>🎮</div>
            <div>
              <h3>{summoner.displayName}</h3>
              <p className="text-muted">Riot ID: {summoner.gameName}</p>
              <p className="text-muted">Level {summoner.summonerLevel}</p>
            </div>
          </SurfaceCard>

          <div className="stitch-split-grid">
            {[soloQueue, flexQueue].map((queue, idx) => {
              const label = idx === 0 ? 'Ranked Solo / Duo' : 'Ranked Flex';
              if (!queue) {
                return (
                  <SurfaceCard key={label} title={label} subtitle="No active placement">
                    <StatusPill tone="neutral">Unranked</StatusPill>
                  </SurfaceCard>
                );
              }

              const color = TIER_COLORS[queue.tier] ?? '#aaa';
              const winRate = Math.round(queue.winRate * 100);

              return (
                <SurfaceCard key={label} title={label} subtitle={`${queue.wins}W • ${queue.losses}L`}>
                  <div className="stitch-rank-line">
                    <span style={{ color }}>{queue.tier} {queue.division}</span>
                    {queue.hotStreak && <StatusPill tone="gold">Hot Streak</StatusPill>}
                  </div>
                  <p className="text-muted">{queue.leaguePoints} LP • {winRate}% WR</p>
                </SurfaceCard>
              );
            })}
          </div>

          <SurfaceCard title="Top Champions" subtitle="Highest mastery progressions">
            {masteries.length > 0 ? (
              <div className="stitch-list">
                {masteries.slice(0, 5).map((m, i) => (
                  <div key={`${m.championId}-${i}`} className="stitch-list-item">
                    <div>
                      <div className="stitch-list-item-title">#{i + 1} {m.championName || `Champion ${m.championId}`}</div>
                      <div className="stitch-list-item-meta">Mastery {m.championLevel}</div>
                    </div>
                    <StatusPill tone="cyan">{m.championPoints.toLocaleString()} pts</StatusPill>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="🏆" title="No mastery data" description="Champion mastery results are currently unavailable." />
            )}
          </SurfaceCard>

          <SurfaceCard title="Recent Matches" subtitle="Latest outcomes from match history">
            {matches.length > 0 ? (
              <div className="stitch-list">
                {matches.map((match) => {
                  const searchNameLower = summoner.displayName.toLowerCase();
                  const gameNameLower = summoner.gameName.toLowerCase();
                  const self = match.participants.find((p) => {
                    const n = p.summonerName.toLowerCase();
                    return n === searchNameLower || n === gameNameLower || searchNameLower.startsWith(`${n}#`);
                  }) ?? match.participants[0];

                  if (!self) return null;
                  const kda = self.deaths === 0 ? 'Perfect' : ((self.kills + self.assists) / self.deaths).toFixed(2);

                  return (
                    <div key={match.gameId} className={`stitch-match-row ${self.win ? 'is-win' : 'is-loss'}`}>
                      <div>
                        <div className="stitch-list-item-title">{self.championName || `Champion ${self.championId}`}</div>
                        <div className="stitch-list-item-meta">{match.gameMode} • {formatDuration(match.gameDuration)} • {formatTimeAgo(match.gameCreation)}</div>
                      </div>
                      <div className="stitch-inline-stats">
                        <StatusPill tone={self.win ? 'green' : 'red'}>{self.win ? 'Win' : 'Loss'}</StatusPill>
                        <StatusPill tone="neutral">{self.kills}/{self.deaths}/{self.assists}</StatusPill>
                        <StatusPill tone="gold">{kda} KDA</StatusPill>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon="📜" title="No matches found" description="No recent matches were returned for this summoner." />
            )}
          </SurfaceCard>
        </div>
      )}

      {loadingState === 'idle' && (
        <EmptyState
          icon="🔍"
          title="Enter a Riot ID"
          description="Use the format GameName#TAG, and keep the League client open and logged in."
        />
      )}
    </div>
  );
};

export default SummonerPage;
