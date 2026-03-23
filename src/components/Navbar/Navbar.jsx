import { useEffect, useMemo, useState } from 'react';
import { formatClock } from '../../utils/calculations';
import { weatherEmoji } from '../../utils/weather-codes';

const tabs = [
  { id: 'dashboard', label: '☀ Dashboard' },
  { id: 'forecast', label: '📅 Forecast' },
  { id: 'historical', label: '📊 Historical' },
  { id: 'map', label: '🗺 Map View' }
];

export default function Navbar({ active, onTabChange, location, weatherCode, onToggleTheme, theme, onToggleCompare }) {
  const [clock, setClock] = useState(formatClock());

  useEffect(() => {
    const timer = setInterval(() => setClock(formatClock()), 1000);
    return () => clearInterval(timer);
  }, []);

  const city = useMemo(() => location?.city || 'Unknown', [location]);

  return (
    <header className="top-nav">
      <div className="brand">
        <svg viewBox="0 0 80 80" className="logo">
          <circle cx="40" cy="40" r="26" className="orbit" />
          <circle cx="40" cy="40" r="7" className="core" />
        </svg>
        <div>
          <h1>AtmoSphere Pro</h1>
          <p className="mono">Weather Intelligence</p>
        </div>
      </div>

      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={active === tab.id ? 'active' : ''}
            onClick={() => onTabChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="nav-right mono">
        <span className="live-dot" />
        <span>{city}</span>
        <span>{clock}</span>
        <span>{weatherEmoji(weatherCode)}</span>
        <button type="button" className="small-btn" onClick={onToggleTheme}>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button type="button" className="small-btn" onClick={onToggleCompare}>Compare</button>
      </div>
    </header>
  );
}
