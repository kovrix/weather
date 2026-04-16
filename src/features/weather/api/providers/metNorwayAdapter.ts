import { fetchJson } from "@/utils/fetchJson";
import type { WeatherProvider } from "@/features/weather/model/provider";
import type { OpenMeteoGeocodingResponse } from "../mappers/openMeteoMapper";
import {
  mapMetNorwayResponse,
  type MetNorwayResponse,
} from "../mappers/metNorwayMapper";

// MET Norway terms of service require a descriptive User-Agent
const MET_HEADERS = {
  "User-Agent": "RNWeatherApp/1.0 github.com/kovrix/weather",
};

export class MetNorwayAdapter implements WeatherProvider {
  readonly id = "metNorway" as const;

  readonly displayName = "MET Norway";

  async getWeather(params: { location: string }) {
    let latitude: number;
    let longitude: number;
    let locationName: string;

    const coordMatch = params.location.match(
      /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/,
    );

    if (coordMatch) {
      latitude = parseFloat(coordMatch[1]!);
      longitude = parseFloat(coordMatch[2]!);
      locationName = "Current Location";
    } else {
      const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(params.location)}&count=1&language=en&format=json`;
      const geocodingResponse =
        await fetchJson<OpenMeteoGeocodingResponse>(geocodingUrl);
      const match = geocodingResponse.results?.[0];

      if (!match) {
        throw new Error("Location not found.");
      }

      latitude = match.latitude;
      longitude = match.longitude;
      locationName = [match.name, match.country]
        .filter((v): v is string => Boolean(v))
        .join(", ");
    }

    const forecastUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}`;
    const forecastResponse = await fetchJson<MetNorwayResponse>(forecastUrl, {
      headers: MET_HEADERS,
    });

    return {
      provider: this.id,
      ...mapMetNorwayResponse(locationName, forecastResponse),
    };
  }
}
