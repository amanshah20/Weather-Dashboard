import { differenceInMinutes, format } from 'date-fns';

export function cToF(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function toTemp(value, unit) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '--';
  const n = Number(value);
  return unit === 'F' ? `${Math.round(cToF(n))}°F` : `${Math.round(n)}°C`;
}

export function getMoonPhase(date = new Date()) {
  const synodicMonth = 29.53058867;
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const daysSince = (date - knownNewMoon) / 86400000;
  const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;

  if (phase < 1.84566) return 'New Moon';
  if (phase < 5.53699) return 'Waxing Crescent';
  if (phase < 9.22831) return 'First Quarter';
  if (phase < 12.91963) return 'Waxing Gibbous';
  if (phase < 16.61096) return 'Full Moon';
  if (phase < 20.30228) return 'Waning Gibbous';
  if (phase < 23.99361) return 'Last Quarter';
  if (phase < 27.68493) return 'Waning Crescent';
  return 'New Moon';
}

export function uvBurnTimeMinutes(uvIndex = 0) {
  if (uvIndex <= 0) return Infinity;
  return Math.max(8, Math.round(200 / uvIndex));
}

export function comfortIndex({ tempC, windKph, humidity }) {
  const t = Number(tempC);
  const v = Number(windKph);
  const h = Number(humidity);

  if (t <= 10 && v > 4.8) {
    const wc = 13.12 + 0.6215 * t - 11.37 * Math.pow(v, 0.16) + 0.3965 * t * Math.pow(v, 0.16);
    return { type: 'Wind Chill', value: Math.round(wc) };
  }

  if (t >= 27) {
    const hi =
      -8.784695 +
      1.61139411 * t +
      2.338549 * h +
      -0.14611605 * t * h +
      -0.012308094 * t * t +
      -0.016424828 * h * h +
      0.002211732 * t * t * h +
      0.00072546 * t * h * h +
      -0.000003582 * t * t * h * h;
    return { type: 'Heat Index', value: Math.round(hi) };
  }

  return { type: 'Comfort Temp', value: Math.round(t) };
}

export function goldenHourLabel(sunriseIso, sunsetIso) {
  if (!sunriseIso || !sunsetIso) return '--';
  const sunrise = new Date(sunriseIso);
  const sunset = new Date(sunsetIso);
  const morningEnd = new Date(sunrise.getTime() + 60 * 60 * 1000);
  const eveningStart = new Date(sunset.getTime() - 60 * 60 * 1000);

  return `${format(sunrise, 'HH:mm')} - ${format(morningEnd, 'HH:mm')} / ${format(eveningStart, 'HH:mm')} - ${format(sunset, 'HH:mm')}`;
}

export function daylightHours(sunriseIso, sunsetIso) {
  if (!sunriseIso || !sunsetIso) return '--';
  const mins = differenceInMinutes(new Date(sunsetIso), new Date(sunriseIso));
  return `${(mins / 60).toFixed(1)}h`;
}

export function umbrellaRecommendation(rainProbability = 0) {
  if (rainProbability >= 70) return 'Take a sturdy umbrella.';
  if (rainProbability >= 40) return 'Carry a foldable umbrella.';
  return 'No umbrella needed right now.';
}

export function formatClock(d = new Date()) {
  return format(d, 'HH:mm:ss');
}
