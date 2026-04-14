import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { WeatherProviderId } from "../features/weather/model/types";
import type { TemperatureUnit } from "../utils/temperature";

const MAX_HISTORY = 5;

type WeatherPreferencesState = {
  selectedProvider: WeatherProviderId;
  /** Raw query sent to weather adapters — may be a city name or "lat,lon" */
  lastSearchedLocation: string;
  /** Human-readable name shown in the UI and stored in history */
  lastSearchedDisplayName: string;
  locationHistory: string[];
  temperatureUnit: TemperatureUnit;
  hasHydrated: boolean;
  setSelectedProvider: (provider: WeatherProviderId) => void;
  setLastSearchedLocation: (location: string, displayName: string) => void;
  addToLocationHistory: (displayName: string) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  reset: () => void;
};

type WeatherPreferencesPersistedState = Pick<
  WeatherPreferencesState,
  | "selectedProvider"
  | "lastSearchedLocation"
  | "lastSearchedDisplayName"
  | "locationHistory"
  | "temperatureUnit"
>;

const initialState: WeatherPreferencesPersistedState = {
  selectedProvider: "openMeteo" as WeatherProviderId,
  lastSearchedLocation: "",
  lastSearchedDisplayName: "",
  locationHistory: [],
  temperatureUnit: "celsius",
};

const WEATHER_PREFERENCES_STORAGE_KEY = "weather-preferences";

export const useWeatherPreferencesStore = create<WeatherPreferencesState>()(
  persist(
    (set) => ({
      ...initialState,
      hasHydrated: false,
      setSelectedProvider: (selectedProvider) => set({ selectedProvider }),
      setLastSearchedLocation: (lastSearchedLocation, displayName) =>
        set({ lastSearchedLocation, lastSearchedDisplayName: displayName }),
      addToLocationHistory: (displayName) =>
        set((state) => {
          const deduped = state.locationHistory.filter(
            (l) => l.toLowerCase() !== displayName.toLowerCase(),
          );
          return {
            locationHistory: [displayName, ...deduped].slice(0, MAX_HISTORY),
          };
        }),
      setTemperatureUnit: (temperatureUnit) => set({ temperatureUnit }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      reset: () => set({ ...initialState, hasHydrated: true }),
    }),
    {
      name: WEATHER_PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({
        selectedProvider,
        lastSearchedLocation,
        lastSearchedDisplayName,
        locationHistory,
        temperatureUnit,
      }) => ({
        selectedProvider,
        lastSearchedLocation,
        lastSearchedDisplayName,
        locationHistory,
        temperatureUnit,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export async function hydrateWeatherPreferencesStore() {
  if (useWeatherPreferencesStore.persist.hasHydrated()) {
    useWeatherPreferencesStore.getState().setHasHydrated(true);
    return;
  }

  await useWeatherPreferencesStore.persist.rehydrate();
}

export async function resetWeatherPreferencesStore() {
  useWeatherPreferencesStore.getState().reset();
  await useWeatherPreferencesStore.persist.clearStorage();
}
