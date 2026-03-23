export default function HumidityRing({ value = 0 }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <svg className="humidity-ring" viewBox="0 0 100 100" role="img" aria-label="Humidity ring">
      <circle cx="50" cy="50" r={radius} className="ring-bg" />
      <circle
        cx="50"
        cy="50"
        r={radius}
        className="ring-fg"
        style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
      />
      <text x="50" y="56" textAnchor="middle" className="mono ring-text">
        {Math.round(value)}%
      </text>
    </svg>
  );
}
