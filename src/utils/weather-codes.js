const baseCodes = Object.fromEntries(
  Array.from({ length: 100 }, (_, code) => [
    code,
    {
      code,
      label: 'Unknown Conditions',
      icon: 'mist',
      severity: 'info'
    }
  ])
);

const namedCodes = {
  0: { label: 'Clear Sky', icon: 'sun', severity: 'good' },
  1: { label: 'Mainly Clear', icon: 'sun-cloud', severity: 'good' },
  2: { label: 'Partly Cloudy', icon: 'cloud-sun', severity: 'good' },
  3: { label: 'Overcast', icon: 'cloud', severity: 'info' },
  45: { label: 'Fog', icon: 'mist', severity: 'warn' },
  48: { label: 'Depositing Rime Fog', icon: 'mist', severity: 'warn' },
  51: { label: 'Light Drizzle', icon: 'drizzle', severity: 'info' },
  53: { label: 'Moderate Drizzle', icon: 'drizzle', severity: 'warn' },
  55: { label: 'Dense Drizzle', icon: 'drizzle', severity: 'warn' },
  56: { label: 'Light Freezing Drizzle', icon: 'sleet', severity: 'warn' },
  57: { label: 'Dense Freezing Drizzle', icon: 'sleet', severity: 'danger' },
  61: { label: 'Slight Rain', icon: 'rain', severity: 'info' },
  63: { label: 'Moderate Rain', icon: 'rain', severity: 'warn' },
  65: { label: 'Heavy Rain', icon: 'rain', severity: 'danger' },
  66: { label: 'Light Freezing Rain', icon: 'sleet', severity: 'warn' },
  67: { label: 'Heavy Freezing Rain', icon: 'sleet', severity: 'danger' },
  71: { label: 'Slight Snowfall', icon: 'snow', severity: 'warn' },
  73: { label: 'Moderate Snowfall', icon: 'snow', severity: 'warn' },
  75: { label: 'Heavy Snowfall', icon: 'snow', severity: 'danger' },
  77: { label: 'Snow Grains', icon: 'snow', severity: 'warn' },
  80: { label: 'Slight Rain Showers', icon: 'rain', severity: 'warn' },
  81: { label: 'Moderate Rain Showers', icon: 'rain', severity: 'warn' },
  82: { label: 'Violent Rain Showers', icon: 'storm', severity: 'danger' },
  85: { label: 'Slight Snow Showers', icon: 'snow', severity: 'warn' },
  86: { label: 'Heavy Snow Showers', icon: 'snow', severity: 'danger' },
  95: { label: 'Thunderstorm', icon: 'storm', severity: 'danger' },
  96: { label: 'Thunderstorm with Slight Hail', icon: 'storm', severity: 'danger' },
  99: { label: 'Thunderstorm with Heavy Hail', icon: 'storm', severity: 'danger' }
};

Object.entries(namedCodes).forEach(([code, meta]) => {
  baseCodes[code] = { ...baseCodes[code], ...meta };
});

export const WMO_CODES = baseCodes;

export function getWeatherCodeMeta(code = 0) {
  return WMO_CODES[code] || WMO_CODES[0];
}

export function weatherEmoji(code = 0) {
  const icon = getWeatherCodeMeta(code).icon;
  const map = {
    sun: '☀️',
    'sun-cloud': '🌤️',
    'cloud-sun': '⛅',
    cloud: '☁️',
    mist: '🌫️',
    drizzle: '🌦️',
    rain: '🌧️',
    snow: '❄️',
    sleet: '🌨️',
    storm: '⛈️'
  };
  return map[icon] || '🌡️';
}
