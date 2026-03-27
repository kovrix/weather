import { create } from "zustand";

import type { WeatherProviderId } from "../features/weather/model/types";

type WeatherPreferencesState = {
  selectedProvider: WeatherProviderId;
  lastSearchedLocation: string;
  setSelectedProvider: (provider: WeatherProviderId) => void;
  setLastSearchedLocation: (location: string) => void;
  reset: () => void;
};

const initialState = {
  selectedProvider: "openMeteo" as WeatherProviderId,
  lastSearchedLocation: "",
};

export const useWeatherPreferencesStore = create<WeatherPreferencesState>(
  (set) => ({
    ...initialState,
    setSelectedProvider: (selectedProvider) => set({ selectedProvider }),
    setLastSearchedLocation: (lastSearchedLocation) =>
      set({ lastSearchedLocation }),
    reset: () => set(initialState),
  }),
);

export function resetWeatherPreferencesStore() {
  useWeatherPreferencesStore.getState().reset();
}
