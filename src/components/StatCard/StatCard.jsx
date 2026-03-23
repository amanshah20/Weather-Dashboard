import { memo } from 'react';

function StatCard({ title, value, hint, accent = 'var(--c-cyan)', children }) {
  return (
    <article className="glass-card stat-card fade-in-up" style={{ '--accent': accent }}>
      <header>
        <p className="stat-title">{title}</p>
        <h3 className="stat-value mono">{value}</h3>
      </header>
      {hint && <p className="stat-hint mono">{hint}</p>}
      {children}
    </article>
  );
}

export default memo(StatCard);
