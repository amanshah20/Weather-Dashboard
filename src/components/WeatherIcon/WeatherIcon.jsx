import { getWeatherCodeMeta } from '../../utils/weather-codes';

function Sun() {
  return (
    <svg viewBox="0 0 120 120" className="wx-svg spin-slow" aria-hidden="true">
      <circle cx="60" cy="60" r="20" className="wx-core" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="60"
          y1="10"
          x2="60"
          y2="24"
          transform={`rotate(${i * 30} 60 60)`}
          className="wx-ray"
        />
      ))}
    </svg>
  );
}

function Cloud() {
  return (
    <svg viewBox="0 0 120 120" className="wx-svg drift" aria-hidden="true">
      <path d="M26 70c0-9 7-16 16-16 2 0 4 0 5 1 3-8 11-14 20-14 13 0 24 11 24 24v2h2c8 0 15 7 15 15s-7 15-15 15H32c-9 0-16-7-16-16s7-11 10-11z" className="wx-cloud" />
    </svg>
  );
}

function Rain() {
  return (
    <svg viewBox="0 0 120 120" className="wx-svg" aria-hidden="true">
      <path d="M26 60c0-9 7-16 16-16 2 0 4 0 5 1 3-8 11-14 20-14 13 0 24 11 24 24v2h2c8 0 15 7 15 15s-7 15-15 15H32c-9 0-16-7-16-16s7-11 10-11z" className="wx-cloud" />
      <circle cx="42" cy="92" r="4" className="wx-drop" />
      <circle cx="62" cy="98" r="4" className="wx-drop delay-1" />
      <circle cx="82" cy="92" r="4" className="wx-drop delay-2" />
    </svg>
  );
}

function Snow() {
  return (
    <svg viewBox="0 0 120 120" className="wx-svg" aria-hidden="true">
      <path d="M26 60c0-9 7-16 16-16 2 0 4 0 5 1 3-8 11-14 20-14 13 0 24 11 24 24v2h2c8 0 15 7 15 15s-7 15-15 15H32c-9 0-16-7-16-16s7-11 10-11z" className="wx-cloud" />
      <text x="42" y="98" className="wx-snow">✻</text>
      <text x="62" y="98" className="wx-snow">✻</text>
      <text x="82" y="98" className="wx-snow">✻</text>
    </svg>
  );
}

function Storm() {
  return (
    <svg viewBox="0 0 120 120" className="wx-svg" aria-hidden="true">
      <path d="M26 60c0-9 7-16 16-16 2 0 4 0 5 1 3-8 11-14 20-14 13 0 24 11 24 24v2h2c8 0 15 7 15 15s-7 15-15 15H32c-9 0-16-7-16-16s7-11 10-11z" className="wx-cloud" />
      <polygon points="62,75 52,100 64,100 58,116 78,90 66,90 74,75" className="wx-bolt" />
    </svg>
  );
}

export default function WeatherIcon({ code, size = 'lg' }) {
  const icon = getWeatherCodeMeta(code).icon;
  const byType = {
    sun: <Sun />,
    'sun-cloud': <Cloud />,
    'cloud-sun': <Cloud />,
    cloud: <Cloud />,
    mist: <Cloud />,
    drizzle: <Rain />,
    rain: <Rain />,
    snow: <Snow />,
    sleet: <Rain />,
    storm: <Storm />
  };

  return <div className={`weather-icon ${size}`}>{byType[icon] || <Cloud />}</div>;
}
