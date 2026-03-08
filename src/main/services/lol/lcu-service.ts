/**
 * League Client Update (LCU) API Service
 *
 * Connects to the running League of Legends client via its local REST API.
 * The LCU API is discovered by reading the lockfile written by the client on
 * startup. The lockfile format is:
 *   LeagueClient:PID:PORT:PASSWORD:PROTOCOL
 *
 * All requests use Basic auth (username "riot", password from lockfile) over
 * HTTPS with the client's self-signed certificate (rejectUnauthorized: false).
 *
 * References:
 *  - https://lytical.app/
 *  - https://github.com/dysolix/leaguetools
 */

import fs from 'fs';
import https from 'https';
import path from 'path';
import { Summoner, RankedEntry, ChampionMastery, MatchHistoryEntry, ChampSelectSession } from '../../../shared/types/lol.types';

interface LockfileData {
  port: number;
  password: string;
  protocol: string;
}

/** Candidate directories where the League lockfile may reside */
const LOCKFILE_CANDIDATES: string[] = [
  // Windows default installation paths
  'C:\\Riot Games\\League of Legends\\lockfile',
  'C:\\Program Files\\Riot Games\\League of Legends\\lockfile',
  'C:\\Program Files (x86)\\Riot Games\\League of Legends\\lockfile',
  // macOS
  '/Applications/League of Legends.app/Contents/LoL/lockfile',
  // Linux (via Lutris / Wine)
  path.join(process.env.HOME || '', '.wine/drive_c/Riot Games/League of Legends/lockfile'),
];

class LCUService {
  private lockfileData: LockfileData | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private lockfilePath: string | null = null;

  /** Start polling for the LCU lockfile */
  startPolling(intervalMs = 5000): void {
    if (this.pollInterval) return;
    this.poll();
    this.pollInterval = setInterval(() => this.poll(), intervalMs);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private poll(): void {
    const found = this.findLockfile();
    if (found) {
      this.lockfileData = found;
    } else {
      this.lockfileData = null;
    }
  }

  private findLockfile(): LockfileData | null {
    for (const candidate of LOCKFILE_CANDIDATES) {
      try {
        if (fs.existsSync(candidate)) {
          const data = fs.readFileSync(candidate, 'utf-8').trim();
          const parsed = this.parseLockfile(data);
          if (parsed) {
            this.lockfilePath = candidate;
            return parsed;
          }
        }
      } catch {
        // Ignore read errors and try next candidate
      }
    }
    return null;
  }

  private parseLockfile(content: string): LockfileData | null {
    // Format: name:pid:port:password:protocol
    const parts = content.split(':');
    if (parts.length < 5) return null;
    const port = parseInt(parts[2], 10);
    if (isNaN(port)) return null;
    return {
      port,
      password: parts[3],
      protocol: parts[4],
    };
  }

  get isConnected(): boolean {
    return this.lockfileData !== null;
  }

  get port(): number | undefined {
    return this.lockfileData?.port;
  }

  /** Make an authenticated request to the LCU API */
  private request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.lockfileData) {
        reject(new Error('League client not running'));
        return;
      }

      const { port, password } = this.lockfileData;
      const auth = Buffer.from(`riot:${password}`).toString('base64');
      const bodyStr = body ? JSON.stringify(body) : undefined;

