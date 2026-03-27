# Weather Provider App

Production-style Expo + React Native weather app with modular provider adapters, Zustand state, TanStack Query server state, Zod validation, and Jest coverage.

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
