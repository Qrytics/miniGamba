/**
 * Live Client Data API Service
 *
 * Connects to the League of Legends Live Client Data API running on
 * https://127.0.0.1:2999 during an active match. This API is provided
 * officially by Riot Games for third-party developers.
 *
 * Reference: https://developer.riotgames.com/docs/lol#league-client-api
 */

import https from 'https';
import { LiveGameData, LiveGamePlayer } from '../../../shared/types/lol.types';

const LIVE_CLIENT_PORT = 2999;
const LIVE_CLIENT_HOST = '127.0.0.1';

/** Make a request to the Live Client Data API */
function liveClientRequest<T>(endpoint: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: LIVE_CLIENT_HOST,
      port: LIVE_CLIENT_PORT,
      path: endpoint,
      method: 'GET',
      // The Live Client Data API serves from a locally-generated self-signed certificate.
      // Certificate validation is intentionally disabled because:
      //  1. The cert is signed by a local Riot CA not present in any public trust store.
      //  2. All connections are strictly to 127.0.0.1 (localhost); no external servers.
      //  3. This is the only supported way to use this API per Riot's developer docs.
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rejectUnauthorized: false,
      timeout: 3000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data) as T);
        } catch (err) {
          reject(new Error(`Failed to parse live client response: ${err}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Live client request timed out'));
    });
    req.end();
  });
}

class LiveClientService {
  private _isActive = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastData: LiveGameData | null = null;

  get isActive(): boolean {
    return this._isActive;
  }

  /** Start polling the Live Client API to detect game state */
  startPolling(intervalMs = 3000): void {
    if (this.pollInterval) return;
    this.poll();
    this.pollInterval = setInterval(() => this.poll(), intervalMs);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this._isActive = false;
    this.lastData = null;
  }

  private async poll(): Promise<void> {
    try {
      const data = await this.getAllGameData();
      this._isActive = true;
      this.lastData = data;
    } catch {
      this._isActive = false;
      this.lastData = null;
    }
  }

  /** Fetch all game data from port 2999 */
  async getAllGameData(): Promise<LiveGameData> {
    const raw = await liveClientRequest<any>('/liveclientdata/allgamedata');
    return this.normalize(raw);
  }

  /** Get the cached game data (populated by polling) */
  getCachedData(): LiveGameData | null {
    return this.lastData;
  }

  private normalize(raw: any): LiveGameData {
    const players: any[] = raw.allPlayers ?? [];
    const gameData: any = raw.gameData ?? {};
    const activePlayer: any = raw.activePlayer ?? null;
    const events: any[] = raw.events?.Events ?? [];

    const normalizedPlayers: LiveGamePlayer[] = players.map((p) => ({
      summonerName: p.summonerName ?? '',
      championName: p.championName ?? '',
      team: p.team ?? 'ORDER',
      position: p.position ?? '',
      level: p.level ?? 1,
      kills: p.scores?.kills ?? 0,
      deaths: p.scores?.deaths ?? 0,
      assists: p.scores?.assists ?? 0,
      goldEarned: p.scores?.goldEarned ?? 0,
      items: (p.items ?? []).map((i: any) => i.itemID ?? 0),
      scores: {
        assists: p.scores?.assists ?? 0,
        creepScore: p.scores?.creepScore ?? 0,
        deaths: p.scores?.deaths ?? 0,
        kills: p.scores?.kills ?? 0,
        wardScore: p.scores?.wardScore ?? 0,
      },
    }));

    // Count objectives from events
    const dragonKills = events.filter((e) => e.EventName === 'DragonKill').length;
    const baronKills = events.filter((e) => e.EventName === 'BaronKill').length;
    const turretKills = events.filter((e) => e.EventName === 'TurretKilled').length;

    const normalizedActivePlayer = activePlayer
      ? {
          summonerName: activePlayer.summonerName ?? '',
          championStats: {
            abilityPower: activePlayer.championStats?.abilityPower ?? 0,
            armor: activePlayer.championStats?.armor ?? 0,
            attackDamage: activePlayer.championStats?.attackDamage ?? 0,
            health: activePlayer.championStats?.currentHealth ?? 0,
            maxHealth: activePlayer.championStats?.maxHealth ?? 0,
            mana: activePlayer.championStats?.resourceValue ?? 0,
            maxMana: activePlayer.championStats?.resourceMax ?? 0,
          },
          currentGold: activePlayer.currentGold ?? 0,
          level: activePlayer.level ?? 1,
        }
      : undefined;

    return {
      isActive: true,
      gameTime: gameData.gameTime ?? 0,
      players: normalizedPlayers,
      activePlayer: normalizedActivePlayer,
      events: { dragonKills, baronKills, turretKills },
    };
  }
}

export const liveClientService = new LiveClientService();
