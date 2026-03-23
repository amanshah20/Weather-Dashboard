import { memo, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

function TooltipCard({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip glass-card">
      <p className="mono">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="mono">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

function ChartWithType({ type, data, series, minRef, maxRef, onPointClick }) {
  if (type === 'bar') {
    return (
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(107,163,200,0.16)" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip content={<TooltipCard />} />
        <Bar dataKey={series[0].key} fill={series[0].color} radius={[6, 6, 0, 0]} onClick={onPointClick} />
        {series[1] && <Line type="monotone" dataKey={series[1].key} stroke={series[1].color} strokeWidth={2} dot={false} />}
      </BarChart>
    );
  }

  return (
    <AreaChart data={data}>
      <CartesianGrid stroke="rgba(107,163,200,0.16)" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip content={<TooltipCard />} />
      {series.map((s, idx) => (
        <Area
          key={s.key}
          type="monotone"
          dataKey={s.key}
          stroke={s.color}
          fill={s.fill || s.color}
          fillOpacity={idx === 0 ? 0.2 : 0.1}
          strokeDasharray={s.dashed ? '5 5' : '0'}
          connectNulls
          onClick={onPointClick}
        />
      ))}
      {minRef !== undefined && <ReferenceLine y={minRef} stroke="var(--c-teal)" strokeDasharray="4 4" />}
      {maxRef !== undefined && <ReferenceLine y={maxRef} stroke="var(--c-amber)" strokeDasharray="4 4" />}
    </AreaChart>
  );
}

function HourlyChart({ title, summary, data, series, type = 'area', minRef, maxRef }) {
  const [zoom, setZoom] = useState(100);
  const [point, setPoint] = useState(null);

  const width = useMemo(() => `${zoom}%`, [zoom]);
  const safeData = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    return rows.filter((row) => {
      if (!row) return false;
      return series.some((s) => Number.isFinite(Number(row?.[s.key])));
    });
  }, [data, series]);

  return (
    <article className="glass-card chart-card fade-in-up">
      <div className="chart-top">
        <div>
          <h3>{title}</h3>
          <p className="mono">{summary}</p>
        </div>
        <div className="chart-controls">
          <button type="button" onClick={() => setZoom((z) => Math.max(50, z - 25))}>-</button>
          <span className="mono">{zoom}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(400, z + 25))}>+</button>
        </div>
      </div>

      <div className="chart-scroll">
        {safeData.length ? (
          <div style={{ width, minWidth: 640, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ChartWithType
                type={type}
                data={safeData}
                series={series}
                minRef={minRef}
                maxRef={maxRef}
                onPointClick={(entry) => setPoint(entry?.payload || entry)}
              />
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mono">No chart data available for this selection.</p>
        )}
      </div>

      {point && (
        <div className="point-pop glass-card">
          <p className="mono">{JSON.stringify(point)}</p>
          <button type="button" onClick={() => setPoint(null)}>Close</button>
        </div>
      )}
    </article>
  );
}

export default memo(HourlyChart);
