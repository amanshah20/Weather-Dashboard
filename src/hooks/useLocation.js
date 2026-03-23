import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { searchPlaces } from '../utils/api';

function toLocationModel({ lat, lon, name }) {
  const [cityPart, countryPart = ''] = String(name || '').split(',').map((s) => s.trim());
  return {
    lat,
    lon,
    latitude: lat,
    longitude: lon,
    city: cityPart || 'Unknown',
    country: countryPart,
    name: name || 'Unknown'
  };
}

function parseAddress(address = {}) {
  return {
    city: address.city || address.town || address.village || address.hamlet || 'Unknown City',
    state: address.state || address.county || '',
    country: address.country || '',
    district: address.suburb || address.city_district || address.neighbourhood || ''
  };
}

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let active = true;

    const fallback = () => {
      if (!active) return;
      const value = toLocationModel({ lat: 28.6139, lon: 77.2090, name: 'New Delhi, India' });
      setLocation(value);
      setLoadingLocation(false);
    };

    try {
      if (!navigator.geolocation) {
        fallback();
        return () => {
          active = false;
        };
      }

      const timer = setTimeout(() => {
        fallback();
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          clearTimeout(timer);
          if (!active) return;

          const { latitude: lat, longitude: lon } = pos.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
              { headers: { 'User-Agent': 'AtmoSphere/1.0' } }
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
            const country = data.address?.country_code?.toUpperCase() || '';
            setLocation(toLocationModel({ lat, lon, name: `${city}, ${country}` }));
          } catch {
            setLocation(toLocationModel({ lat, lon, name: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E` }));
          }
          setLoadingLocation(false);
        },
        () => {
          clearTimeout(timer);
          fallback();
          setLoadingLocation(false);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );

      return () => {
        active = false;
        clearTimeout(timer);
      };
    } catch {
      fallback();
      return () => {
        active = false;
      };
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchPlaces(searchTerm.trim());
        setSearchResults(data.slice(0, 5));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchTerm]);

  const selectSearchResult = useCallback((item) => {
    const address = parseAddress(item.address);
    const lat = Number(item.lat);
    const lon = Number(item.lon);
    setLocation({
      lat,
      lon,
      latitude: lat,
      longitude: lon,
      name: `${address.city || 'Unknown'}, ${address.country || ''}`,
      ...address
    });
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  const breadcrumb = useMemo(() => {
    if (!location) return '';
    return [location.city, location.state, location.country].filter(Boolean).join(', ');
  }, [location]);

  return {
    location,
    loading: loadingLocation,
    loadingLocation,
    searchTerm,
    setSearchTerm,
    searchResults,
    searching,
    selectSearchResult,
    breadcrumb,
    setLocation
  };
}
