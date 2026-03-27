export const WEATHER_PROVIDER_IDS = ["openMeteo", "wttr"] as const;

export type WeatherProviderId = (typeof WEATHER_PROVIDER_IDS)[number];

export type ForecastDay = {
  date: string;
  temperatureMaxCelsius: number;
  temperatureMinCelsius: number;
  weatherCondition: string;
  icon: string;
};

export type WeatherData = {
  provider: WeatherProviderId;
  locationName: string;
  temperatureCelsius: number;
  weatherCondition: string;
  icon: string;
  humidity: number | null;
  windSpeedKph: number | null;
  fetchedAt: string;
  forecast?: ForecastDay[];
};

export type WeatherQueryParams = {
  location: string;
};

export type WeatherProviderOption = {
  id: WeatherProviderId;
  label: string;
  description: string;
};

export const WEATHER_PROVIDER_OPTIONS: WeatherProviderOption[] = [
  {
    id: "openMeteo",
    label: "Open-Meteo",
    description: "Forecast API with geocoding lookup",
  },
  {
    id: "wttr",
    label: "wttr.in",
    description: "Compact JSON weather feed",
  },
];
