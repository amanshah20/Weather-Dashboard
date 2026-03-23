export default function UVGauge({ value = 0 }) {
  const v = Math.max(0, Math.min(12, Number(value) || 0));
  const angle = (v / 12) * 180 - 90;
  const level = v >= 8 ? 'high' : v >= 5 ? 'moderate' : 'low';

  return (
    <div className={`uv-gauge ${level}`}>
      <svg viewBox="0 0 200 120" role="img" aria-label="UV Gauge">
        <path d="M 20 100 A 80 80 0 0 1 180 100" className="uv-track" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" className="uv-fill" style={{ strokeDasharray: `${(v / 12) * 251} 251` }} />
        <g transform="translate(100 100)">
          <line x1="0" y1="0" x2="0" y2="-68" transform={`rotate(${angle})`} className="uv-needle" />
          <circle r="5" className="uv-center" />
        </g>
      </svg>
      <p className="mono">UV {v.toFixed(1)}</p>
    </div>
  );
}
