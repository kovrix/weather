import type { WeatherData } from "@/features/weather/model/types";
import { mapConditionToEmoji } from "@/utils/weatherIcons";

export type WttrResponse = {
  current_condition: Array<{
    temp_C: string;
    humidity: string;
    windspeedKmph: string;
    weatherDesc: Array<{ value: string }>;
    weatherIconUrl: Array<{ value: string }>;
  }>;
  nearest_area: Array<{
    areaName: Array<{ value: string }>;
    country: Array<{ value: string }>;
  }>;
  weather?: Array<{
    date: string;
    maxtempC: string;
    mintempC: string;
    hourly?: Array<{
      weatherDesc?: Array<{ value: string }>;
    }>;
  }>;
};

export function mapWttrResponse(
  response: WttrResponse,
): Omit<WeatherData, "provider"> {
  const current = response.current_condition[0];
  const area = response.nearest_area[0];

  if (!current || !area) {
    throw new Error("wttr.in returned an incomplete response.");
  }

  const locationParts = [
    area.areaName[0]?.value,
    area.country[0]?.value,
  ].filter(Boolean);

  const result: Omit<WeatherData, "provider"> = {
    locationName: locationParts.join(", "),
    temperatureCelsius: Number(current.temp_C),
    weatherCondition: current.weatherDesc[0]?.value ?? "Unknown conditions",
    icon: mapConditionToEmoji(current.weatherDesc[0]?.value ?? ""),
    humidity: Number(current.humidity),
    windSpeedKph: Number(current.windspeedKmph),
    fetchedAt: new Date().toISOString(),
  };

  if (response.weather?.length) {
    result.forecast = response.weather.slice(0, 7).map((day) => {
      const condition = day.hourly?.[0]?.weatherDesc?.[0]?.value ?? "Unknown";
      return {
        date: day.date,
        temperatureMaxCelsius: Number(day.maxtempC),
        temperatureMinCelsius: Number(day.mintempC),
        weatherCondition: condition,
        icon: mapConditionToEmoji(condition),
      };
    });
  }

  return result;
}
