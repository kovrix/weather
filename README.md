# Weather Provider App

Production-style Expo + React Native weather app with modular provider adapters, Zustand state, TanStack Query server state, Zod validation, and Jest coverage.

## Persistence Design

- Weather preferences use Zustand `persist` middleware with Expo-compatible AsyncStorage.
- Only `selectedProvider` and `lastSearchedLocation` are persisted to keep storage minimal and explicit.
- The app triggers store hydration on startup in `AppProviders`, not in UI components.
- Weather fetching remains provider-agnostic: `useWeather` still reads provider adapters from the registry and only enables queries after store hydration, preventing unnecessary duplicate startup fetches.
- If a persisted location exists, the app automatically fetches weather for that location with the persisted provider after hydration.

## File Tree

```text
.
├── App.tsx
├── README.md
├── app.json
├── babel.config.js
├── jest.config.js
├── jest.setup.ts
├── package.json
├── tsconfig.json
└── src
    ├── app
    │   ├── App.tsx
    │   └── providers.tsx
    ├── components
    │   └── MetricPill.tsx
    ├── features
    │   └── weather
    │       ├── api
    │       │   ├── mappers
    │       │   │   ├── openMeteoMapper.ts
    │       │   │   └── wttrMapper.ts
    │       │   ├── providerRegistry.ts
    │       │   └── providers
    │       │       ├── openMeteoAdapter.ts
    │       │       └── wttrAdapter.ts
    │       ├── hooks
    │       │   └── useWeather.ts
    │       ├── model
    │       │   ├── provider.ts
    │       │   ├── types.ts
    │       │   └── validation.ts
    │       └── ui
    │           ├── ProviderToggle.tsx
    │           ├── WeatherCard.tsx
    │           └── WeatherScreen.tsx
    ├── store
    │   └── weatherPreferencesStore.ts
    ├── test
    │   ├── WeatherScreen.test.tsx
    │   ├── createTestQueryClient.ts
    │   ├── providerAdapters.test.ts
    │   ├── renderWithProviders.tsx
    │   ├── useWeather.test.tsx
    │   └── weatherValidation.test.ts
    ├── theme
    │   └── providerThemes.ts
    └── utils
        └── fetchJson.ts
```

## Install

```bash
npm install
```

## Run

```bash
npm start
```

## Test

```bash
npm test
```
