/**
 * Hotkey management utility
 * TODO: Implement global hotkey registration
 */

// TODO: Import electron globalShortcut

type HotkeyCallback = () => void;

const registeredHotkeys = new Map<string, HotkeyCallback>();

/**
 * Register a global hotkey
 * TODO: Implement with electron's globalShortcut
 */
export function registerHotkey(accelerator: string, callback: HotkeyCallback): boolean {
  // TODO: Use electron.globalShortcut.register
  console.log('Registering hotkey:', accelerator);
  registeredHotkeys.set(accelerator, callback);
  return true;
}

/**
 * Unregister a hotkey
 * TODO: Implement with electron's globalShortcut
 */
export function unregisterHotkey(accelerator: string): void {
  // TODO: Use electron.globalShortcut.unregister
  console.log('Unregistering hotkey:', accelerator);
  registeredHotkeys.delete(accelerator);
}

/**
 * Unregister all hotkeys
 * TODO: Implement
 */
export function unregisterAllHotkeys(): void {
  // TODO: Use electron.globalShortcut.unregisterAll
  console.log('Unregistering all hotkeys');
  registeredHotkeys.clear();
}

/**
 * Check if hotkey is available
 * TODO: Implement
 */
export function isHotkeyAvailable(accelerator: string): boolean {
  // TODO: Check if hotkey is already registered
  return !registeredHotkeys.has(accelerator);
}
