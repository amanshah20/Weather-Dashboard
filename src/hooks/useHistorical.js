import { format, subDays, subMonths, subYears } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchHistoricalData } from '../utils/api';

const today = format(new Date(), 'yyyy-MM-dd');

const PRESETS = {
  'Last 7 days': [format(subDays(new Date(), 7), 'yyyy-MM-dd'), today],
  'Last 30 days': [format(subDays(new Date(), 30), 'yyyy-MM-dd'), today],
  'Last 3 months': [format(subMonths(new Date(), 3), 'yyyy-MM-dd'), today],
  'Last 6 months': [format(subMonths(new Date(), 6), 'yyyy-MM-dd'), today],
  'Last Year': [format(subYears(new Date(), 1), 'yyyy-MM-dd'), today]
};

export function useHistorical(location) {
  const [startDate, setStartDate] = useState(PRESETS['Last 30 days'][0]);
  const [endDate, setEndDate] = useState(PRESETS['Last 30 days'][1]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const setPreset = useCallback((label) => {
    const preset = PRESETS[label];
    if (preset) {
      setStartDate(preset[0]);
      setEndDate(preset[1]);
    }
  }, []);

  const validate = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const maxSpan = 365 * 2 * 86400000;

    if (Number.isNaN(start) || Number.isNaN(end)) return 'Dates are invalid.';
    if (end < start) return 'End date must be after start date.';
    if (end > new Date()) return 'Future dates are not allowed.';
    if (end - start > maxSpan) return 'Maximum range is 2 years.';
    return '';
  }, [startDate, endDate]);

  const analyze = useCallback(async () => {
    const lat = location?.lat ?? location?.latitude;
    const lon = location?.lon ?? location?.longitude;
    if (lat === undefined || lon === undefined || lat === null || lon === null || validate) return;

    setLoading(true);
    setError('');
    try {
      const data = await fetchHistoricalData({
        latitude: lat,
        longitude: lon,
        startDate,
        endDate
      });
      setResult(data);
    } catch (err) {
      console.error('Fetch failed:', err);
      setError(err.message || 'Could not fetch historical data');
    } finally {
      setLoading(false);
    }
  }, [endDate, location, startDate, validate]);

  useEffect(() => {
    const lat = location?.lat ?? location?.latitude;
    const lon = location?.lon ?? location?.longitude;
    if (lat === undefined || lon === undefined || lat === null || lon === null) return;
    analyze();
  }, [analyze, location]);

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setPreset,
    presets: Object.keys(PRESETS),
    loading,
    result,
    error,
    validate,
    analyze
  };
}
