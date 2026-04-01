import React, { useState } from 'react';
import { PixelIcon } from '../../components/PixelIcon';
import { MetricTile, SectionHeader, StatusPill, SurfaceCard } from '../components/StitchPrimitives';

interface ProfilePageProps {
  userData: any;
  onUpdate: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userData, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(userData?.username || '');

  const handleSave = async () => {
    try {
      if (window.electronAPI.updateProfile) {
        await window.electronAPI.updateProfile({ username });
        onUpdate();
        setEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const levelProgress = userData?.xp
    ? (userData.xp / (userData.xpNeeded || 1)) * 100 
    : 0;

  return (
    <div className="dashboard-page">
      <SectionHeader
        eyebrow="Operative Profile"
        title={userData?.username || 'TacticalCommand'}
        description="Profile customization and progression now follows the Stitch command style while preserving editable account data."
        action={<StatusPill tone="gold">Level {userData?.level || 1}</StatusPill>}
      />

      <div className="stitch-profile-hero">
        <div className="stitch-profile-avatar-wrap">
          <div className="stitch-profile-avatar">{(userData?.username || 'P').slice(0, 1).toUpperCase()}</div>
          <div className="stitch-profile-rank-tag">ELITE</div>
        </div>
        <div className="stitch-profile-meta">
          <h2>{userData?.username || 'Player'}</h2>
          <div className="stitch-inline-stats">
            <StatusPill tone="cyan">{userData?.friendCode || 'No Friend Code'}</StatusPill>
            <StatusPill tone="neutral">
              Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
            </StatusPill>
          </div>
        </div>
      </div>

      <div className="stitch-split-grid">
        <SurfaceCard
          title="User Information"
          subtitle="Editable identity and account profile"
          action={
            <button className="btn btn-secondary" onClick={() => (editing ? handleSave() : setEditing(true))}>
              {editing ? 'Save' : 'Edit'}
            </button>
          }
        >
          <div className="settings-grid">
            <div className="settings-control">
              <label className="form-label">Username</label>
              {editing ? (
                <input
                  type="text"
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              ) : (
                <div className="stitch-display-value">{userData?.username || 'Player'}</div>
              )}
            </div>
            <div className="settings-control">
              <label className="form-label">Friend Code</label>
              <div className="stitch-display-value">{userData?.friendCode || 'N/A'}</div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Tactical Evolution" subtitle="Level progression and XP target tracking">
          <div className="stitch-stack">
            <div className="stitch-profile-level">
              <PixelIcon name="star" size={48} aria-hidden={true} />
              <h3>Level {userData?.level || 1}</h3>
            </div>
            <div className="stitch-level-progress">
              <div className="stitch-level-progress-header">
                <span>Current XP</span>
                <span>{Math.round(levelProgress)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.round(levelProgress)}%` }} />
              </div>
              <p className="text-muted">{userData?.xp || 0} / {userData?.xpNeeded || 100} XP</p>
            </div>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard title="Economy Overview" subtitle="Live account economy telemetry">
        <div className="stitch-card-grid stats-grid">
          <MetricTile label="Current Balance" value={(userData?.coins || 0).toLocaleString()} accent="gold" />
          <MetricTile label="Lifetime Earned" value={`+${(userData?.lifetimeEarned || 0).toLocaleString()}`} accent="green" />
          <MetricTile label="Lifetime Spent" value={`-${(userData?.lifetimeSpent || 0).toLocaleString()}`} accent="red" />
        </div>
      </SurfaceCard>

      <SurfaceCard title="Customization" subtitle="Select profile cosmetics and active title">
        <div className="stitch-settings-grid-2">
          <div className="settings-control">
            <label className="form-label">Avatar Border</label>
            <div className="stitch-pill-row">
              {['None', 'Bronze', 'Silver', 'Gold', 'Diamond'].map((border) => (
                <button
                  key={border}
                  className={`btn ${userData?.avatarBorder === border ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {border}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-control">
            <label className="form-label">Title</label>
            <select className="input" value={userData?.title || 'None'}>
              <option>None</option>
              <option>Beginner</option>
              <option>Pro Gambler</option>
              <option>High Roller</option>
              <option>Lucky</option>
            </select>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
};

export default ProfilePage;
