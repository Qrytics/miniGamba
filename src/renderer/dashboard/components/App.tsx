/**
 * Main Dashboard Application Component
 */

import React, { useState, useEffect } from 'react';
import HomePage from '../pages/HomePage';
import GamesPage from '../pages/GamesPage';
import AchievementsPage from '../pages/AchievementsPage';
import StatsPage from '../pages/StatsPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import SummonerPage from '../pages/SummonerPage';
import LiveGamePage from '../pages/LiveGamePage';
import ErrorBoundary from '../../components/ErrorBoundary';
import { PixelIcon } from '../../components/PixelIcon';
import '../styles/dashboard.css';

type PageType = 'home' | 'summoner' | 'livegame' | 'games' | 'achievements' | 'stats' | 'profile' | 'settings';
type NavItem = {
  id: PageType;
  label: string;
  icon: React.ReactNode;
  section: 'core' | 'league' | 'casino' | 'account';
};

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: <PixelIcon name="home" size={18} aria-hidden={true} />, section: 'core' },
  { id: 'summoner', label: 'Summoner', icon: <span aria-hidden={true}>🔎</span>, section: 'league' },
  { id: 'livegame', label: 'Live Game', icon: <span aria-hidden={true}>🎮</span>, section: 'league' },
  { id: 'games', label: 'Casino', icon: <PixelIcon name="game" size={18} aria-hidden={true} />, section: 'casino' },
  { id: 'achievements', label: 'Achievements', icon: <PixelIcon name="trophy" size={18} aria-hidden={true} />, section: 'casino' },
  { id: 'stats', label: 'Stats', icon: <PixelIcon name="chart" size={18} aria-hidden={true} />, section: 'casino' },
  { id: 'profile', label: 'Profile', icon: <PixelIcon name="user" size={18} aria-hidden={true} />, section: 'account' },
  { id: 'settings', label: 'Settings', icon: <PixelIcon name="settings" size={18} aria-hidden={true} />, section: 'account' },
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await window.electronAPI.getUserData();
      // IPC returns { success, user } – unwrap user object
      setUserData(data?.user ?? data);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchOverlay = () => {
    if (window.electronAPI.launchOverlay) {
      window.electronAPI.launchOverlay();
    }
  };

  const renderNavSection = (title: string, section: NavItem['section']) => (
    <li key={section}>
      <p className="shell-nav-section">{title}</p>
      <div className="shell-nav-group">
        {NAV_ITEMS.filter((item) => item.section === section).map((item) => (
          <button
            key={item.id}
            className={`shell-nav-btn ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
            data-testid={`${item.id}-btn`}
          >
            <span className="shell-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </li>
  );

  if (loading) {
    return (
      <div className="app app-shell">
        <div className="shell-loading">
          <h2>Loading miniGamba...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app app-shell">
      <header className="app-header shell-topbar">
        <div className="shell-brand-wrap">
          <h1 className="shell-brand">
            <PixelIcon name="slots" size={26} aria-hidden={true} /> miniGamba
          </h1>
          <div className="shell-search">
            <span aria-hidden={true}>🔍</span>
            <input type="text" placeholder="Search summoners or modules..." aria-label="Search" />
          </div>
        </div>
        <div className="header-user">
          <div className="coin-display">
            <PixelIcon name="money" size={20} aria-hidden={true} />
            <span>{userData?.coins?.toLocaleString() || 0}</span>
          </div>
          <div className="level-display">
            <PixelIcon name="star" size={18} aria-hidden={true} />
            <span>Lv. {userData?.level || 1}</span>
          </div>
          <button onClick={handleLaunchOverlay} className="btn btn-primary shell-launch-btn">
            <PixelIcon name="rocket" size={16} aria-hidden={true} /> Launch Overlay
          </button>
          <div className="shell-avatar" title={userData?.username || 'Player'}>
            {(userData?.username || 'P').slice(0, 1).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="app-layout shell-layout">
        <aside className="app-sidebar shell-sidebar">
          <div className="shell-user-card">
            <div className="shell-user-icon">
              <PixelIcon name="crown" size={20} aria-hidden={true} />
            </div>
            <div>
              <p className="shell-user-name">{userData?.username || 'Summoner'}</p>
              <p className="shell-user-rank">Level {userData?.level || 1} Command Center</p>
            </div>
          </div>
          <nav>
            <ul>
              {renderNavSection('Overview', 'core')}
              {renderNavSection('League of Legends', 'league')}
              {renderNavSection('Mini-Casino', 'casino')}
              {renderNavSection('Account', 'account')}
            </ul>
          </nav>
        </aside>

        <main className="app-content shell-content">
          <ErrorBoundary>
            {currentPage === 'home' && <HomePage userData={userData} onRefresh={loadUserData} />}
            {currentPage === 'summoner' && <SummonerPage />}
            {currentPage === 'livegame' && <LiveGamePage />}
            {currentPage === 'games' && <GamesPage />}
            {currentPage === 'achievements' && <AchievementsPage />}
            {currentPage === 'stats' && <StatsPage />}
            {currentPage === 'profile' && <ProfilePage userData={userData} onUpdate={loadUserData} />}
            {currentPage === 'settings' && <SettingsPage />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default App;
