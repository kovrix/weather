# Weather Provider App

Production-style Expo + React Native weather app with modular provider adapters, Zustand state, TanStack Query server state, Zod validation, and Jest coverage.

## Local Setup (Step-by-Step)

Follow these steps in order for the most reliable local launch.

### 1) Prerequisites

- Node.js 22 LTS (recommended).
- npm 10+.
- Xcode (for iOS Simulator on macOS).
- Android Studio + Android SDK (for Android emulator).
- Expo CLI is not required globally; commands below use `npx` or project scripts.

Check your versions:

```bash
node -v
npm -v
```

If you are using a non-LTS Node version and see engine warnings, switch to Node 22 LTS to avoid tooling incompatibilities.

### 2) Install Dependencies

From the project root:

```bash
npm install
```

### 3) Start the Expo Dev Server

```bash
npm start
```

This opens Expo Dev Tools in the terminal/browser.

### 4) Run the App

Choose one target:

- iOS Simulator (macOS):

```bash
npm run ios
```

- Android Emulator:

```bash
npm run android
```

- Web:

```bash
npm run web
```

### 5) Run Tests

```bash
npm test
```

Expected result: all test suites pass.

## Troubleshooting

### Metro cache issues

If bundling behaves unexpectedly, clear the Metro cache:

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
cd ios
pod install
cd ..
npm run ios
```

### Android emulator not detected

- Ensure an emulator is running in Android Studio first.
- Then rerun `npm run android`.

### Port already in use

Stop existing Metro/Expo processes and rerun `npm start`.

## Quick Start (Minimal)

```bash
npm install
npm start
# then press i for iOS or a for Android in the Expo terminal
```

### Embedded Images

![Weather app iOS preview](assets/screenshots/weather-ios.png)

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

## Scripts

- `npm start` - start Expo dev server
- `npm run ios` - run on iOS simulator
- `npm run android` - run on Android emulator
- `npm run web` - run web target
- `npm test` - run unit tests once
