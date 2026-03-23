import { eachDayOfInterval, format } from 'date-fns';

export default function CalendarHeatmap({ startDate, endDate, valueByDate = {} }) {
  if (!startDate || !endDate) return null;

  const days = eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) });
  const max = Math.max(1, ...Object.values(valueByDate).map(Number));

  const color = (v) => {
    if (!v) return 'rgba(255,255,255,0.06)';
    const ratio = Math.min(1, Number(v) / max);
    if (ratio < 0.33) return 'rgba(0,180,255,0.25)';
    if (ratio < 0.66) return 'rgba(0,180,255,0.5)';
    return 'rgba(0,180,255,0.85)';
  };

  return (
    <div className="glass-card heatmap-card fade-in-up">
      <h3>Precipitation Calendar Heatmap</h3>
      <svg viewBox="0 0 860 180" className="heatmap-svg">
        {days.map((day, idx) => {
          const x = 40 + (idx % 53) * 15;
          const y = 30 + (day.getDay() || 7) * 18;
          const key = format(day, 'yyyy-MM-dd');
          const val = valueByDate[key] || 0;
          return (
            <g key={key}>
              <rect x={x} y={y} width="12" height="12" fill={color(val)} rx="2">
                <title>{`${key}: ${val} mm`}</title>
              </rect>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
