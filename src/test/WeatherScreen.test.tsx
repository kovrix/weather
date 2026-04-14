import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import type { WeatherProviderRegistry } from "@/features/weather/model/provider";
import { WeatherScreen } from "@/features/weather/ui/WeatherScreen";
import { renderWithProviders } from "./renderWithProviders";

function createRegistry(
  overrides?: Partial<Record<keyof WeatherProviderRegistry, jest.Mock>>,
) {
  return {
    openMeteo: {
      id: "openMeteo",
      displayName: "Open-Meteo",
      getWeather:
        overrides?.openMeteo ??
        jest.fn().mockResolvedValue({
          provider: "openMeteo",
          locationName: "Paris, France",
          temperatureCelsius: 19,
          weatherCondition: "Partly cloudy",
          icon: "⛅",
          humidity: 58,
          windSpeedKph: 18,
          fetchedAt: "2026-03-27T12:00:00.000Z",
        }),
    },
    wttr: {
      id: "wttr",
      displayName: "wttr.in",
      getWeather:
        overrides?.wttr ??
        jest.fn().mockResolvedValue({
          provider: "wttr",
          locationName: "Paris, France",
          temperatureCelsius: 20,
          weatherCondition: "Sunny",
          icon: "https://cdn.example.com/sunny.png",
          humidity: 54,
          windSpeedKph: 16,
          fetchedAt: "2026-03-27T12:02:00.000Z",
        }),
    },
  } satisfies WeatherProviderRegistry;
}

describe("WeatherScreen", () => {
  it("renders the idle state before any search", () => {
    renderWithProviders(<WeatherScreen registry={createRegistry()} />);

    expect(screen.getByText("Idle")).toBeTruthy();
    expect(
      screen.getByText(
        "Enter a location to request normalized weather data from the selected provider.",
      ),
    ).toBeTruthy();
  });

  it("shows validation feedback and does not fetch on invalid input", async () => {
    const registry = createRegistry();

    renderWithProviders(<WeatherScreen registry={registry} />);

    fireEvent.changeText(screen.getByLabelText("Location input"), "   ");
    fireEvent.press(screen.getByText("Search Weather"));

    expect(screen.getByText("Location is required.")).toBeTruthy();
    expect(registry.openMeteo.getWeather).not.toHaveBeenCalled();
  });

  it("renders a loading state while a request is in flight", () => {
    const registry = createRegistry({
      openMeteo: jest.fn(() => new Promise(() => undefined)),
    });

    renderWithProviders(<WeatherScreen registry={registry} />);

    fireEvent.changeText(screen.getByLabelText("Location input"), "Rome");
    fireEvent.press(screen.getByText("Search Weather"));

    expect(screen.getByText("Loading weather...")).toBeTruthy();
  });

  it("renders an error state when a provider request fails", async () => {
    const registry = createRegistry({
      openMeteo: jest.fn().mockRejectedValue(new Error("Provider outage")),
    });

    renderWithProviders(<WeatherScreen registry={registry} />);

    fireEvent.changeText(screen.getByLabelText("Location input"), "Rome");
    fireEvent.press(screen.getByText("Search Weather"));

    await waitFor(() => {
      expect(screen.getByText("Unable to load weather")).toBeTruthy();
      expect(screen.getByText("Provider outage")).toBeTruthy();
    });
  });

  it("renders a success state after a successful search", async () => {
    renderWithProviders(<WeatherScreen registry={createRegistry()} />);

    fireEvent.changeText(screen.getByLabelText("Location input"), "Paris");
    fireEvent.press(screen.getByText("Search Weather"));

    await waitFor(() => {
      expect(screen.getByText("Paris, France")).toBeTruthy();
      expect(screen.getByText("Partly cloudy")).toBeTruthy();
      expect(screen.getByText("19°C")).toBeTruthy();
    });
  });
});
