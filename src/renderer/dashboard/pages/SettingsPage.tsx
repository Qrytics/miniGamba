import React, { useEffect, useState } from 'react';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      if (window.electronAPI.getSettings) {
        const data = await window.electronAPI.getSettings();
        setSettings(data || {});
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key: string, value: any) => {
    try {
      if (window.electronAPI.setSetting) {
        await window.electronAPI.setSetting(key, value);
        setSettings({ ...settings, [key]: value });
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      try {
        if (window.electronAPI.resetSettings) {
          await window.electronAPI.resetSettings();
          loadSettings();
        }
      } catch (error) {
        console.error('Failed to reset settings:', error);
      }
    }
  };

  const handleExportData = async () => {
    try {
      if (window.electronAPI.exportData) {
        const data = await window.electronAPI.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `minigamba-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>⚙️ Settings</h2>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🎮 Overlay Settings</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Overlay Opacity</label>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={settings.overlayOpacity || 90}
              onChange={(e) => handleSettingChange('overlayOpacity', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <div className="text-muted mt-1">{settings.overlayOpacity || 90}%</div>
          </div>

          <div className="form-group">
            <label className="form-label">Overlay Size</label>
            <select 
              className="input"
              value={settings.overlaySize || 'medium'}
              onChange={(e) => handleSettingChange('overlaySize', e.target.value)}
            >
              <option value="small">Small (400x300)</option>
              <option value="medium">Medium (600x450)</option>
              <option value="large">Large (800x600)</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={settings.clickThrough || false}
                onChange={(e) => handleSettingChange('clickThrough', e.target.checked)}
              />
              <span>Click-through mode (overlay won't block clicks)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">🔊 Audio Settings</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Master Volume</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={settings.masterVolume || 50}
              onChange={(e) => handleSettingChange('masterVolume', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <div className="text-muted mt-1">{settings.masterVolume || 50}%</div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={settings.soundEffects !== false}
                onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
              />
              <span>Sound Effects</span>
            </label>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={settings.backgroundMusic || false}
                onChange={(e) => handleSettingChange('backgroundMusic', e.target.checked)}
              />
              <span>Background Music</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">🎲 Gameplay Settings</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={settings.autoSpin || false}
                onChange={(e) => handleSettingChange('autoSpin', e.target.checked)}
              />
              <span>Enable Auto-Spin for slots</span>
            </label>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={settings.fastAnimations || false}
                onChange={(e) => handleSettingChange('fastAnimations', e.target.checked)}
              />
              <span>Fast Animations</span>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Default Bet Amount</label>
            <input 
              type="number" 
              className="input"
              value={settings.defaultBet || 10}
              onChange={(e) => handleSettingChange('defaultBet', parseInt(e.target.value))}
              min="1"
              max="1000"
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">💾 Data Management</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleExportData}>
            📤 Export Data
          </button>
          <button className="btn btn-secondary">
            📥 Import Data
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            🔄 Reset Settings
          </button>
          <button className="btn btn-danger">
            🗑️ Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
