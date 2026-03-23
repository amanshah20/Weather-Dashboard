# AtmoSphere Pro

AtmoSphere Pro is a cyberpunk weather intelligence web app built with React + Vite + plain CSS.
It uses only free, no-key APIs and provides a fully responsive experience across Dashboard, Forecast, Historical, and Map View pages.

## Tech Stack

- React 18
- Vite 5
- Recharts
- React Leaflet + Leaflet
- date-fns
- Plain CSS design system (no Tailwind, no UI kits)

## API Sources

- Open-Meteo Forecast API
- Open-Meteo Air Quality API
- Open-Meteo Archive API
- Nominatim Forward + Reverse Geocoding
- CartoDB Dark Matter map tiles via Leaflet

## Setup

1. Install dependencies:
   - npm install
2. Start development server:
   - npm run dev
3. Build for production:
   - npm run build
4. Preview production build:
   - npm run preview

## Deploy

### Netlify

- npm install -g netlify-cli
- npm run build
- netlify deploy --prod --dir=dist

### Vercel

- Import this repository in Vercel and deploy.
- Build command: npm run build
- Output directory: dist
- Install command: npm install
- Vercel config is included in vercel.json for SPA rewrites.

CLI alternative:
- npm install -g vercel
- vercel
- vercel --prod

## Features Implemented

- Dark cyberpunk visual system with mesh gradients, dot-grid overlay, blur glass cards, glow borders, custom scrollbar, and staggered section animations.
- Sticky animated navbar with orbit logo, brand lockup, page tab pills, live city indicator, current clock, weather emoji, theme toggle, and compare toggle.
- Fullscreen animated GPS splash loader while geolocation resolves.
- GPS-first location workflow with automatic fallback to New Delhi when permission or location access fails.
- Debounced city autocomplete search powered by Nominatim with shared location state across all pages.
- Dashboard hero with animated weather icon, live temperature, feels-like, last-updated pulse, unit toggle, and manual refresh control.
- Auto-refresh weather every 10 minutes with live countdown timer.
- Rich stat cards for key current weather and air quality values (humidity ring, UV gauge, wind compass, sunrise/sunset/daylight, AQI, PM values).
- Date selector with previous, next, and today actions plus range constraints around forecast windows.
- Six interactive hourly chart cards with zoom controls, horizontal scroll, tooltips, references, and detail popup on point click.
- 48-hour timeline strip with hour cards, weather icons, rain probability, and arrow navigation.
- Sidebar intelligence widgets including moon phase, golden hour estimation, UV burn-time estimate, comfort index, and umbrella recommendation.
- Forecast page with horizontally scrollable 7-day cards, active glow state, range bars, UV badge, and animated icon per day.
- Forecast hourly detail table with sticky time column, value color coding, and responsive overflow behavior.
- Forecast mini sparkline row for temperature, rain probability, wind speed, and UV trend.
- Dynamic weather alert banners for high UV, strong wind, and heavy rain with dismiss interactions.
- Historical analysis page with validated date range inputs, quick presets, custom analyze action, and CSV export.
- Historical summary cards for hottest/coldest day, total rainfall, average temperature, max wind, and AQ placeholders.
- Historical charts for temperature trends, sun cycle timeline, wind speed trend, AQ multi-line with pollutant toggles.
- Custom SVG precipitation calendar heatmap component.
- Custom SVG wind rose chart for dominant direction distribution.
- Map View with Leaflet dark map, current location marker, click-to-select location, reverse geocode, and popup weather details.
- Nearby major cities lookup with parallel weather fetches via Promise.all and comparison table.
- Theme mode persistence using localStorage with dark/light variants.
- Error boundary around page visualizations for safer rendering in production.
- Performance footer with API timing and load timestamp.

## Notes

- Nominatim usage is debounced to reduce request frequency.
- In browser environments, the User-Agent header cannot be force-set by fetch due platform restrictions.
- Production build succeeds successfully with a large bundle warning; this can be reduced with route-based code splitting if desired.
