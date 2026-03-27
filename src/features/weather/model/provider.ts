import type {
  WeatherData,
  WeatherProviderId,
  WeatherQueryParams,
} from "./types";

export interface WeatherProvider {
  readonly id: WeatherProviderId;
  readonly displayName: string;
  getWeather(params: WeatherQueryParams): Promise<WeatherData>;
}

export type WeatherProviderRegistry = Record<
  WeatherProviderId,
  WeatherProvider
>;
