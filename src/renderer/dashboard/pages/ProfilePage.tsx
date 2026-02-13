import React, { useState } from 'react';

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
    <div>
      <h2 style={{ marginBottom: '2rem' }}>👤 Profile</h2>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">User Information</h3>
            <button 
              className="btn btn-secondary"
              onClick={() => editing ? handleSave() : setEditing(true)}
            >
              {editing ? '💾 Save' : '✏️ Edit'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              {editing ? (
                <input 
                  type="text" 
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              ) : (
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                  {userData?.username || 'Player'}
                </div>
              )}
            </div>
            <div>
              <label className="form-label">Friend Code</label>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {userData?.friendCode || 'N/A'}
              </div>
            </div>
            <div>
              <label className="form-label">Member Since</label>
              <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Level & Progress</h3>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⭐</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Level {userData?.level || 1}
            </div>
            <div className="progress-bar" style={{ height: '1rem', marginTop: '1rem' }}>
              <div 
                className="progress-fill" 
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
            <div className="text-muted mt-2">
              {userData?.xp || 0} / {userData?.xpNeeded || 100} XP
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">💰 Economy Overview</h3>
        </div>
        <div className="grid grid-3">
          <div>
            <div className="text-muted">Current Balance</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
              💰 {userData?.coins?.toLocaleString() || 0}
            </div>
          </div>
          <div>
            <div className="text-muted">Lifetime Earned</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--success)' }}>
              +{userData?.lifetimeEarned?.toLocaleString() || 0}
            </div>
          </div>
          <div>
            <div className="text-muted">Lifetime Spent</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--danger)' }}>
              -{userData?.lifetimeSpent?.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">🎨 Customization</h3>
        </div>
        <div>
          <div className="form-group">
            <label className="form-label">Avatar Border</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['None', 'Bronze', 'Silver', 'Gold', 'Diamond'].map(border => (
                <button
                  key={border}
                  className={`btn ${userData?.avatarBorder === border ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {border}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
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
      </div>
    </div>
  );
};

export default ProfilePage;
