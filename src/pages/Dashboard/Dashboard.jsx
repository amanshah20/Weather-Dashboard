import { addDays, format, subDays } from 'date-fns';
import { useMemo, useState } from 'react';
import CompassRose from '../../components/CompassRose/CompassRose';
import HourlyChart from '../../components/HourlyChart/HourlyChart';
import HumidityRing from '../../components/HumidityRing/HumidityRing';
import StatCard from '../../components/StatCard/StatCard';
import UVGauge from '../../components/UVGauge/UVGauge';
import WeatherIcon from '../../components/WeatherIcon/WeatherIcon';
import {
  comfortIndex,
  daylightHours,
  getMoonPhase,
  goldenHourLabel,
  toTemp,
  umbrellaRecommendation,
  uvBurnTimeMinutes
} from '../../utils/calculations';

function DateSelector({ date, onDateChange }) {
  const current = new Date(date);
  const max = addDays(new Date(), 6);
  const min = subDays(new Date(), 7);

  const canNext = addDays(current, 1) <= max;
  const canPrev = subDays(current, 1) >= min;

  return (
    <div className="glass-card date-selector fade-in-up">
      <button type="button" disabled={!canPrev} onClick={() => onDateChange(format(subDays(current, 1), 'yyyy-MM-dd'))}>◀</button>
      <input
        type="date"
        value={date}
        min={format(min, 'yyyy-MM-dd')}
        max={format(max, 'yyyy-MM-dd')}
        onChange={(e) => onDateChange(e.target.value)}
      />
      <button type="button" disabled={!canNext} onClick={() => onDateChange(format(addDays(current, 1), 'yyyy-MM-dd'))}>▶</button>
      <button type="button" onClick={() => onDateChange(format(new Date(), 'yyyy-MM-dd'))}>Today</button>
    </div>
  );
}

