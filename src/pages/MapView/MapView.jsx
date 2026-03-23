import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { fetchNearbyCities, fetchWeatherAndAir, reverseGeocode } from '../../utils/api';
import WeatherIcon from '../../components/WeatherIcon/WeatherIcon';

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView([center.latitude, center.longitude], 8);
  }, [center, map]);
  return null;
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click: (e) => onPick(e.latlng)
  });
  return null;
}

export default function MapView({ location }) {
  const [picked, setPicked] = useState(null);
  const [pickedWeather, setPickedWeather] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [nearbyError, setNearbyError] = useState('');
  const [reloadNearbyTick, setReloadNearbyTick] = useState(0);
  const [layer, setLayer] = useState('Temperature');

  useEffect(() => {
    let active = true;
    const loadNearby = async () => {
      const lat = location?.lat ?? location?.latitude;
      const lon = location?.lon ?? location?.longitude;
      if (lat === undefined || lon === undefined || lat === null || lon === null) return;

      setLoadingNearby(true);
      setNearbyError('');
      try {
        const cities = await fetchNearbyCities({ latitude: lat, longitude: lon });
        const withWeather = await Promise.all(
          cities.map(async (city) => {
            const bundle = await fetchWeatherAndAir({
              latitude: city.latitude,
              longitude: city.longitude,
              date: new Date().toISOString().slice(0, 10)
            });
            return {
              ...city,
              temp: bundle.weather.current?.temperature_2m,
              humidity: bundle.weather.current?.relative_humidity_2m,
              wind: bundle.weather.current?.wind_speed_10m,
              code: bundle.weather.current?.weather_code,
              aqi: bundle.air.current?.european_aqi
            };
          })
        );
        if (active) setNearby(withWeather);
      } catch (err) {
        if (active) setNearbyError(err.message || 'Failed to load nearby cities');
      } finally {
        if (active) setLoadingNearby(false);
      }
    };

    loadNearby();
    return () => {
      active = false;
    };
  }, [location, reloadNearbyTick]);

  const onPickMap = async ({ lat, lng }) => {
    const [geo, bundle] = await Promise.all([
      reverseGeocode({ latitude: lat, longitude: lng }),
      fetchWeatherAndAir({ latitude: lat, longitude: lng, date: new Date().toISOString().slice(0, 10) })
    ]);

    setPicked({ latitude: lat, longitude: lng, city: geo?.address?.city || geo?.address?.town || 'Selected Location' });
    setPickedWeather(bundle.weather.current);
  };

  const layerButtons = ['Temperature', 'Rain', 'Wind', 'Clouds', 'Air Quality'];
  const center = location || { latitude: 28.6139, longitude: 77.209 };

  const markerColor = useMemo(
    () => (temp) => {
      if (temp <= 10) return 'var(--c-blue)';
      if (temp <= 22) return 'var(--c-teal)';
      if (temp <= 30) return 'var(--c-amber)';
      return 'var(--c-rose)';
    },
    []
  );

  return (
    <section className="page map-page">
      <section className="layer-row fade-in-up">
        {layerButtons.map((l) => (
          <button type="button" key={l} className={layer === l ? 'active' : ''} onClick={() => setLayer(l)}>{l}</button>
        ))}
      </section>

      <article className="glass-card map-shell fade-in-up">
        <MapContainer center={[center.latitude, center.longitude]} zoom={7} style={{ height: 500, width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <Recenter center={center} />
          <ClickHandler onPick={onPickMap} />

          <Marker position={[center.latitude, center.longitude]}>
            <Popup>Current location: {location?.city || 'Detected'}</Popup>
          </Marker>

          {picked && (
            <Marker position={[picked.latitude, picked.longitude]}>
              <Popup>
                <strong>{picked.city}</strong>
                {pickedWeather && <p>{Math.round(pickedWeather.temperature_2m)}°C, wind {Math.round(pickedWeather.wind_speed_10m)} km/h</p>}
              </Popup>
            </Marker>
          )}

          {nearby.map((city) => (
            <Marker key={`${city.city}-${city.latitude}`} position={[city.latitude, city.longitude]}>
              <Popup>
                <strong>{city.city}</strong>
                <p style={{ color: markerColor(city.temp) }}>{Math.round(city.temp)}°C</p>
                <WeatherIcon code={city.code} size="sm" />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </article>

      <section className="glass-card comparison-table fade-in-up">
        <h3>Nearby Cities Comparison</h3>
        {!!nearbyError && (
          <div>
            <p className="error-text">{nearbyError}</p>
            <button type="button" onClick={() => setReloadNearbyTick((v) => v + 1)}>Retry</button>
          </div>
        )}
        {loadingNearby ? (
          <div className="skeleton table" />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>City</th>
                  <th>Temp</th>
                  <th>Condition</th>
                  <th>Humidity</th>
                  <th>Wind</th>
                  <th>AQI</th>
                </tr>
              </thead>
              <tbody>
                {nearby.map((city) => (
                  <tr key={city.city}>
                    <td>{city.city}</td>
                    <td>{Math.round(city.temp)}°C</td>
                    <td><WeatherIcon code={city.code} size="sm" /></td>
                    <td>{Math.round(city.humidity)}%</td>
                    <td>{Math.round(city.wind)} km/h</td>
                    <td>{Math.round(city.aqi || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
