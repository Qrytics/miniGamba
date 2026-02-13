/**
 * Idle time detection service
 * Tracks user activity and stops coin earning during idle periods
 */

// TODO: Import system idle detection library (electron-idle-time or similar)

let lastActivityTime = Date.now();
let idleThresholdMs = 5 * 60 * 1000; // 5 minutes
let checkInterval: NodeJS.Timeout | null = null;

/**
 * Start idle time tracking
 * TODO: Implement idle detection
 */
export function startIdleTracking(): void {
  console.log('Starting idle tracking...');
  
  // TODO: Set up idle time checking
  // checkInterval = setInterval(checkIdleTime, 30000); // Check every 30 seconds
  
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
  console.log('Idle tracking stopped');
}

/**
 * Check if user is idle
 * TODO: Implement idle checking
 */
function checkIdleTime(): void {
  // TODO: Get system idle time
  // TODO: Update lastActivityTime if user is active
  // TODO: Trigger onIdle if threshold exceeded
  // TODO: Trigger onActive when user returns
}

/**
 * Handle user becoming idle
 */
function onIdle(): void {
  console.log('User is now idle');
  // TODO: Pause passive coin earning
  // TODO: Notify renderer process
}

/**
 * Handle user becoming active
 */
function onActive(): void {
  console.log('User is now active');
  lastActivityTime = Date.now();
  // TODO: Resume passive coin earning
  // TODO: Notify renderer process
}

/**
 * Check if user is currently idle
 */
export function isUserIdle(): boolean {
  const idleTime = Date.now() - lastActivityTime;
  return idleTime > idleThresholdMs;
}

/**
 * Get idle time in milliseconds
 */
export function getIdleTime(): number {
  return Date.now() - lastActivityTime;
}

/**
 * Set idle threshold
 */
export function setIdleThreshold(minutes: number): void {
  idleThresholdMs = minutes * 60 * 1000;
  console.log('Idle threshold set to', minutes, 'minutes');
}
