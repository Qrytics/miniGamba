import React, { useEffect, useState } from 'react';
import { EmptyState, SectionHeader, StatusPill, SurfaceCard } from '../components/StitchPrimitives';

interface SettingsState {
  overlay?: {
    opacity?: number;
    size?: 'small' | 'medium' | 'large' | 'custom';
    clickThroughMode?: boolean;
  };
  audio?: {
    masterVolume?: number;
    uiVolume?: number;
    gameVolume?: number;
    musicVolume?: number;
  };
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadSettings();
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
        await loadSettings();
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
          await loadSettings();
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

  const overlayOpacity = Math.round((settings.overlay?.opacity ?? 0.9) * 100);
  const overlaySize = settings.overlay?.size || 'medium';
  const clickThrough = settings.overlay?.clickThroughMode || false;
  const masterVolume = settings.audio?.masterVolume ?? 70;
  const soundEffects = (settings.audio?.uiVolume ?? 80) > 0 || (settings.audio?.gameVolume ?? 100) > 0;
  const backgroundMusic = (settings.audio?.musicVolume ?? 50) > 0;

  return (
    <div className="dashboard-page">
      <SectionHeader
        eyebrow="Configuration"
        title="Settings"
        description="This page now reflects the actual nested settings model used by the app instead of a flat mock shape, which removes a handful of silent update failures."
        action={<StatusPill tone="gold">Live Config</StatusPill>}
      />

      <div className="stitch-split-grid">
        <SurfaceCard title="Overlay Settings" subtitle="Visibility, footprint, and click behavior">
          <div className="settings-grid">
            <div className="settings-control">
              <div className="settings-control-row">
                <label className="form-label">Overlay Opacity</label>
                <span className="text-muted">{overlayOpacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={overlayOpacity}
                onChange={(e) => handleSettingChange('overlayOpacity', parseInt(e.target.value, 10))}
                style={{ width: '100%' }}
              />
            </div>

            <div className="settings-control">
              <label className="form-label">Overlay Size</label>
              <select className="input" value={overlaySize} onChange={(e) => handleSettingChange('overlaySize', e.target.value)}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <label className="settings-control-row">
              <span>Click-through mode</span>
              <input type="checkbox" checked={clickThrough} onChange={(e) => handleSettingChange('clickThrough', e.target.checked)} />
            </label>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Audio Settings" subtitle="Master volume and channel toggles">
          <div className="settings-grid">
            <div className="settings-control">
              <div className="settings-control-row">
                <label className="form-label">Master Volume</label>
                <span className="text-muted">{masterVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(e) => handleSettingChange('masterVolume', parseInt(e.target.value, 10))}
                style={{ width: '100%' }}
              />
            </div>

            <label className="settings-control-row">
              <span>Sound Effects</span>
              <input type="checkbox" checked={soundEffects} onChange={(e) => handleSettingChange('soundEffects', e.target.checked)} />
            </label>

            <label className="settings-control-row">
              <span>Background Music</span>
              <input type="checkbox" checked={backgroundMusic} onChange={(e) => handleSettingChange('backgroundMusic', e.target.checked)} />
            </label>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard title="Gameplay Defaults" subtitle="Stubbed options kept visible until the app stores them centrally">
        <EmptyState
          icon="🎲"
          title="Gameplay preferences are next"
          description="The old controls here were disconnected from persistent storage. They’re intentionally parked until a real gameplay-settings contract is added."
        />
      </SurfaceCard>

      <SurfaceCard title="Data Management" subtitle="Backup and reset tools">
        <div className="stitch-stack">
          <button className="btn btn-primary" onClick={handleExportData}>Export Data</button>
          <button className="btn btn-secondary" onClick={handleReset}>Reset Settings</button>
        </div>
      </SurfaceCard>
    </div>
  );
};

export default SettingsPage;
