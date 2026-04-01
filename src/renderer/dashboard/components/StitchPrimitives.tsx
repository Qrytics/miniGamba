import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ eyebrow, title, description, action }) => (
  <div className="stitch-section-header">
    <div>
      {eyebrow && <p className="stitch-eyebrow">{eyebrow}</p>}
      <h2 className="stitch-section-title">{title}</h2>
      {description && <p className="stitch-section-description">{description}</p>}
    </div>
    {action && <div className="stitch-section-action">{action}</div>}
  </div>
);

interface MetricTileProps {
  label: string;
  value: React.ReactNode;
  accent?: 'gold' | 'cyan' | 'green' | 'red' | 'neutral';
  detail?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({ label, value, accent = 'neutral', detail }) => (
  <article className={`stitch-metric-tile accent-${accent}`}>
    <p className="stitch-metric-label">{label}</p>
    <div className="stitch-metric-value">{value}</div>
    {detail && <p className="stitch-metric-detail">{detail}</p>}
  </article>
);

interface SurfaceCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({ title, subtitle, action, className = '', children }) => (
  <section className={`stitch-surface-card ${className}`.trim()}>
    {(title || subtitle || action) && (
      <div className="stitch-card-topline">
        <div>
          {title && <h3 className="stitch-card-title">{title}</h3>}
          {subtitle && <p className="stitch-card-subtitle">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: 'gold' | 'cyan' | 'green' | 'red' | 'neutral';
  footer?: React.ReactNode;
  onClick?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  accent = 'neutral',
  footer,
  onClick,
}) => {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      className={`stitch-feature-card accent-${accent}${onClick ? ' is-interactive' : ''}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <div className="stitch-feature-icon">{icon}</div>
      <div className="stitch-feature-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {footer && <div className="stitch-feature-footer">{footer}</div>}
    </Tag>
  );
};

interface StatusPillProps {
  tone?: 'gold' | 'cyan' | 'green' | 'red' | 'neutral';
  children: React.ReactNode;
}

export const StatusPill: React.FC<StatusPillProps> = ({ tone = 'neutral', children }) => (
  <span className={`stitch-status-pill tone-${tone}`}>{children}</span>
);

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => (
  <div className="stitch-empty-state">
    <div className="stitch-empty-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);
