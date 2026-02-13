/**
 * Idle time detection service
 * Tracks user activity and stops coin earning during idle periods
 */

import { powerMonitor } from 'electron';

let lastActivityTime = Date.now();
let idleThresholdMs = 5 * 60 * 1000; // 5 minutes
let checkInterval: NodeJS.Timeout | null = null;
let isIdle = false;
let listeners: Array<(idle: boolean) => void> = [];

/**
 * Start idle time tracking
 */
export function startIdleTracking(): void {
  console.log('Starting idle tracking...');
  
  // Use Electron's powerMonitor to detect lock/unlock
  powerMonitor.on('lock-screen', () => {
    onIdle();
  });

  powerMonitor.on('unlock-screen', () => {
    onActive();
  });

  powerMonitor.on('suspend', () => {
    onIdle();
  });

  powerMonitor.on('resume', () => {
    onActive();
  });

  // Check idle state periodically
  checkInterval = setInterval(checkIdleTime, 30000); // Check every 30 seconds
  
  console.log('Idle tracking started');
}

/**
 * Stop idle time tracking
 */
export function stopIdleTracking(): void {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  powerMonitor.removeAllListeners('lock-screen');
  powerMonitor.removeAllListeners('unlock-screen');
  powerMonitor.removeAllListeners('suspend');
  powerMonitor.removeAllListeners('resume');
  console.log('Idle tracking stopped');
}

/**
 * Check if user is idle based on system idle time
 */
function checkIdleTime(): void {
  const systemIdleTime = powerMonitor.getSystemIdleTime() * 1000; // Convert to ms
  
  if (systemIdleTime > idleThresholdMs && !isIdle) {
    onIdle();
  } else if (systemIdleTime < idleThresholdMs && isIdle) {
    onActive();
  }
}

/**
 * Handle user becoming idle
 */
function onIdle(): void {
  if (isIdle) return;
  
  isIdle = true;
  console.log('User is now idle');
  
  // Notify listeners
  listeners.forEach(listener => listener(true));
}

/**
 * Handle user becoming active
 */
function onActive(): void {
  if (!isIdle) return;
  
  isIdle = false;
  lastActivityTime = Date.now();
  console.log('User is now active');
  
  // Notify listeners
  listeners.forEach(listener => listener(false));
}

/**
 * Check if user is currently idle
 */
export function isUserIdle(): boolean {
  return isIdle;
}

/**
 * Get idle time in milliseconds
 */
export function getIdleTime(): number {
  if (!isIdle) {
    return powerMonitor.getSystemIdleTime() * 1000;
  }
  return Date.now() - lastActivityTime;
}

/**
 * Set idle threshold
 */
export function setIdleThreshold(minutes: number): void {
  idleThresholdMs = minutes * 60 * 1000;
  console.log('Idle threshold set to', minutes, 'minutes');
}

/**
 * Add idle state change listener
 */
export function addIdleListener(listener: (idle: boolean) => void): void {
  listeners.push(listener);
}

/**
 * Remove idle state change listener
 */
export function removeIdleListener(listener: (idle: boolean) => void): void {
  listeners = listeners.filter(l => l !== listener);
}
