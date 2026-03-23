import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import MiniSparkline from '../../components/MiniSparkline/MiniSparkline';
import WeatherIcon from '../../components/WeatherIcon/WeatherIcon';

function buildAlerts(dayData) {
  const alerts = [];
  if ((dayData.uv || 0) > 8) alerts.push({ level: 'danger', title: 'Extreme UV', desc: 'Limit direct midday exposure.' });
  if ((dayData.wind || 0) > 60) alerts.push({ level: 'warning', title: 'Strong Winds', desc: 'Secure outdoor items and travel carefully.' });
  if ((dayData.rain || 0) > 10) alerts.push({ level: 'warning', title: 'Heavy Rain Risk', desc: 'Localized flooding possible.' });
  if (!alerts.length) alerts.push({ level: 'info', title: 'Conditions Stable', desc: 'No severe thresholds detected.' });
  return alerts;
}

export default function Forecast({ forecastData, tempUnit }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [dismissed, setDismissed] = useState({});

  const days = useMemo(() => {
    if (!forecastData?.weather?.daily) return [];
    const d = forecastData.weather.daily;
    return d.time.map((date, i) => ({
      date,
      max: d.temperature_2m_max?.[i],
      min: d.temperature_2m_min?.[i],
      rain: d.precipitation_sum?.[i],
      rainProb: d.precipitation_probability_max?.[i],
      wind: d.wind_speed_10m_max?.[i],
      uv: d.uv_index_max?.[i],
      code: d.weather_code?.[i]
    }));
  }, [forecastData]);

  const hourly = useMemo(() => {
    if (!forecastData?.weather?.hourly || !days[selectedDay]) return [];
    const h = forecastData.weather.hourly;
    const target = days[selectedDay].date;

    return h.time
      .map((t, i) => ({
        date: t.split('T')[0],
        time: t.split('T')[1],
        temp: h.temperature_2m?.[i],
        feels: h.apparent_temperature?.[i],
        rainProb: h.precipitation_probability?.[i],
        rain: h.precipitation?.[i],
        humidity: h.relative_humidity_2m?.[i],
        wind: h.wind_speed_10m?.[i],
        visibility: (h.visibility?.[i] || 0) / 1000,
        uv: h.uv_index?.[i],
        cloud: h.cloud_cover?.[i]
      }))
      .filter((row) => row.date === target);
  }, [days, forecastData, selectedDay]);

  const alerts = buildAlerts(days[selectedDay] || {});

  return (
    <section className="page forecast-page">
      <section className="forecast-row fade-in-up">
        {days.map((day, idx) => (
          <article key={day.date} className={`glass-card forecast-day ${selectedDay === idx ? 'active' : ''}`} onClick={() => setSelectedDay(idx)}>
            <h3>{format(new Date(day.date), 'EEE')}</h3>
            <p className="mono">{format(new Date(day.date), 'dd MMM')}</p>
            <WeatherIcon code={day.code} size="sm" />
            <p className="mono">{day.max == null ? '—' : Math.round(day.max)}° / {day.min == null ? '—' : Math.round(day.min)}°</p>
            <div className="range-bar"><span style={{ width: `${Math.min(100, ((day.max ?? 0) - (day.min ?? 0)) * 7)}%` }} /></div>
            <p className="mono">☔ {Math.round(day.rainProb || 0)}% · {day.rain?.toFixed?.(1) || 0} mm</p>
            <p className="mono">🌬 {Math.round(day.wind || 0)} km/h</p>
            <span className="uv-pill mono">UV {Number(day.uv || 0).toFixed(1)}</span>
          </article>
        ))}
      </section>

      <section className="mini-row fade-in-up">
        <MiniSparkline title="Temperature" data={hourly} dataKey="temp" color="var(--c-rose)" />
        <MiniSparkline title="Rain Probability" data={hourly} dataKey="rainProb" color="var(--c-blue)" />
        <MiniSparkline title="Wind" data={hourly} dataKey="wind" color="var(--c-cyan)" />
        <MiniSparkline title="UV Index" data={hourly} dataKey="uv" color="var(--c-amber)" />
      </section>

      <section className="glass-card table-wrap fade-in-up">
        <h3>Hourly Detail</h3>
        <div className="table-scroll">
          <table className="hourly-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Temp ({tempUnit})</th>
                <th>Feels</th>
                <th>Rain %</th>
                <th>Rain mm</th>
                <th>Humidity</th>
                <th>Wind</th>
                <th>Visibility</th>
                <th>UV</th>
                <th>Cloud%</th>
              </tr>
            </thead>
            <tbody>
              {hourly.map((row) => (
                <tr key={row.time}>
                  <td className="sticky mono">{row.time}</td>
                  <td>{row.temp == null ? '—' : `${Math.round(row.temp)}°`}</td>
                  <td>{row.feels == null ? '—' : `${Math.round(row.feels)}°`}</td>
                  <td className={row.rainProb > 70 ? 'hot-cell' : ''}>{row.rainProb == null ? '—' : `${Math.round(row.rainProb)}%`}</td>
                  <td>{row.rain == null ? '—' : row.rain.toFixed(1)}</td>
                  <td>{row.humidity == null ? '—' : `${Math.round(row.humidity)}%`}</td>
                  <td>{row.wind == null ? '—' : `${Math.round(row.wind)} km/h`}</td>
                  <td>{row.visibility == null ? '—' : `${row.visibility.toFixed(1)} km`}</td>
                  <td>{row.uv == null ? '—' : Number(row.uv).toFixed(1)}</td>
                  <td>{row.cloud == null ? '—' : `${Math.round(row.cloud)}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="alerts fade-in-up">
        {alerts
          .filter((_, idx) => !dismissed[idx])
          .map((alert, idx) => (
            <div key={`${alert.title}-${idx}`} className={`alert ${alert.level}`}>
              <div>
                <h4>{alert.title}</h4>
                <p>{alert.desc}</p>
              </div>
              <button type="button" onClick={() => setDismissed((p) => ({ ...p, [idx]: true }))}>Dismiss</button>
            </div>
          ))}
      </section>
    </section>
  );
}
