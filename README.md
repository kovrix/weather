# Weather Provider App

Production-style Expo + React Native weather app with modular provider adapters, Zustand state, TanStack Query server state, Zod validation, and Jest coverage.

<p align="center">
    <img src="assets/screenshots/ios-sim-open-meteo.png" alt="Weather app iOS preview Open-Meteo" width="44%" />
    <img src="assets/screenshots/ios-sim-wttr.png" alt="Weather app iOS preview wttr.in" width="44%" />
</p>

---

## Table of Contents

- [Quick Start](#quick-start)
- [Local Setup](#local-setup)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Path Aliases](#path-aliases)
- [Fetch Resilience](#fetch-resilience)
- [Error Boundary](#error-boundary)
- [Weather Icons](#weather-icons)
- [Adding a New Provider](#adding-a-new-provider)
- [Testing](#testing)
- [File Tree](#file-tree)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
npm install
npm start
# press i for iOS simulator, a for Android emulator, w for web
```

---

## Local Setup

### Prerequisites

- Node.js 22 LTS (recommended)
- npm 10+
- Xcode — for iOS Simulator on macOS
- Android Studio + Android SDK — for Android emulator
- Expo CLI is not required globally; all commands use `npx` or project scripts

Check your versions:

```bash
node -v
npm -v
```

If you are using a non-LTS Node version and see engine warnings, switch to Node 22 LTS to avoid tooling incompatibilities.

### Install Dependencies

```bash
npm install
```

### Start the Dev Server

```bash
npm start
```

### Run on a Target

```bash
npm run ios      # iOS Simulator (macOS only)
npm run android  # Android Emulator
npm run web      # Web browser
```

### Run Tests

```bash
npm test
```

---

## Architecture

The project follows a **feature-based, modular architecture**. All weather domain code lives under `src/features/weather/` and is subdivided by concern. Shared infrastructure sits in `src/`.

```
src/
├── app/                    # App root, providers, error boundary
├── components/             # Shared UI primitives
├── features/
│   └── weather/
│       ├── api/            # Adapter + mapper pattern
│       │   ├── mappers/    # Normalize raw API responses → WeatherData
│       │   ├── providers/  # HTTP adapters implementing WeatherProvider
│       │   └── providerRegistry.ts
│       ├── hooks/          # useWeather — composes store + TanStack Query
│       ├── model/          # TypeScript types, Zod validation, interfaces
│       └── ui/             # Screen + feature components
├── store/                  # Zustand store (user preferences)
├── theme/                  # Per-provider gradient and color themes
├── test/                   # Test helpers and test suites
└── utils/                  # fetchJson, weatherIcons
```

### Key Patterns

**Adapter pattern** — each provider (Open-Meteo, wttr.in) implements the `WeatherProvider` interface. Consumers never reference a concrete adapter directly; they go through the `weatherProviderRegistry`. Adding a third provider means creating one adapter file and one mapper file — nothing else changes.

**Mapper pattern** — adapters delegate response normalization to a dedicated mapper function. The mapper converts the provider-specific shape into the shared `WeatherData` domain model. This keeps adapters thin and mappers independently testable.

**Registry pattern** — `weatherProviderRegistry` is a plain object keyed by `WeatherProviderId`. It acts as a lightweight service locator. Tests inject a custom registry to avoid real network calls.

---

## Data Flow

```
User types location → presses "Search Weather"
  │
  ├─ parseLocationInput()     Zod validation (trim, min/max length, character set)
  │   └─ on failure: show inline error, abort
  │
  ├─ setLastSearchedLocation  Persisted to AsyncStorage via Zustand
  │
  └─ useWeather hook
      ├─ Reads selectedProvider + lastSearchedLocation from Zustand store
      ├─ Waits for hasHydrated = true (prevents duplicate startup fetches)
      └─ TanStack Query → provider.getWeather({ location })
          ├─ fetchJson()          HTTP GET with 10s timeout + 2 retries
          ├─ Adapter maps raw response via mapper function
          └─ Returns WeatherData  Cached for 5 minutes (staleTime)
```

On startup, `AppProviders` calls `hydrateWeatherPreferencesStore()` which reads `selectedProvider` and `lastSearchedLocation` from AsyncStorage. The query is gated on `hasHydrated`, so the app automatically re-fetches the last searched location after hydration — without triggering a duplicate fetch before it completes.

---

## State Management

Two state layers work independently and complement each other:

| Layer | Tool | What it stores | Persisted |
|---|---|---|---|
| User preferences | Zustand + AsyncStorage | `selectedProvider`, `lastSearchedLocation`, `hasHydrated` | Yes |
| Server state | TanStack Query | `WeatherData` per `[provider, location]` key | In-memory (5 min) |
| UI state | React `useState` | Location text input, validation error message | No |

The Zustand store exposes `setSelectedProvider`, `setLastSearchedLocation`, and `setHasHydrated`. The hydration flag is set to `true` inside `hydrateWeatherPreferencesStore` after AsyncStorage resolves — this is the signal that enables the TanStack Query fetch.

---

## Path Aliases

All cross-boundary imports use the `@/` alias which maps to `src/`. This is configured in three places so that Metro (runtime), TypeScript (types), and Jest (tests) all agree:

| Config file | Setting |
|---|---|
| `babel.config.js` | `babel-plugin-module-resolver` with `alias: { "@": "./src" }` |
| `tsconfig.json` | `"baseUrl": ".", "paths": { "@/*": ["src/*"] }` |
| `jest.config.js` | `moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" }` |

**Usage:**

```ts
// Instead of:
import { fetchJson } from "../../../../utils/fetchJson";
import type { ProviderTheme } from "../../../theme/providerThemes";

// Write:
import { fetchJson } from "@/utils/fetchJson";
import type { ProviderTheme } from "@/theme/providerThemes";
```

Single-level relative imports within the same folder (e.g. `./WeatherCard`, `../model/types`) are kept as-is — they are already readable.

---

## Fetch Resilience

`src/utils/fetchJson.ts` is the single HTTP utility used by all provider adapters. It provides:

- **10-second timeout** — each attempt is wrapped in an `AbortController`. If the server does not respond within 10 seconds the request is aborted and a clear error is thrown.
- **2 automatic retries** — on network errors or timeouts, the request is retried up to twice with an increasing delay (500ms, then 1000ms). HTTP errors (4xx, 5xx) are not retried — they represent a definitive server response.

```ts
// Retry policy at a glance
attempt 0: immediate
attempt 1: wait 500ms  (network/timeout failures only)
attempt 2: wait 1000ms (network/timeout failures only)
```

This means a user on a flaky mobile connection gets silent recovery for transient blips, while a bad location name (404) still surfaces an error immediately.

---

## Error Boundary

`src/app/ErrorBoundary.tsx` is a React class component that catches any unhandled JavaScript errors thrown during render. It wraps the entire app in `App.tsx`:

```tsx
<ErrorBoundary>
  <AppProviders>
    <WeatherScreen />
  </AppProviders>
</ErrorBoundary>
```

When an error is caught:
- The error is logged to the console with its component stack.
- A fallback screen is shown with the error message and a **Try again** button.
- Pressing **Try again** resets `hasError` to `false`, which re-mounts the children and gives the app a chance to recover.

This prevents the entire app from going blank on unexpected throws (e.g. a null-dereference in a component or an unhandled promise rejection that bubbles to the render tree).

---

## Weather Icons

`src/utils/weatherIcons.ts` is the single source of truth for mapping weather condition strings to visual representations. It exports two functions:

```ts
// Returns a MaterialCommunityIcons glyph name — used by WeatherCard and ForecastList
getWeatherIconName(condition: string): IconName

// Returns an emoji string — used by the wttr.in mapper
mapConditionToEmoji(condition: string): string
```

Both functions match against lowercased substrings (`thunder`, `snow`, `rain`, `drizzle`, `shower`, `fog`, `mist`, `cloud`, `overcast`, `clear`, `sun`, `hail`, `blizzard`) and fall back to a partly-cloudy icon/emoji for unrecognised conditions.

Before this utility existed, identical matching logic was duplicated in `WeatherCard.tsx`, `ForecastList.tsx`, and `wttrMapper.ts`. Any change to icon mapping now happens in one place.

### Open-Meteo WMO Weather Codes

`openMeteoMapper.ts` maps WMO weather interpretation codes to labels and emoji icons. The full set of 28 codes is covered:

| Code range | Conditions |
|---|---|
| 0–3 | Clear sky → Overcast |
| 45, 48 | Fog, rime fog |
| 51–57 | Drizzle (light/moderate/dense), freezing drizzle |
| 61–67 | Rain (slight/moderate/heavy), freezing rain |
| 71–77 | Snow (slight/moderate/heavy), snow grains |
| 80–82 | Rain showers (slight/moderate/violent) |
| 85–86 | Snow showers (slight/heavy) |
| 95, 96, 99 | Thunderstorm, thunderstorm with hail |

Any code not in this table falls back to `"Unknown conditions ☁️"` — but with full WMO coverage this should never occur in practice.

---

## Adding a New Provider

1. Create `src/features/weather/api/providers/myProviderAdapter.ts` implementing `WeatherProvider`:

```ts
import { fetchJson } from "@/utils/fetchJson";
import type { WeatherProvider } from "@/features/weather/model/provider";

export class MyProviderAdapter implements WeatherProvider {
  readonly id = "myProvider" as const;
  readonly displayName = "My Provider";

  async getWeather(params: { location: string }) {
    const data = await fetchJson<MyApiResponse>(`https://api.example.com/...`);
    return { provider: this.id, ...mapMyProviderResponse(data) };
  }
}
```

2. Create `src/features/weather/api/mappers/myProviderMapper.ts` that converts the raw API shape to `Omit<WeatherData, "provider">`.

3. Register the adapter in `src/features/weather/api/providerRegistry.ts`:

```ts
export const weatherProviderRegistry: WeatherProviderRegistry = {
  openMeteo: new OpenMeteoAdapter(),
  wttr: new WttrAdapter(),
  myProvider: new MyProviderAdapter(),   // add this line
};
```

4. Add the new provider id and label to `WEATHER_PROVIDER_OPTIONS` in `src/features/weather/model/types.ts`.

5. Add a theme entry in `src/theme/providerThemes.ts`.

No changes required anywhere else — the `ProviderToggle`, `useWeather`, and `WeatherScreen` components all read from the registry dynamically.

---

## Testing

Tests live in `src/test/` and use `jest-expo` + `@testing-library/react-native`.

```bash
npm test
```

### Test helpers

| File | Purpose |
|---|---|
| `createTestQueryClient.ts` | Returns a `QueryClient` with `gcTime: 0` — disables caching between tests |
| `renderWithProviders.tsx` | Wraps components in `QueryClientProvider` for UI tests |

### Test suites

| Suite | What it covers |
|---|---|
| `weatherValidation.test.ts` | Zod location schema (trim, empty, invalid characters) |
| `providerAdapters.test.ts` | Open-Meteo and wttr.in adapter + mapper integration (mocked `fetch`) |
| `useWeather.test.tsx` | Hydration gate, provider switching, TanStack Query behaviour |
| `WeatherScreen.test.tsx` | Idle, validation error, loading, error, and success UI states |

### Testing a new adapter

Adapters are tested by mocking `globalThis.fetch` and asserting the returned `WeatherData` shape. See `providerAdapters.test.ts` for the pattern.

---

## File Tree

```text
.
├── App.tsx                         Entry point (re-exports src/app/App.tsx)
├── app.json
├── babel.config.js                 Babel config — includes @/ alias via module-resolver
├── jest.config.js                  Jest config — includes @/ moduleNameMapper
├── jest.setup.ts                   Global mocks (AsyncStorage)
├── package.json
├── tsconfig.json                   TypeScript config — includes @/ paths
└── src
    ├── app
    │   ├── App.tsx                 Root component — mounts ErrorBoundary + AppProviders
    │   ├── ErrorBoundary.tsx       React class error boundary with fallback UI + retry
    │   └── providers.tsx           QueryClient setup, store hydration on mount
    ├── components
    │   └── MetricPill.tsx          Shared label+value display pill
    ├── features
    │   └── weather
    │       ├── api
    │       │   ├── mappers
    │       │   │   ├── openMeteoMapper.ts   Normalises Open-Meteo response, maps all 28 WMO codes
    │       │   │   └── wttrMapper.ts        Normalises wttr.in response
    │       │   ├── providerRegistry.ts      Registry of available provider adapters
    │       │   └── providers
    │       │       ├── openMeteoAdapter.ts  Geocoding + forecast fetch via Open-Meteo API
    │       │       └── wttrAdapter.ts       Forecast fetch via wttr.in API
    │       ├── hooks
    │       │   └── useWeather.ts            Coordinates Zustand store + TanStack Query
    │       ├── model
    │       │   ├── provider.ts              WeatherProvider interface, registry type
    │       │   ├── types.ts                 WeatherData, ForecastDay, provider id/option types
    │       │   └── validation.ts            Zod location schema + parseLocationInput helper
    │       └── ui
    │           ├── ForecastList.tsx         7-day forecast with temperature range bars
    │           ├── ProviderToggle.tsx       Segmented control for switching providers
    │           ├── WeatherCard.tsx          Current conditions card
    │           └── WeatherScreen.tsx        Main screen — search, states, layout
    ├── store
    │   └── weatherPreferencesStore.ts      Zustand store — provider + location, AsyncStorage persistence
    ├── test
    │   ├── WeatherScreen.test.tsx
    │   ├── createTestQueryClient.ts
    │   ├── providerAdapters.test.ts
    │   ├── renderWithProviders.tsx
    │   ├── useWeather.test.tsx
    │   └── weatherValidation.test.ts
    ├── theme
    │   └── providerThemes.ts               Gradient + accent colors per provider
    └── utils
        ├── fetchJson.ts                    HTTP GET with 10s timeout + 2-retry backoff
        └── weatherIcons.ts                 Shared icon mapping — MaterialCommunityIcons glyph + emoji
```

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS Simulator |
| `npm run android` | Run on Android Emulator |
| `npm run web` | Run in web browser |
| `npm test` | Run unit tests once |

---

## Troubleshooting

### Metro cache issues

If bundling behaves unexpectedly after config changes (e.g. adding a new Babel plugin or alias):

```bash
npx expo start -c
```

### Dependency issues

If install or runtime errors appear after dependency changes:

```bash
rm -rf node_modules package-lock.json
npm install
```

### iOS build issues

If iOS fails to launch after native dependency updates:

```bash
cd ios && pod install && cd ..
npm run ios
```

### Android emulator not detected

Ensure an emulator is running in Android Studio first, then rerun `npm run android`.

### Port already in use

Stop existing Metro/Expo processes and rerun `npm start`.

### Path alias not resolving

If you see `Cannot find module '@/...'`:
- In Metro/runtime: ensure `babel.config.js` has the `module-resolver` plugin and clear the Metro cache (`npx expo start -c`).
- In TypeScript: ensure `tsconfig.json` has `baseUrl` and `paths` set correctly, then restart the TS language server.
- In Jest: ensure `jest.config.js` has `moduleNameMapper` with `"^@/(.*)$": "<rootDir>/src/$1"`.
