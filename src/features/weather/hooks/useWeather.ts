import { useQuery } from "@tanstack/react-query";

import { weatherProviderRegistry } from "../api/providerRegistry";
import type { WeatherProviderRegistry } from "../model/provider";
import { useWeatherPreferencesStore } from "../../../store/weatherPreferencesStore";

type UseWeatherOptions = {
  registry?: WeatherProviderRegistry;
};

export function useWeather(options: UseWeatherOptions = {}) {
  const registry = options.registry ?? weatherProviderRegistry;
  const selectedProvider = useWeatherPreferencesStore(
    (state) => state.selectedProvider,
  );
  const lastSearchedLocation = useWeatherPreferencesStore(
    (state) => state.lastSearchedLocation,
  );
  const provider = registry[selectedProvider];

  const weatherQuery = useQuery({
    queryKey: ["weather", selectedProvider, lastSearchedLocation],
    queryFn: () => provider.getWeather({ location: lastSearchedLocation }),
    enabled: Boolean(lastSearchedLocation),
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  return {
    selectedProvider,
    lastSearchedLocation,
    weatherQuery,
  };
}
