import type { ComponentProps } from "react";
import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

/**
 * Maps a weather condition string to a MaterialCommunityIcons glyph name.
 * Used by WeatherCard and ForecastList.
 */
export function getWeatherIconName(condition: string): IconName {
  const lower = condition.toLowerCase();
  if (lower.includes("thunder") || lower.includes("hail")) {
    return "weather-lightning-rainy";
  }
  if (lower.includes("blizzard") || lower.includes("snow")) {
    return "weather-snowy";
  }
  if (
    lower.includes("rain") ||
    lower.includes("drizzle") ||
    lower.includes("shower")
  ) {
    return "weather-rainy";
  }
  if (lower.includes("fog") || lower.includes("mist")) {
    return "weather-fog";
  }
  if (lower.includes("cloud") || lower.includes("overcast")) {
    return "weather-cloudy";
  }
  if (lower.includes("clear") || lower.includes("sun")) {
    return "weather-sunny";
  }
  return "weather-partly-cloudy";
}

/**
 * Maps a weather condition string to an emoji icon.
 * Used by the wttr.in adapter.
 */
export function mapConditionToEmoji(condition: string): string {
  const lower = condition.toLowerCase();
  if (lower.includes("thunder") || lower.includes("hail")) return "⛈️";
  if (lower.includes("blizzard") || lower.includes("snow")) return "🌨️";
  if (
    lower.includes("rain") ||
    lower.includes("drizzle") ||
    lower.includes("shower")
  )
    return "🌧️";
  if (lower.includes("fog") || lower.includes("mist")) return "🌫️";
  if (lower.includes("cloud") || lower.includes("overcast")) return "☁️";
  if (lower.includes("clear") || lower.includes("sun")) return "☀️";
  return "⛅";
}
