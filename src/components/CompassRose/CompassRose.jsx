export default function CompassRose({ degree = 0 }) {
  return (
    <div className="compass-wrap">
      <svg viewBox="0 0 100 100" className="compass-rose" role="img" aria-label="Wind direction compass">
        <circle cx="50" cy="50" r="46" className="compass-circle" />
        <text x="50" y="14" textAnchor="middle" className="mono compass-text">N</text>
        <text x="50" y="96" textAnchor="middle" className="mono compass-text">S</text>
        <text x="8" y="54" textAnchor="middle" className="mono compass-text">W</text>
        <text x="92" y="54" textAnchor="middle" className="mono compass-text">E</text>
        <g transform={`translate(50 50) rotate(${degree})`}>
          <polygon points="0,-34 6,8 0,2 -6,8" className="compass-pointer" />
        </g>
      </svg>
      <p className="mono">{Math.round(degree)}°</p>
    </div>
  );
}
