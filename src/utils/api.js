import { format } from 'date-fns';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

function toQuery(params) {
  return new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)])
  ).toString();
}

async function fetchJson(url) {
  const headers = { Accept: 'application/json' };
  if (typeof window === 'undefined') {
    headers['User-Agent'] = 'AtmoSphere/1.0';
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function normalizeDateInput(value) {
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date();
  return parsed;
}

function aggregateAirDailyFromHourly(air) {
  const times = air?.hourly?.time || [];
  const pm10 = air?.hourly?.pm10 || [];
  const pm25 = air?.hourly?.pm2_5 || [];
  const byDate = new Map();

  times.forEach((time, index) => {
    const day = String(time).split('T')[0];
    const current = byDate.get(day) || { pm10: [], pm2_5: [] };
    const p10 = pm10[index];
    const p25 = pm25[index];
    if (typeof p10 === 'number') current.pm10.push(p10);
    if (typeof p25 === 'number') current.pm2_5.push(p25);
    byDate.set(day, current);
  });

  const dailyTime = Array.from(byDate.keys());
  return {
    time: dailyTime,
    pm10: dailyTime.map((day) => {
      const values = byDate.get(day)?.pm10 || [];
      return values.length ? Math.max(...values) : null;
    }),
    pm2_5: dailyTime.map((day) => {
      const values = byDate.get(day)?.pm2_5 || [];
      return values.length ? Math.max(...values) : null;
    })
  };
}

export async function fetchCurrentWeather(lat, lon, date) {
  if (lat === undefined || lon === undefined || lat === null || lon === null) {
    throw new Error('Latitude and longitude are required');
  }

  const dateStr = format(normalizeDateInput(date), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');

  const weatherBase = dateStr < today ? ARCHIVE_URL : FORECAST_URL;

  const weatherURL = `${weatherBase}?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,relative_humidity_2m,precipitation,` +
    `visibility,wind_speed_10m,apparent_temperature,dew_point_2m,` +
    `cloud_cover,surface_pressure,uv_index,weather_code,wind_direction_10m,wind_gusts_10m,precipitation_probability` +
    `&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,` +
    `uv_index_max,precipitation_sum,precipitation_probability_max,` +
    `wind_speed_10m_max,wind_direction_10m_dominant,weather_code` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,` +
    `precipitation,wind_speed_10m,surface_pressure,cloud_cover,weather_code,wind_direction_10m,wind_gusts_10m` +
    `&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`;

  const airURL = `${AIR_URL}` +
    `?latitude=${lat}&longitude=${lon}` +
    `&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,european_aqi` +
    `&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,european_aqi` +
    `&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`;

  const [weatherRes, airRes] = await Promise.all([
    fetch(weatherURL),
    fetch(airURL)
  ]);

  if (!weatherRes.ok) throw new Error(`Weather API error: ${weatherRes.status}`);
  if (!airRes.ok) throw new Error(`Air API error: ${airRes.status}`);

  const [weather, air] = await Promise.all([
    weatherRes.json(),
    airRes.json()
  ]);

  return { weather, air };
}

export async function fetchHistoricalWeather(lat, lon, startDate, endDate) {
  if (lat === undefined || lon === undefined || lat === null || lon === null) {
    throw new Error('Latitude and longitude are required');
  }

  const startStr = format(normalizeDateInput(startDate), 'yyyy-MM-dd');
  const endStr = format(normalizeDateInput(endDate), 'yyyy-MM-dd');

  const weatherURL = `${ARCHIVE_URL}` +
    `?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,` +
    `sunrise,sunset,precipitation_sum,wind_speed_10m_max,` +
    `wind_direction_10m_dominant` +
    `&timezone=auto&start_date=${startStr}&end_date=${endStr}`;

  const airURL = `${AIR_URL}` +
    `?latitude=${lat}&longitude=${lon}` +
    `&hourly=pm10,pm2_5` +
    `&timezone=auto&start_date=${startStr}&end_date=${endStr}`;

  const [weatherRes, airRes] = await Promise.all([
    fetch(weatherURL),
    fetch(airURL)
  ]);

  if (!weatherRes.ok) throw new Error(`Weather API error: ${weatherRes.status}`);
  if (!airRes.ok) throw new Error(`Air API error: ${airRes.status}`);

  const [weather, air] = await Promise.all([
    weatherRes.json(),
    airRes.json()
  ]);

  const normalizedAir = air?.daily?.time?.length
    ? air
    : {
        ...air,
        daily: aggregateAirDailyFromHourly(air)
      };

  if (!weather.daily?.time?.length) {
    throw new Error('No historical data returned for this date range');
  }

  return { weather, air: normalizedAir };
}

export async function fetchWeatherAndAir({ latitude, longitude, date }) {
  const weatherAir = await fetchCurrentWeather(latitude, longitude, date);
  return {
    ...weatherAir,
    responseMs: 0
  };
}

export async function fetchForecastBundle({ latitude, longitude, forecastDays = 7 }) {
  const weatherUrl = `${FORECAST_URL}?${toQuery({
    latitude,
    longitude,
    timezone: 'auto',
    forecast_days: forecastDays,
    current: 'temperature_2m,weather_code,is_day,relative_humidity_2m,wind_speed_10m,wind_direction_10m',
    hourly: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,precipitation,cloud_cover,visibility,wind_speed_10m,uv_index,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,weather_code'
  })}`;

  const airUrl = `${AIR_URL}?${toQuery({
    latitude,
    longitude,
    timezone: 'auto',
    hourly: 'pm10,pm2_5,european_aqi,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide',
    current: 'pm10,pm2_5,european_aqi,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide'
  })}`;

  const [weather, air] = await Promise.all([fetchJson(weatherUrl), fetchJson(airUrl)]);
  return { weather, air, responseMs: 0 };
}

export async function fetchHistoricalData({ latitude, longitude, startDate, endDate }) {
  const data = await fetchHistoricalWeather(latitude, longitude, startDate, endDate);
  return {
    ...data,
    responseMs: 0
  };
}

export async function reverseGeocode({ latitude, longitude }) {
  const url = `${NOMINATIM_BASE}/reverse?${toQuery({
    lat: latitude,
    lon: longitude,
    format: 'json',
    addressdetails: 1,
    zoom: 12
  })}`;

  return fetchJson(url);
}

export async function searchPlaces(query) {
  const url = `${NOMINATIM_BASE}/search?${toQuery({
    q: query,
    format: 'json',
    addressdetails: 1,
    limit: 5
  })}`;

  return fetchJson(url);
}

export async function fetchNearbyCities({ latitude, longitude }) {
  const delta = 2;
  const viewbox = [longitude - delta, latitude + delta, longitude + delta, latitude - delta].join(',');
  const url = `${NOMINATIM_BASE}/search?${toQuery({
    q: 'city',
    format: 'json',
    bounded: 1,
    viewbox,
    limit: 8,
    addressdetails: 1
  })}`;
  const data = await fetchJson(url);

  return data
    .filter((item) => item?.lat && item?.lon)
    .slice(0, 5)
    .map((item) => ({
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      city: item.address?.city || item.address?.town || item.address?.village || item.display_name.split(',')[0],
      country: item.address?.country || ''
    }));
}
