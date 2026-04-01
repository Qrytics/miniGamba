/**
 * Main Overlay Application Component
 */

import React, { useEffect, useRef, useState } from 'react';
import SlotMachine from './games/SlotMachine';
import Blackjack from './games/Blackjack';
import CoinFlip from './games/CoinFlip';
import HigherOrLower from './games/HigherOrLower';
import MineSweeper from './games/MineSweeper';
import ScratchCards from './games/ScratchCards';
import WheelOfFortune from './games/WheelOfFortune';
import MiniDerby from './games/MiniDerby';
import DiceRoll from './games/DiceRoll';
import MiniPoker from './games/MiniPoker';
import LiveStatsPanel from './lol/LiveStatsPanel';
import ErrorBoundary from '../../components/ErrorBoundary';
import { PixelIcon, type PixelIconName } from '../../components/PixelIcon';
import { playClick, playReveal } from '../utils/sounds';
import '../styles/overlay.css';

type OverlayTab = 'games' | 'livestats';

const GAMES: { id: string; name: string; icon: PixelIconName; component: React.ComponentType<{ onCoinsUpdate: () => void }> }[] = [
  { id: 'slot-machine', name: 'Slots', icon: 'slots', component: SlotMachine },
  { id: 'blackjack', name: 'Blackjack', icon: 'card', component: Blackjack },
  { id: 'coin-flip', name: 'Coin Flip', icon: 'coin', component: CoinFlip },
  { id: 'higher-or-lower', name: 'Hi/Lo', icon: 'target', component: HigherOrLower },
  { id: 'mine-sweeper', name: 'Mines', icon: 'mine', component: MineSweeper },
  { id: 'scratch-cards', name: 'Scratch', icon: 'ticket', component: ScratchCards },
  { id: 'wheel-of-fortune', name: 'Wheel', icon: 'wheel', component: WheelOfFortune },
  { id: 'mini-derby', name: 'Derby', icon: 'horse', component: MiniDerby },
  { id: 'dice-roll', name: 'Dice', icon: 'dice', component: DiceRoll },
  { id: 'mini-poker', name: 'Poker', icon: 'spade', component: MiniPoker },
];

