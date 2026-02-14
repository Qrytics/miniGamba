/**
 * System tray service - provides tray icon and menu for overlay/dashboard access
 */

import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';
import { createOverlayWindow, getOverlayWindow, toggleOverlay } from '../windows/overlay';
import { showDashboard, getDashboardWindow } from '../windows/dashboard';

let tray: Tray | null = null;

function getIconPath(): string {
  return path.join(app.getAppPath(), 'assets', 'icon.png');
}

function getTrayIcon() {
  const iconPath = getIconPath();
  const icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    // Fallback: create a simple 16x16 icon if file not found
    return nativeImage.createEmpty();
  }
  return icon.resize({ width: 16, height: 16 });
}

export function createTray(): void {
  if (tray) return;

  const icon = getTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('miniGamba');

  updateTrayContextMenu();

  tray.on('click', () => {
    const overlay = getOverlayWindow();
    if (overlay && overlay.isVisible()) {
      overlay.focus();
    } else {
      toggleOverlay();
    }
  });
}

function updateTrayContextMenu(): void {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Overlay',
      click: () => {
        const overlay = getOverlayWindow();
        if (overlay) {
          overlay.show();
          overlay.focus();
        } else {
          createOverlayWindow();
        }
      },
    },
    {
      label: 'Show Dashboard',
      click: () => showDashboard(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
}

export function getTray(): Tray | null {
  return tray;
}
