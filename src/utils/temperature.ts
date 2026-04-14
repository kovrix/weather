export type TemperatureUnit = "celsius" | "fahrenheit";

export function formatTemperature(
  celsius: number,
  unit: TemperatureUnit,
): string {
  if (unit === "fahrenheit") {
    return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatTemperatureBare(
  celsius: number,
  unit: TemperatureUnit,
): string {
  if (unit === "fahrenheit") {
    return `${Math.round((celsius * 9) / 5 + 32)}°`;
  }
  return `${Math.round(celsius)}°`;
}
