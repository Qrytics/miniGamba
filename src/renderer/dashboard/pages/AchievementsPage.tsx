import React, { useEffect, useState } from 'react';

const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      if (window.electronAPI.getAchievements) {
        const data = await window.electronAPI.getAchievements();
        setAchievements(data || []);
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'gambling', 'economy', 'activity', 'social', 'customization', 'meta', 'secret'];

  const filteredAchievements = filter === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === filter);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + (a.points || 0), 0);

  if (loading) {
    return <div>Loading achievements...</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>🏆 Achievements</h2>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        {unlockedCount} of {achievements.length} unlocked • {totalPoints} points earned
      </p>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`btn ${filter === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-4">
        {filteredAchievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`achievement-badge ${achievement.unlocked ? 'unlocked' : ''}`}
          >
            <div className="achievement-icon">{achievement.icon || '🏆'}</div>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{achievement.name}</div>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
              {achievement.description}
            </p>
            <div style={{ fontSize: '0.875rem', color: 'var(--gold)' }}>
              {achievement.points || 0} points
            </div>
            {achievement.progress !== undefined && !achievement.unlocked && (
              <div style={{ marginTop: '0.5rem', width: '100%' }}>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(achievement.progress / (achievement.maxProgress || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {achievement.progress} / {achievement.maxProgress}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center text-muted" style={{ padding: '4rem' }}>
          No achievements in this category
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
