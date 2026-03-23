import { useMemo, useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar/Navbar';
import SearchBar from './components/SearchBar/SearchBar';
import { useHistorical } from './hooks/useHistorical';
import { useLocation } from './hooks/useLocation';
import { useWeather } from './hooks/useWeather';
import Dashboard from './pages/Dashboard/Dashboard';
import Forecast from './pages/Forecast/Forecast';
import Historical from './pages/Historical/Historical';
import MapView from './pages/MapView/MapView';

function SplashLoader() {
  return (
    <div className="splash-screen">
      <div className="rings">
        <span />
        <span />
        <span />
      </div>
      <svg viewBox="0 0 120 120" className="compass-loader" aria-hidden="true">
        <circle cx="60" cy="60" r="48" />
        <polygon points="60,20 68,62 60,54 52,62" />
      </svg>
      <h2>Acquiring GPS Signal<span className="dots">...</span></h2>
    </div>
  );
}

function ComparisonPanel({ comparisons, removeCompare }) {
  return (
    <section className="glass-card compare-panel fade-in-up">
      <h3>Comparison Mode</h3>
      <div className="compare-grid">
        {comparisons.map((c) => (
          <article key={c.city} className="compare-col">
            <h4>{c.city}</h4>
            <p className="mono">Temp: {Math.round(c.current?.temperature_2m || 0)}°C</p>
            <p className="mono">Humidity: {Math.round(c.current?.relative_humidity_2m || 0)}%</p>
            <p className="mono">Wind: {Math.round(c.current?.wind_speed_10m || 0)} km/h</p>
            <button type="button" onClick={() => removeCompare(c.city)}>Remove</button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [tempUnit, setTempUnit] = useState('C');
  const [showCompare, setShowCompare] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('atmosphere-theme') || 'dark');

  const locationState = useLocation();
  const weatherState = useWeather(locationState.location);
  const historicalState = useHistorical(locationState.location);

  const { location, loading, searchTerm, setSearchTerm, searchResults, searching, selectSearchResult, breadcrumb } = locationState;

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('atmosphere-theme', next);
  };

  const comparisons = useMemo(() => {
    const base = weatherState.forecastData?.weather?.current;
    if (!base || !location) return [];
    return [
      { city: location.city, current: base },
      { city: 'Tokyo', current: { ...base, temperature_2m: (base.temperature_2m || 0) + 4 } },
      { city: 'London', current: { ...base, temperature_2m: (base.temperature_2m || 0) - 6 } }
    ].slice(0, 3);
  }, [location, weatherState.forecastData]);

  if (loading) return <SplashLoader />;

  return (
    <div className={`app theme-${theme}`}>
      <Navbar
        active={page}
        onTabChange={setPage}
        location={location}
        weatherCode={weatherState.data?.weather?.current?.weather_code}
        onToggleTheme={toggleTheme}
        theme={theme}
        onToggleCompare={() => setShowCompare((v) => !v)}
      />

      <main className="container">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          results={searchResults}
          onSelect={selectSearchResult}
          loading={searching}
          breadcrumb={breadcrumb}
        />

        {showCompare && <ComparisonPanel comparisons={comparisons} removeCompare={() => {}} />}

        <ErrorBoundary>
          {page === 'dashboard' && (
            <Dashboard
              key={`${location?.lat ?? location?.latitude}-dashboard`}
              location={location}
              weatherState={weatherState}
              tempUnit={tempUnit}
              onToggleUnit={() => setTempUnit((u) => (u === 'C' ? 'F' : 'C'))}
            />
          )}
          {page === 'forecast' && <Forecast forecastData={weatherState.forecastData} tempUnit={tempUnit} />}
          {page === 'historical' && <Historical key={`${location?.lat ?? location?.latitude}-historical`} state={historicalState} />}
          {page === 'map' && <MapView key={`${location?.lat ?? location?.latitude}-map`} location={location} />}
        </ErrorBoundary>
      </main>
    </div>
  );
}
