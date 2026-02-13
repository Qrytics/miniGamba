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
import '../styles/dashboard.css';

type PageType = 'home' | 'games' | 'achievements' | 'stats' | 'profile' | 'settings';

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
      setUserData(data);
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

  if (loading) {
    return (
      <div className="app">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <h2>Loading miniGamba...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>🎰 miniGamba</h1>
        {userData && (
          <div className="header-user">
            <div className="coin-display">
              💰 {userData.coins?.toLocaleString() || 0}
            </div>
            <div className="level-display">
              ⭐ Level {userData.level || 1}
            </div>
          </div>
        )}
      </div>
      
      <div className="app-layout">
        <aside className="app-sidebar">
          <nav>
            <ul>
              <li>
                <button 
                  className={currentPage === 'home' ? 'active' : ''}
                  onClick={() => setCurrentPage('home')}
                >
                  🏠 Home
                </button>
              </li>
              <li>
                <button 
                  className={currentPage === 'games' ? 'active' : ''}
                  onClick={() => setCurrentPage('games')}
                >
                  🎮 Games
                </button>
              </li>
              <li>
                <button 
                  className={currentPage === 'achievements' ? 'active' : ''}
                  onClick={() => setCurrentPage('achievements')}
                >
                  🏆 Achievements
                </button>
              </li>
              <li>
                <button 
                  className={currentPage === 'stats' ? 'active' : ''}
                  onClick={() => setCurrentPage('stats')}
                >
                  📊 Stats
                </button>
              </li>
              <li>
                <button 
                  className={currentPage === 'profile' ? 'active' : ''}
                  onClick={() => setCurrentPage('profile')}
                >
                  👤 Profile
                </button>
              </li>
              <li>
                <button 
                  className={currentPage === 'settings' ? 'active' : ''}
                  onClick={() => setCurrentPage('settings')}
                >
                  ⚙️ Settings
                </button>
              </li>
              <li style={{ marginTop: '2rem' }}>
                <button onClick={handleLaunchOverlay} className="btn btn-primary" style={{ width: '100%' }}>
                  🚀 Launch Overlay
                </button>
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="app-content">
          {currentPage === 'home' && <HomePage userData={userData} onRefresh={loadUserData} />}
          {currentPage === 'games' && <GamesPage />}
          {currentPage === 'achievements' && <AchievementsPage />}
          {currentPage === 'stats' && <StatsPage />}
          {currentPage === 'profile' && <ProfilePage userData={userData} onUpdate={loadUserData} />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
