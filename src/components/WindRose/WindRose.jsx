export default function WindRose({ directions = [] }) {
  const bins = [
    { key: 'N', min: 337.5, max: 360 },
    { key: 'NE', min: 22.5, max: 67.5 },
    { key: 'E', min: 67.5, max: 112.5 },
    { key: 'SE', min: 112.5, max: 157.5 },
    { key: 'S', min: 157.5, max: 202.5 },
    { key: 'SW', min: 202.5, max: 247.5 },
    { key: 'W', min: 247.5, max: 292.5 },
    { key: 'NW', min: 292.5, max: 337.5 }
  ];

  const counts = bins.map((bin) => {
    const count = directions.filter((d) =>
      bin.key === 'N' ? d >= bin.min || d < 22.5 : d >= bin.min && d < bin.max
    ).length;
    return { ...bin, count };
  });

  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <article className="glass-card wind-rose-card fade-in-up">
      <h3>Dominant Wind Rose</h3>
      <svg viewBox="0 0 260 260" className="wind-rose-svg">
        <circle cx="130" cy="130" r="100" className="rose-base" />
        {counts.map((c, idx) => {
          const angle = idx * 45 - 90;
          const length = 20 + (c.count / max) * 70;
          return (
            <g key={c.key} transform={`translate(130 130) rotate(${angle})`}>
              <rect x="0" y="-6" width={length} height="12" rx="6" className="rose-bar" />
              <text x={95} y={4} className="mono rose-label">{c.key}</text>
            </g>
          );
        })}
      </svg>
    </article>
  );
}
