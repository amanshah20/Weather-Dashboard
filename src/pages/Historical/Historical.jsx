import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import CalendarHeatmap from '../../components/CalendarHeatmap/CalendarHeatmap';
import StatCard from '../../components/StatCard/StatCard';
import WindRose from '../../components/WindRose/WindRose';
import { exportHistoricalCsv } from '../../utils/export';

export default function Historical({ state }) {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setPreset,
    presets,
    analyze,
    loading,
    result,
    error,
    validate
  } = state;
  const [aqToggle, setAqToggle] = useState({ pm10: true, pm25: true });

  const daily = result?.weather?.daily;

  const rows = useMemo(() => {
    if (!daily) return [];
    return daily.time.map((d, i) => ({
      date: d,
      tempMax: daily.temperature_2m_max?.[i],
      tempMin: daily.temperature_2m_min?.[i],
      tempMean: daily.temperature_2m_mean?.[i],
      rain: daily.precipitation_sum?.[i],
      wind: daily.wind_speed_10m_max?.[i],
      windDir: daily.wind_direction_10m_dominant?.[i],
      sunrise: daily.sunrise?.[i],
      sunset: daily.sunset?.[i]
    }));
  }, [daily]);

  const summary = useMemo(() => {
    if (!rows.length) return null;
    const hottest = rows.reduce((a, b) => (a.tempMax > b.tempMax ? a : b));
    const coldest = rows.reduce((a, b) => (a.tempMin < b.tempMin ? a : b));
    const windiest = rows.reduce((a, b) => (a.wind > b.wind ? a : b));
    const totalRain = rows.reduce((sum, r) => sum + (r.rain || 0), 0);
    const avgTemp = rows.reduce((sum, r) => sum + (r.tempMean || 0), 0) / rows.length;
    return { hottest, coldest, windiest, totalRain, avgTemp };
  }, [rows]);

  const airDaily = result?.air?.daily;
  const airRows = useMemo(() => {
    if (!airDaily?.time) return [];
    return airDaily.time.map((time, i) => ({
      time,
      pm10: airDaily.pm10?.[i],
      pm25: airDaily.pm2_5?.[i]
    }));
  }, [airDaily]);

  const rainByDate = useMemo(() => Object.fromEntries(rows.map((r) => [r.date, r.rain || 0])), [rows]);

  return (
    <section className="page historical-page">
      <section className="glass-card range-panel fade-in-up">
        <h3>Historical Analysis</h3>
        <div className="range-grid">
          <label>Start Date <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
          <label>End Date <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
          <button type="button" className="analyze-btn" disabled={!!validate || loading} onClick={analyze}>{loading ? 'Analyzing...' : '⚡ Analyze'}</button>
        </div>
        <div className="preset-row">
          {presets.map((p) => (
            <button key={p} type="button" onClick={() => setPreset(p)}>{p}</button>
          ))}
          <button type="button" onClick={() => exportHistoricalCsv(`historical-${startDate}-to-${endDate}.csv`, rows)}>Export CSV</button>
        </div>
        {validate && <p className="error-text">{validate}</p>}
        {!!error && (
          <div>
            <p className="error-text">{error}</p>
            <button type="button" onClick={analyze} disabled={loading}>Retry</button>
          </div>
        )}
      </section>

      {summary && (
        <section className="stats-grid fade-in-up">
          <StatCard title="Hottest Day" value={`${summary.hottest.date} · ${Math.round(summary.hottest.tempMax)}°C`} />
          <StatCard title="Coldest Day" value={`${summary.coldest.date} · ${Math.round(summary.coldest.tempMin)}°C`} />
          <StatCard title="Total Rainfall" value={`${summary.totalRain.toFixed(1)} mm`} />
          <StatCard title="Average Temp" value={`${summary.avgTemp.toFixed(1)}°C`} />
          <StatCard title="Max Wind" value={`${Math.round(summary.windiest.wind)} km/h`} hint={summary.windiest.date} />
          <StatCard title="Best AQ Day" value={airRows.length ? format(new Date(airRows[0].time), 'yyyy-MM-dd') : '--'} />
        </section>
      )}

      {!!rows.length && (
        <section className="charts-grid">
          <article className="glass-card fade-in-up">
            <h3>Temperature Trends</h3>
            <div className="chart-fixed">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rows}>
                  <CartesianGrid stroke="rgba(107,163,200,0.16)" />
                  <XAxis dataKey="date" hide={rows.length > 24} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="tempMax" stroke="var(--c-rose)" fill="var(--c-rose)" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="tempMin" stroke="var(--c-blue)" fill="var(--c-blue)" fillOpacity={0.16} />
                  <Line type="monotone" dataKey="tempMean" stroke="var(--c-amber)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <CalendarHeatmap startDate={startDate} endDate={endDate} valueByDate={rainByDate} />

          <article className="glass-card fade-in-up">
            <h3>Sun Cycle Timeline</h3>
            <div className="chart-fixed">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows.map((r) => ({
                  ...r,
                  sunriseHour: Number(r.sunrise?.split('T')[1]?.slice(0, 2) || 0),
                  sunsetHour: Number(r.sunset?.split('T')[1]?.slice(0, 2) || 0)
                }))}>
                  <CartesianGrid stroke="rgba(107,163,200,0.16)" />
                  <XAxis dataKey="date" hide={rows.length > 24} />
                  <YAxis domain={[0, 24]} />
                  <Tooltip />
                  <Line dataKey="sunriseHour" stroke="var(--c-amber)" dot={false} />
                  <Line dataKey="sunsetHour" stroke="var(--c-orange)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-card fade-in-up">
            <h3>Wind Speed Over Time</h3>
            <div className="chart-fixed">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows}>
                  <CartesianGrid stroke="rgba(107,163,200,0.16)" />
                  <XAxis dataKey="date" hide={rows.length > 24} />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="wind" stroke="var(--c-cyan)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <WindRose directions={rows.map((r) => r.windDir || 0)} />

          <article className="glass-card fade-in-up">
            <h3>Air Quality Multi-Line</h3>
            <div className="aq-toggles">
              {['pm10', 'pm25'].map((k) => (
                <button key={k} type="button" className={aqToggle[k] ? 'active' : ''} onClick={() => setAqToggle((p) => ({ ...p, [k]: !p[k] }))}>{k.toUpperCase()}</button>
              ))}
            </div>
            <div className="chart-fixed">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={airRows}>
                  <CartesianGrid stroke="rgba(107,163,200,0.16)" />
                  <XAxis dataKey="time" hide />
                  <YAxis />
                  <Tooltip />
                  {aqToggle.pm10 && <Line dataKey="pm10" stroke="var(--c-amber)" dot={false} />}
                  {aqToggle.pm25 && <Line dataKey="pm25" stroke="var(--c-orange)" dot={false} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>
      )}
    </section>
  );
}