const OverlayApp: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OverlayTab>('games');
  const [userData, setUserData] = useState<any>(null);
  const [contentScale, setContentScale] = useState(1);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const fitContentRef = useRef<HTMLDivElement | null>(null);
  const lastUiSoundRef = useRef(0);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    // Add lightweight click SFX for almost all UI controls in the overlay.
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const isActionable = target.closest('button, [role="button"], input[type="range"], input[type="checkbox"], select');
      if (!isActionable) return;
      const now = performance.now();
      if (now - lastUiSoundRef.current < 50) return;
      lastUiSoundRef.current = now;
      playClick();
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const fitContent = fitContentRef.current;
    if (!viewport || !fitContent) return;

    let frameId = 0;
    const recalculateScale = () => {
      const viewportWidth = Math.max(viewport.clientWidth, 1);
      const viewportHeight = Math.max(viewport.clientHeight, 1);
      const naturalWidth = Math.max(fitContent.scrollWidth, fitContent.offsetWidth, 1);
      const naturalHeight = Math.max(fitContent.scrollHeight, fitContent.offsetHeight, 1);
      const nextScale = Math.min(viewportWidth / naturalWidth, viewportHeight / naturalHeight, 1);

      setContentScale((prev) => (Math.abs(prev - nextScale) < 0.01 ? prev : nextScale));
      setContentSize((prev) =>
        prev.width === naturalWidth && prev.height === naturalHeight
          ? prev
          : { width: naturalWidth, height: naturalHeight },
      );
    };

    const scheduleRecalculate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(recalculateScale);
    };

    const resizeObserver = new ResizeObserver(scheduleRecalculate);
    resizeObserver.observe(viewport);
    resizeObserver.observe(fitContent);
    window.addEventListener('resize', scheduleRecalculate);
    scheduleRecalculate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleRecalculate);
    };
  }, [activeTab, currentGame, userData?.coins]);

  const loadUserData = async () => {
    try {
      const data = await window.electronAPI.getUserData();
      // IPC returns { success, user } – unwrap user object
      setUserData(data?.user ?? data);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleClose = () => {
    playReveal();
    if (window.electronAPI.closeOverlay) {
      window.electronAPI.closeOverlay();
    }
  };

  const handleMinimize = () => {
    playReveal();
    if (window.electronAPI.minimizeOverlay) {
      window.electronAPI.minimizeOverlay();
    }
  };

  const handleOpenDashboard = () => {
    playClick();
    if (window.electronAPI.openDashboard) {
      window.electronAPI.openDashboard();
    }
  };

  const CurrentGameComponent = currentGame 
    ? GAMES.find(g => g.id === currentGame)?.component 
    : null;

  return (
    <div className="overlay-app">
      <div className="overlay-header">
        <div className="header-left">
          <div className="overlay-brand">miniGamba</div>
          <div className="coin-display" data-testid="overlay-coin-display">
            <PixelIcon name="money" size={20} aria-hidden={true} />
            <span>{userData?.coins?.toLocaleString() || 0}</span>
          </div>
          {activeTab === 'games' && currentGame && (
            <button className="control-btn" onClick={() => { playClick(); setCurrentGame(null); }} data-testid="overlay-back-btn">
              ← Back
            </button>
          )}
        </div>
        <div className="header-controls">
          <button
            className={`control-btn${activeTab === 'games' ? ' active' : ''}`}
            onClick={() => { playClick(); setActiveTab('games'); setCurrentGame(null); }}
            title="Mini-Games"
            data-testid="overlay-tab-games"
          >
            🎰
          </button>
          <button
            className={`control-btn${activeTab === 'livestats' ? ' active' : ''}`}
            onClick={() => { playClick(); setActiveTab('livestats'); setCurrentGame(null); }}
            title="Live Game Stats"
            data-testid="overlay-tab-livestats"
          >
            🎮
          </button>
          <button className="control-btn" onClick={handleOpenDashboard} title="Dashboard" data-testid="overlay-nav-dashboard">
            <PixelIcon name="chart" size={18} aria-hidden={true} />
          </button>
        </div>
        <div className="window-controls">
          <button className="control-btn" onClick={handleMinimize} data-testid="overlay-minimize-btn">
            −
          </button>
          <button className="close-btn" onClick={handleClose} data-testid="overlay-close-btn">
            ×
          </button>
        </div>
      </div>

      <div className="overlay-content">
        <div className="overlay-fit-viewport" ref={viewportRef}>
          <div
            className="overlay-fit-shell"
            style={{
              width: contentSize.width > 0 ? `${contentSize.width * contentScale}px` : '100%',
              height: contentSize.height > 0 ? `${contentSize.height * contentScale}px` : '100%',
            }}
          >
            <div
              className="overlay-fit-content"
              ref={fitContentRef}
              style={{
                transform: `scale(${contentScale})`,
                width: contentSize.width > 0 ? `${contentSize.width}px` : '100%',
              }}
            >
              {/* Live Stats Tab */}
              {activeTab === 'livestats' && (
                <ErrorBoundary>
                  <LiveStatsPanel />
                </ErrorBoundary>
              )}

              {/* Games Tab */}
              {activeTab === 'games' && (
                currentGame === null ? (
                  <div className="game-selector">
                    <div className="overlay-selector-hero">
                      <p className="overlay-selector-eyebrow">Mini-Casino Modules</p>
                      <h2>Game Picker</h2>
                      <p className="text-muted">
                        Pick a module below to open it in the live overlay shell.
                      </p>
                    </div>
                    <div className="game-grid">
                      {GAMES.map((game) => (
                        <button
                          key={game.id}
                          className="game-btn"
                          onClick={() => {
                            playClick();
                            setCurrentGame(game.id);
                          }}
                          data-testid={`game-btn-${game.id}`}
                        >
                          <span className="game-btn-icon">
                            <PixelIcon name={game.icon} size={32} aria-hidden={true} />
                          </span>
                          <span>{game.name}</span>
                        </button>
                      ))}
                    </div>
                    <footer className="overlay-footer-meta">
                      <span>Command Center / Games</span>
                      <span className="overlay-online-pill">Online</span>
                    </footer>
                  </div>
                ) : CurrentGameComponent ? (
                  <ErrorBoundary key={currentGame}>
                    <CurrentGameComponent onCoinsUpdate={loadUserData} />
                  </ErrorBoundary>
                ) : (
                  <div className="text-center">
                    <p>Game not found</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverlayApp;
