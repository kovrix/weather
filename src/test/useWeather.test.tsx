import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useWeather } from "../features/weather/hooks/useWeather";
import type { WeatherProviderRegistry } from "../features/weather/model/provider";
import { useWeatherPreferencesStore } from "../store/weatherPreferencesStore";
import { createTestQueryClient } from "./createTestQueryClient";

describe("useWeather", () => {
  it("waits for hydration before auto-fetching a restored location", async () => {
    const openMeteoGetWeather = jest.fn().mockResolvedValue({
      provider: "openMeteo",
      locationName: "Lisbon, Portugal",
      temperatureCelsius: 22,
      weatherCondition: "Clear sky",
      icon: "☀️",
      humidity: 50,
      windSpeedKph: 11,
      fetchedAt: "2026-03-27T10:00:00.000Z",
    });
    const wttrGetWeather = jest.fn().mockResolvedValue({
      provider: "wttr",
      locationName: "Lisbon, Portugal",
      temperatureCelsius: 21,
      weatherCondition: "Sunny",
      icon: "https://cdn.example.com/sunny.png",
      humidity: 48,
      windSpeedKph: 10,
      fetchedAt: "2026-03-27T10:05:00.000Z",
    });

    const registry = {
      openMeteo: {
        id: "openMeteo",
        displayName: "Open-Meteo",
        getWeather: openMeteoGetWeather,
      },
      wttr: {
        id: "wttr",
        displayName: "wttr.in",
        getWeather: wttrGetWeather,
      },
    } satisfies WeatherProviderRegistry;

    const queryClient = createTestQueryClient();

    function Wrapper({ children }: PropsWithChildren) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    }

    act(() => {
      const state = useWeatherPreferencesStore.getState();
      state.setSelectedProvider("wttr");
      state.setLastSearchedLocation("Lisbon");
      state.setHasHydrated(false);
    });

    renderHook(() => useWeather({ registry }), {
      wrapper: Wrapper,
    });

    expect(wttrGetWeather).not.toHaveBeenCalled();

    act(() => {
      useWeatherPreferencesStore.getState().setHasHydrated(true);
    });

    await waitFor(() => {
      expect(wttrGetWeather).toHaveBeenCalledWith({ location: "Lisbon" });
    });
    expect(wttrGetWeather).toHaveBeenCalledTimes(1);
    expect(openMeteoGetWeather).not.toHaveBeenCalled();
  });

  it("refetches when the provider changes and a location already exists", async () => {
    const openMeteoGetWeather = jest.fn().mockResolvedValue({
      provider: "openMeteo",
      locationName: "Lisbon, Portugal",
      temperatureCelsius: 22,
      weatherCondition: "Clear sky",
      icon: "☀️",
      humidity: 50,
      windSpeedKph: 11,
      fetchedAt: "2026-03-27T10:00:00.000Z",
    });
    const wttrGetWeather = jest.fn().mockResolvedValue({
      provider: "wttr",
      locationName: "Lisbon, Portugal",
      temperatureCelsius: 21,
      weatherCondition: "Sunny",
      icon: "https://cdn.example.com/sunny.png",
      humidity: 48,
      windSpeedKph: 10,
      fetchedAt: "2026-03-27T10:05:00.000Z",
    });

    const registry = {
      openMeteo: {
        id: "openMeteo",
        displayName: "Open-Meteo",
        getWeather: openMeteoGetWeather,
      },
      wttr: {
        id: "wttr",
        displayName: "wttr.in",
        getWeather: wttrGetWeather,
      },
    } satisfies WeatherProviderRegistry;

    const queryClient = createTestQueryClient();

    function Wrapper({ children }: PropsWithChildren) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    }

    act(() => {
      const state = useWeatherPreferencesStore.getState();
      state.setHasHydrated(true);
      state.setLastSearchedLocation("Lisbon");
    });

    const { result } = renderHook(() => useWeather({ registry }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(openMeteoGetWeather).toHaveBeenCalledWith({ location: "Lisbon" });
    });

    act(() => {
      useWeatherPreferencesStore.getState().setSelectedProvider("wttr");
    });

    await waitFor(() => {
      expect(wttrGetWeather).toHaveBeenCalledWith({ location: "Lisbon" });
      expect(result.current.weatherQuery.data?.provider).toBe("wttr");
    });
  });
});
