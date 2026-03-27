import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { WeatherProviderId } from "../features/weather/model/types";

type WeatherPreferencesState = {
  selectedProvider: WeatherProviderId;
  lastSearchedLocation: string;
  hasHydrated: boolean;
  setSelectedProvider: (provider: WeatherProviderId) => void;
  setLastSearchedLocation: (location: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  reset: () => void;
};

type WeatherPreferencesPersistedState = Pick<
  WeatherPreferencesState,
  "selectedProvider" | "lastSearchedLocation"
>;

const initialState: WeatherPreferencesPersistedState = {
  selectedProvider: "openMeteo" as WeatherProviderId,
  lastSearchedLocation: "",
};

const WEATHER_PREFERENCES_STORAGE_KEY = "weather-preferences";

export const useWeatherPreferencesStore = create<WeatherPreferencesState>()(
  persist(
    (set) => ({
      ...initialState,
      hasHydrated: false,
      setSelectedProvider: (selectedProvider) => set({ selectedProvider }),
      setLastSearchedLocation: (lastSearchedLocation) =>
        set({ lastSearchedLocation }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      reset: () => set({ ...initialState, hasHydrated: true }),
    }),
    {
      name: WEATHER_PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ selectedProvider, lastSearchedLocation }) => ({
        selectedProvider,
        lastSearchedLocation,
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
