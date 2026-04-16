# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start            # Start Expo dev server
npm run ios          # Run on iOS Simulator
npm run android      # Run on Android Emulator
npm run web          # Run in browser (phone frame centered on desktop)
npm test             # Run tests (single pass, --runInBand)
npm run test:watch   # Run tests in watch mode
```

After installing or updating native modules, rebuild with `npx expo prebuild --clean` before running iOS/Android.

There is no linter configured — TypeScript strict mode is the primary code quality gate.

## Architecture

The app is a feature-based React Native (Expo) weather app with a clean separation between infrastructure and domain code.

```
src/
├── app/             # Root component, providers, error boundary
├── components/      # Shared primitives (MetricPill)
├── features/weather/
│   ├── api/         # Provider adapters, mappers, registry
│   ├── hooks/       # useWeather (TanStack Query + Zustand gating)
│   ├── model/       # WeatherData domain types + Zod validation
│   └── ui/          # WeatherScreen and sub-components
├── hooks/           # useNetworkStatus
├── store/           # Zustand weather preferences store
├── theme/           # Per-provider color themes
├── test/            # renderWithProviders, createTestQueryClient
└── utils/           # fetchJson, temperature formatting, weather icons
```

### Provider / Adapter Pattern

Three weather sources (Open-Meteo, wttr.in, MET Norway) implement the `WeatherProvider` interface. Each lives in `src/features/weather/api/providers/` and delegates normalization to a mapper in `src/features/weather/api/mappers/`. A `weatherProviderRegistry` object maps `WeatherProviderId` strings to provider instances. Adding a provider requires only a new adapter + mapper + registry entry + theme.

`fetchJson` accepts an optional `{ headers }` second argument — used by MET Norway to send the required `User-Agent` header.

### State Layers

| Layer | Tool | Persisted |
|---|---|---|
| User preferences (provider, location, history, unit) | Zustand + AsyncStorage | Yes |
| Weather data | TanStack Query (staleTime: 5 min) | In-memory |
| UI state (input, errors, focus) | `useState` | No |

`useWeather` is gated on `hasHydrated` from Zustand to prevent duplicate fetches before AsyncStorage rehydration completes at startup.

### Data Flow

```
User input → Zod validation (parseLocationInput)
  → Zustand: setLastSearchedLocation + addToLocationHistory
  → useWeather → TanStack Query → provider.getWeather()
    → fetchJson (10s timeout, 2 retries with backoff, no retry on 4xx/5xx)
    → Adapter → Mapper → WeatherData
```

### Path Aliases

`@/` maps to `src/`. Configured in three places so all tools agree:
- `babel.config.js` — `babel-plugin-module-resolver` (Metro runtime)
- `tsconfig.json` — `paths: { "@/*": ["src/*"] }` (TypeScript)
- `jest.config.js` — `moduleNameMapper` (Jest)

### Geolocation

Permission → GPS coordinates → BigDataCloud reverse geocode (no key needed) → city name for display/history, raw `"lat,lon"` string sent to adapters. Open-Meteo and MET Norway adapters detect `"lat,lon"` input and skip their internal geocoding step.

### Hourly Forecast

`ForecastDay.hourly?: HourlyEntry[]` carries per-hour data. Open-Meteo fetches `&hourly=temperature_2m,weather_code,wind_speed_10m`; MET Norway parses its timeseries. wttr.in provides no hourly data. `ForecastList` shows today expanded by default, filters past hours for today, and suppresses the expand chevron when `hourly` is empty.

### Web Layout

On desktop browsers the app renders inside a 430 px phone frame. Implemented in `src/app/App.tsx` via `Platform.OS !== 'web'` check. Native builds are unaffected.

## Testing

- `renderWithProviders()` in `src/test/renderWithProviders.tsx` wraps components in `QueryClientProvider` with a no-cache `QueryClient`.
- Inject a custom `registry` prop into `useWeather` / `WeatherScreen` to mock providers without real network calls.
- Global mocks in `jest.setup.ts`: AsyncStorage (in-memory), expo-network (always connected), expo-location (granted + mock coords).
- Wrap Zustand store mutations in `act()`, use `waitFor()` for async query assertions.