      const options: https.RequestOptions = {
        hostname: '127.0.0.1',
        port,
        path: endpoint,
        method,
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
          ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
        },
        // The LCU API generates a per-session self-signed certificate on the local machine.
        // Certificate validation is intentionally disabled because:
        //  1. The cert is signed by a local Riot CA that is not in any public trust store.
        //  2. All connections are strictly to 127.0.0.1 (localhost); no external servers.
        //  3. This is the only supported way to use the LCU API — all Riot-approved
        //     open-source companion apps (Lytical, LoLCompanion, etc.) use this pattern.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        rejectUnauthorized: false,
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`LCU API error ${res.statusCode}: ${data}`));
              return;
            }
            resolve(data ? (JSON.parse(data) as T) : ({} as T));
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', reject);
      if (bodyStr) req.write(bodyStr);
      req.end();
    });
  }

  /** Get the currently logged-in summoner */
  async getCurrentSummoner(): Promise<Summoner> {
    const raw = await this.request<any>('GET', '/lol-summoner/v1/current-summoner');
    return this.normalizeSummoner(raw);
  }

  /** Look up a summoner by name (exact match, on the local client's region) */
  async getSummonerByName(name: string): Promise<Summoner> {
    const encoded = encodeURIComponent(name);
    const raw = await this.request<any>('GET', `/lol-summoner/v1/summoners?name=${encoded}`);
    return this.normalizeSummoner(raw);
  }

  /** Get ranked stats for a summoner by their summoner ID */
  async getRankedStats(summonerId: number): Promise<RankedEntry[]> {
    const raw = await this.request<any[]>('GET', `/lol-ranked/v1/ranked-stats/${summonerId}`);
    if (!Array.isArray(raw)) return [];
    return raw.map((entry: any) => {
      const wins = entry.wins ?? 0;
      const losses = entry.losses ?? 0;
      const total = wins + losses;
      return {
        queueType: entry.queueType ?? 'UNKNOWN',
        tier: entry.tier ?? 'UNRANKED',
        division: entry.division ?? '',
        leaguePoints: entry.leaguePoints ?? 0,
        wins,
        losses,
        winRate: total > 0 ? wins / total : 0,
        hotStreak: entry.hotStreak ?? false,
      };
    });
  }

  /** Get top champion masteries for a summoner */
  async getChampionMasteries(puuid: string, count = 10): Promise<ChampionMastery[]> {
    const raw = await this.request<any[]>('GET', `/lol-champion-mastery/v1/local-player/champion-mastery/top?count=${count}`);
    if (!Array.isArray(raw)) return [];
    return raw.map((m: any) => ({
      championId: m.championId ?? 0,
      championName: m.championName ?? String(m.championId ?? ''),
      championLevel: m.championLevel ?? 0,
      championPoints: m.championPoints ?? 0,
    }));
  }

  /** Get match history for the current summoner (recent games) */
  async getMatchHistory(puuid: string, begIndex = 0, endIndex = 19): Promise<MatchHistoryEntry[]> {
    const raw = await this.request<any>('GET', `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=${begIndex}&endIndex=${endIndex}`);
    const games = raw?.games?.games ?? [];
    return games.map((g: any) => this.normalizeMatch(g));
  }

  /** Get the current champion select session */
  async getChampSelectSession(): Promise<ChampSelectSession | null> {
    try {
      const raw = await this.request<any>('GET', '/lol-champ-select/v1/session');
      return this.normalizeChampSelect(raw);
    } catch {
      return null;
    }
  }

  // ── Normalization helpers ──────────────────────────────────────────────────

  private normalizeSummoner(raw: any): Summoner {
    const gameName = raw.gameName ?? raw.displayName ?? raw.internalName ?? '';
    const tagLine = raw.tagLine ?? '';
    const displayName = tagLine ? `${gameName}#${tagLine}` : (raw.displayName ?? gameName);
    return {
      summonerId: raw.summonerId ?? raw.id ?? 0,
      accountId: raw.accountId ?? 0,
      puuid: raw.puuid ?? '',
      gameName,
      tagLine,
      displayName,
      summonerLevel: raw.summonerLevel ?? 0,
      profileIconId: raw.profileIconId ?? 0,
    };
  }

  private normalizeMatch(g: any): MatchHistoryEntry {
    const participants: any[] = g.participants ?? [];
    const identities: any[] = g.participantIdentities ?? [];

    const mapped = participants.map((p: any) => {
      const identity = identities.find((i: any) => i.participantId === p.participantId);
      const stats = p.stats ?? {};
      return {
        summonerName: identity?.player?.summonerName ?? 'Unknown',
        championId: p.championId ?? 0,
        championName: p.championName ?? String(p.championId ?? ''),
        kills: stats.kills ?? 0,
        deaths: stats.deaths ?? 0,
        assists: stats.assists ?? 0,
        win: stats.win ?? false,
        role: p.timeline?.role ?? '',
        lane: p.timeline?.lane ?? '',
      };
    });

    return {
      gameId: g.gameId ?? 0,
      gameMode: g.gameMode ?? '',
      gameDuration: g.gameDuration ?? 0,
      gameCreation: g.gameCreation ?? 0,
      participants: mapped,
    };
  }

  private normalizeChampSelect(raw: any): ChampSelectSession {
    const myTeam: any[] = raw.myTeam ?? [];
    const theirTeam: any[] = raw.theirTeam ?? [];
    const mapSlot = (slot: any, team: 'ally' | 'enemy') => ({
      summonerId: slot.summonerId ?? 0,
      summonerName: slot.summonerName ?? '',
      championId: slot.championId ?? 0,
      championName: slot.championName ?? '',
      assignedPosition: slot.assignedPosition ?? '',
      team,
    });
    return {
      isActive: true,
      localPlayerCellId: raw.localPlayerCellId ?? 0,
      myTeam: myTeam.map((s) => mapSlot(s, 'ally')),
      theirTeam: theirTeam.map((s) => mapSlot(s, 'enemy')),
      timer: {
        phase: raw.timer?.phase ?? '',
        adjustedTimeLeftInPhase: raw.timer?.adjustedTimeLeftInPhase ?? 0,
      },
    };
  }
}

export const lcuService = new LCUService();