export default function Dashboard({ location, weatherState, tempUnit, onToggleUnit }) {
  const { data, loading, error, date, setDate, lastUpdated, countdownLabel, responseMs, refreshNow } = weatherState;
  const [timelineOffset, setTimelineOffset] = useState(0);

  const currentHourIndex = useMemo(() => {
    const times = data?.weather?.hourly?.time || [];
    const currentTime = data?.weather?.current?.time;
    if (!times.length) return 0;
    const exactIndex = currentTime ? times.findIndex((t) => t === currentTime) : -1;
    if (exactIndex >= 0) return exactIndex;
    return Math.min(new Date().getHours(), Math.max(0, times.length - 1));
  }, [data]);

  const transformed = useMemo(() => {
    if (!data?.weather?.hourly?.time) return null;
    const h = data.weather.hourly;
    const list = h.time.map((time, i) => ({
      time: String(time).split('T')[1] || String(i).padStart(2, '0') + ':00',
      temp: h.temperature_2m?.[i],
      feel: h.apparent_temperature?.[i],
      humidity: h.relative_humidity_2m?.[i],
      dew: h.dew_point_2m?.[i],
      rain: h.precipitation?.[i],
      rainProb: h.precipitation_probability?.[i],
      wind: h.wind_speed_10m?.[i],
      gust: h.wind_gusts_10m?.[i],
      windDir: h.wind_direction_10m?.[i],
      visibility: (h.visibility?.[i] || 0) / 1000,
      cloud: h.cloud_cover?.[i],
      uv: h.uv_index?.[i],
      code: h.weather_code?.[i],
      pm10: data.air?.hourly?.pm10?.[i],
      pm25: data.air?.hourly?.pm2_5?.[i]
    }));

    return list.slice(0, 24);
  }, [data]);

  const current = data?.weather?.current;
  const daily = data?.weather?.daily;
  const airCurrent = data?.air?.current;
  const currentUV = current?.uv_index ?? data?.weather?.hourly?.uv_index?.[currentHourIndex] ?? 0;
  const currentVisibility = current?.visibility ?? data?.weather?.hourly?.visibility?.[currentHourIndex] ?? 0;
  const sunBurn = uvBurnTimeMinutes(currentUV || 0);
  const comfort = comfortIndex({
    tempC: current?.temperature_2m,
    windKph: current?.wind_speed_10m,
    humidity: current?.relative_humidity_2m
  });

  if (loading && !current) return <section className="skeleton big" />;

  return (
    <section className="page dashboard-page">
      <DateSelector date={date} onDateChange={setDate} />

      {!!error && (
        <section className="glass-card fade-in-up" style={{ marginBottom: 12 }}>
          <h3>Unable to load weather data</h3>
          <p className="mono">{error}</p>
          <button type="button" onClick={refreshNow}>Retry</button>
        </section>
      )}

      <article className="glass-card hero fade-in-up">
        <div>
          <p className="mono">Current Conditions</p>
          <h2 className="hero-temp">{toTemp(current?.temperature_2m, tempUnit)}</h2>
          <p className="mono">Feels like {toTemp(current?.apparent_temperature, tempUnit)}</p>
          <p>{location?.city}, {format(new Date(), 'EEE, dd MMM yyyy')}</p>
          <p className="mono pulse">Last updated: {lastUpdated ? Math.floor((Date.now() - lastUpdated.getTime()) / 1000) : 0}s ago</p>
          <div className="hero-actions">
            <button type="button" onClick={onToggleUnit}>{tempUnit === 'C' ? 'Switch to °F' : 'Switch to °C'}</button>
            <button type="button" onClick={refreshNow}>Manual Refresh</button>
            <span className="mono">Next refresh in {countdownLabel}</span>
          </div>
        </div>
        <WeatherIcon code={current?.weather_code} size="xl" />
      </article>

      <section className="stats-grid">
        <StatCard title="Humidity" value={`${Math.round(current?.relative_humidity_2m || 0)}%`}><HumidityRing value={current?.relative_humidity_2m || 0} /></StatCard>
        <StatCard title="UV Index" value={Number(currentUV || 0).toFixed(1)} accent="var(--c-amber)"><UVGauge value={currentUV || 0} /></StatCard>
        <StatCard title="Wind" value={`${Math.round(current?.wind_speed_10m || 0)} km/h`} hint={`Gust ${Math.round(current?.wind_gusts_10m || 0)} km/h`}><CompassRose degree={current?.wind_direction_10m || 0} /></StatCard>
        <StatCard title="Pressure" value={`${Math.round(current?.surface_pressure || 0)} hPa`} />
        <StatCard title="Visibility" value={`${((currentVisibility || 0) / 1000).toFixed(1)} km`} />
        <StatCard title="Cloud Cover" value={`${Math.round(current?.cloud_cover || 0)}%`} />
        <StatCard title="Sunrise" value={daily?.sunrise?.[0] ? format(new Date(daily.sunrise[0]), 'HH:mm') : '--'} />
        <StatCard title="Sunset" value={daily?.sunset?.[0] ? format(new Date(daily.sunset[0]), 'HH:mm') : '--'} />
        <StatCard title="Daylight" value={daylightHours(daily?.sunrise?.[0], daily?.sunset?.[0])} />
        <StatCard title="EU AQI" value={Math.round(airCurrent?.european_aqi || 0)} hint={`CO ${Math.round(airCurrent?.carbon_monoxide || 0)}`} accent="var(--c-orange)" />
        <StatCard title="PM2.5 / PM10" value={`${Math.round(airCurrent?.pm2_5 || 0)} / ${Math.round(airCurrent?.pm10 || 0)} μg/m³`} />
        <StatCard title="NO2 / SO2" value={`${Math.round(airCurrent?.nitrogen_dioxide || 0)} / ${Math.round(airCurrent?.sulphur_dioxide || 0)} μg/m³`} />
      </section>

      <section className="charts-grid">
        <HourlyChart
          title="Temperature Timeline"
          summary={`Min ${Math.round(Math.min(...(transformed?.map((d) => d.temp) || [0])))} / Max ${Math.round(Math.max(...(transformed?.map((d) => d.temp) || [0])))} °C`}
          data={transformed || []}
          series={[{ key: 'temp', color: 'var(--c-rose)', fill: 'var(--c-rose)' }, { key: 'feel', color: 'var(--c-amber)', dashed: true }]}
          minRef={daily?.temperature_2m_min?.[0]}
          maxRef={daily?.temperature_2m_max?.[0]}
        />
        <HourlyChart title="Humidity & Dew Point" summary="Relative humidity with dew point" data={transformed || []} series={[{ key: 'humidity', color: 'var(--c-purple)' }, { key: 'dew', color: 'var(--c-teal)' }]} />
        <HourlyChart title="Precipitation" summary="mm and probability" data={transformed || []} type="bar" series={[{ key: 'rain', color: 'var(--c-blue)' }, { key: 'rainProb', color: 'var(--c-cyan)' }]} />
        <HourlyChart title="Wind Speed & Gust" summary="Directional hourly winds" data={transformed || []} series={[{ key: 'wind', color: 'var(--c-cyan)' }, { key: 'gust', color: 'var(--c-teal)' }]} />
        <HourlyChart title="Visibility & Cloud Cover" summary="Visibility km vs cloud %" data={transformed || []} series={[{ key: 'visibility', color: 'var(--c-teal)' }, { key: 'cloud', color: '#5f7f9b' }]} />
        <HourlyChart title="Air Quality PM10 / PM2.5" summary="WHO guideline markers included" data={transformed || []} series={[{ key: 'pm10', color: 'var(--c-amber)' }, { key: 'pm25', color: 'var(--c-orange)' }]} minRef={15} maxRef={45} />
      </section>

      <section className="timeline glass-card fade-in-up">
        <h3>48-Hour Weather Timeline</h3>
        <div className="timeline-controls">
          <button type="button" onClick={() => setTimelineOffset((v) => Math.max(0, v - 1))}>◀</button>
          <button type="button" onClick={() => setTimelineOffset((v) => Math.min(24, v + 1))}>▶</button>
        </div>
        <div className="timeline-strip">
          {(transformed || []).slice(timelineOffset, timelineOffset + 24).map((point) => (
            <div key={point.time} className="timeline-item">
              <span className="mono">{point.time}</span>
              <WeatherIcon code={point.code} size="sm" />
              <strong className="mono">{toTemp(point.temp, tempUnit)}</strong>
              <small className="mono">☔ {Math.round(point.rainProb || 0)}%</small>
            </div>
          ))}
        </div>
      </section>

      <aside className="widget-sidebar glass-card fade-in-up">
        <h3>Weather Widgets</h3>
        <p className="mono">Moon phase: {getMoonPhase()}</p>
        <p className="mono">Golden hour: {goldenHourLabel(daily?.sunrise?.[0], daily?.sunset?.[0])}</p>
        <p className="mono">UV burn in: {Number.isFinite(sunBurn) ? `${sunBurn} min` : 'No risk'}</p>
        <p className="mono">{comfort.type}: {comfort.value}°C</p>
        <p className="mono">{umbrellaRecommendation(Math.max(...(transformed?.map((d) => d.rainProb || 0) || [0])))}</p>
      </aside>

      <footer className="perf-footer glass-card fade-in-up">
        <p className="mono">API response time: {responseMs}ms</p>
        <p className="mono">Data loaded at: {lastUpdated ? format(lastUpdated, 'HH:mm:ss') : '--'}</p>
        <span className="perf-badge mono">All data loaded in {responseMs}ms</span>
      </footer>
    </section>
  );
}
