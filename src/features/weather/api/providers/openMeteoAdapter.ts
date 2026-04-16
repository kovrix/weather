import { fetchJson } from "@/utils/fetchJson";
import type { WeatherProvider } from "@/features/weather/model/provider";
import {
  mapOpenMeteoResponse,
  type OpenMeteoForecastResponse,
  type OpenMeteoGeocodingResponse,
} from "../mappers/openMeteoMapper";

export class OpenMeteoAdapter implements WeatherProvider {
  readonly id = "openMeteo" as const;

  readonly displayName = "Open-Meteo";

  async getWeather(params: { location: string }) {
    let latitude: number;
    let longitude: number;
    let locationName: string;

    const coordMatch = params.location.match(
      /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/,
    );

    if (coordMatch) {
      // Coordinates passed directly (e.g. from geolocation) — skip geocoding
      latitude = parseFloat(coordMatch[1]!);
      longitude = parseFloat(coordMatch[2]!);
      locationName = "Current Location";
    } else {
      const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(params.location)}&count=1&language=en&format=json`;
      const geocodingResponse =
        await fetchJson<OpenMeteoGeocodingResponse>(geocodingUrl);
      const match = geocodingResponse.results?.[0];

      if (!match) {
        throw new Error("Location not found in Open-Meteo.");
      }

      latitude = match.latitude;
      longitude = match.longitude;
      locationName = [match.name, match.country]
        .filter((v): v is string => Boolean(v))
        .join(", ");
    }

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh&temperature_unit=celsius&timezone=auto`;
    const forecastResponse =
      await fetchJson<OpenMeteoForecastResponse>(forecastUrl);

    return {
      provider: this.id,
      ...mapOpenMeteoResponse(locationName, forecastResponse),
    };
  }
}
