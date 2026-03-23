import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchForecastBundle, fetchWeatherAndAir } from '../utils/api';

export function useWeather(location) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [data, setData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [responseMs, setResponseMs] = useState(0);
  const [refreshCountdown, setRefreshCountdown] = useState(600);

  const load = useCallback(async () => {
    const lat = location?.lat ?? location?.latitude;
    const lon = location?.lon ?? location?.longitude;
    if (lat === undefined || lon === undefined || lat === null || lon === null) return;

    setLoading(true);
    setError('');
    try {
      const [current, forecast] = await Promise.all([
        fetchWeatherAndAir({
          latitude: lat,
          longitude: lon,
          date,
          forecastDays: 7
        }),
        fetchForecastBundle({
          latitude: lat,
          longitude: lon,
          forecastDays: 7
        })
      ]);

      setData(current);
      setForecastData(forecast);
      setResponseMs(current.responseMs + forecast.responseMs);
      setLastUpdated(new Date());
      setRefreshCountdown(600);
    } catch (err) {
      console.error('Fetch failed:', err);
      setError(err.message || 'Unable to fetch weather');
    } finally {
      setLoading(false);
    }
  }, [date, location]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          load();
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [load]);

  const countdownLabel = useMemo(() => {
    const mins = Math.floor(refreshCountdown / 60);
    const secs = refreshCountdown % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }, [refreshCountdown]);

  return {
    date,
    setDate,
    data,
    forecastData,
    loading,
    error,
    lastUpdated,
    responseMs,
    countdownLabel,
    refreshNow: load
  };
}
