import React, { useEffect, useState } from 'react';
import { EmptyState, SectionHeader, StatusPill, SurfaceCard } from '../components/StitchPrimitives';

interface AchievementItem {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
  unlocked?: boolean;
  points?: number;
  progress?: number | null;
  maxProgress?: number | null;
}

const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      if (window.electronAPI.getAchievements) {
        const res = await window.electronAPI.getAchievements();
        // IPC now returns { success, achievements, totalPoints, completion }
        setAchievements(res?.achievements || []);
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
    : achievements.filter((a) => a.category === filter);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + (a.points || 0), 0);

  if (loading) {
    return <div className="shell-loading-inline">Loading achievements...</div>;
  }

  return (
    <div className="dashboard-page">
      <SectionHeader
        eyebrow="Milestones"
        title="Achievements"
        description="Progress across gambling, economy, activity, and secret tracks."
        action={<StatusPill tone="gold">{unlockedCount}/{achievements.length || 0} Unlocked</StatusPill>}
      />

      <div className="stitch-filter-row">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn ${filter === cat ? 'btn-primary' : 'btn-secondary'} stitch-filter-pill`}
            onClick={() => setFilter(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <SurfaceCard
        title="Achievement Grid"
        subtitle={`${unlockedCount} unlocked • ${totalPoints} points earned`}
      >
        {filteredAchievements.length > 0 ? (
          <div className="stitch-achievement-grid">
            {filteredAchievements.map((achievement) => (
              <article
                key={achievement.id}
                className={`stitch-achievement-card ${achievement.unlocked ? 'is-unlocked' : 'is-locked'}`}
              >
                <div className="stitch-achievement-icon">{achievement.icon || '🏆'}</div>
                <div className="stitch-achievement-copy">
                  <h3>{achievement.name}</h3>
                  <p>{achievement.description}</p>
                  <div className="stitch-inline-stats">
                    <StatusPill tone={achievement.unlocked ? 'green' : 'neutral'}>
                      {achievement.unlocked ? 'Unlocked' : 'Locked'}
                    </StatusPill>
                    <StatusPill tone="gold">{achievement.points || 0} pts</StatusPill>
                  </div>
                  {achievement.progress !== undefined && achievement.progress !== null && !achievement.unlocked && (
                    <div className="stitch-achievement-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${(achievement.progress / (achievement.maxProgress || 1)) * 100}%` }}
                        />
                      </div>
                      <span>{achievement.progress} / {achievement.maxProgress}</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon="🏆" title="No achievements" description="No entries exist in this category yet." />
        )}
      </SurfaceCard>
    </div>
  );
};

export default AchievementsPage;
