/**
 * Video watching detection service
 * Detects active video streams and rewards coins
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let monitoringInterval: NodeJS.Timeout | null = null;
let currentVideo: VideoSource | null = null;
let listeners: Array<(video: VideoSource | null) => void> = [];
let coinsEarnedToday = 0;
const dailyCoinsCap = 500;
const coinsPerMinute = 2;

export interface VideoSource {
  platform: string;
  url?: string;
  title?: string;
  active: boolean;
}

const VIDEO_PLATFORMS = [
  { name: 'YouTube', executables: ['youtube.com', 'youtu.be'], browserCheck: true },
  { name: 'Twitch', executables: ['twitch.tv'], browserCheck: true },
  { name: 'Netflix', executables: ['netflix.com'], browserCheck: true },
  { name: 'VLC', executables: ['vlc.exe', 'vlc'], browserCheck: false },
  { name: 'Media Player', executables: ['wmplayer.exe'], browserCheck: false },
];

/**
 * Start video watching detection
 */
export function startVideoTracking(): void {
  console.log('Starting video tracking...');
  
  // Check for video activity periodically
  monitoringInterval = setInterval(checkVideoActivity, 60000); // Check every minute
  
  console.log('Video tracking started');
}

/**
 * Stop video watching detection
 */
export function stopVideoTracking(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  console.log('Video tracking stopped');
}

/**
 * Check for active video watching
 */
async function checkVideoActivity(): Promise<void> {
  try {
    const videoDetected = await detectVideoPlayback();
    
    if (videoDetected && !currentVideo) {
      onVideoStarted(videoDetected);
    } else if (!videoDetected && currentVideo) {
      onVideoStopped();
    } else if (videoDetected && currentVideo) {
      // Award coins for continuous watching
      awardVideoCoins();
    }
  } catch (error) {
    console.error('Error checking video activity:', error);
  }
}

/**
 * Detect if video is being played
 */
async function detectVideoPlayback(): Promise<VideoSource | null> {
  try {
    const processes = await getRunningProcesses();
    
    // Check for standalone video players
    for (const platform of VIDEO_PLATFORMS) {
      if (platform.browserCheck) continue;
      
      for (const executable of platform.executables) {
        if (processes.some(p => p.toLowerCase().includes(executable.toLowerCase()))) {
          return {
            platform: platform.name,
            active: true,
          };
        }
      }
    }
    
    // Check for browsers (simplified - assumes video watching if browser active)
    const browsers = ['chrome.exe', 'firefox.exe', 'msedge.exe'];
    if (browsers.some(b => processes.some(p => p.toLowerCase().includes(b.toLowerCase())))) {
      return {
        platform: 'Browser',
        active: true,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting video playback:', error);
    return null;
  }
}

/**
 * Get list of running processes
 */
async function getRunningProcesses(): Promise<string[]> {
  try {
    let command: string;
    
    if (process.platform === 'win32') {
      command = 'tasklist /FO CSV /NH';
    } else if (process.platform === 'darwin') {
      command = 'ps -A -o comm=';
    } else {
      command = 'ps -eo comm';
    }
    
    const { stdout } = await execAsync(command);
    
    if (process.platform === 'win32') {
      return stdout
        .split('\n')
        .map(line => line.split(',')[0])
        .map(name => name.replace(/"/g, '').toLowerCase())
        .filter(Boolean);
    } else {
      return stdout
        .split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(Boolean);
    }
  } catch (error) {
    console.error('Error getting running processes:', error);
    return [];
  }
}

/**
 * Handle video playback started
 */
function onVideoStarted(video: VideoSource): void {
  currentVideo = video;
  console.log('Video playback detected:', video.platform);
  
  // Notify listeners
  listeners.forEach(listener => listener(video));
}

/**
 * Handle video playback stopped
 */
function onVideoStopped(): void {
  if (!currentVideo) return;
  
  console.log('Video playback stopped');
  currentVideo = null;
  
  // Notify listeners
  listeners.forEach(listener => listener(null));
}

/**
 * Award passive video coins
 */
function awardVideoCoins(): void {
  if (coinsEarnedToday >= dailyCoinsCap) {
    console.log('Daily video coins cap reached');
    return;
  }
  
  const coinsToAward = Math.min(coinsPerMinute, dailyCoinsCap - coinsEarnedToday);
  coinsEarnedToday += coinsToAward;
  
  console.log(`Awarding ${coinsToAward} video coins (${coinsEarnedToday}/${dailyCoinsCap} today)`);
  
  // TODO: Actually award coins via user-data service
}

/**
 * Reset daily coin counter
 */
export function resetDailyCoins(): void {
  coinsEarnedToday = 0;
  console.log('Daily video coin counter reset');
}

/**
 * Get current video source
 */
export function getCurrentVideo(): VideoSource | null {
  return currentVideo;
}

/**
 * Check if video is currently being watched
 */
export function isWatchingVideo(): boolean {
  return currentVideo !== null && currentVideo.active;
}

/**
 * Add video detection listener
 */
export function addVideoListener(listener: (video: VideoSource | null) => void): void {
  listeners.push(listener);
}

/**
 * Remove video detection listener
 */
export function removeVideoListener(listener: (video: VideoSource | null) => void): void {
  listeners = listeners.filter(l => l !== listener);
}
