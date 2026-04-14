import type { WeatherData } from "../../model/types";

type OpenMeteoCurrentResponse = {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

export type OpenMeteoGeocodingResponse = {
  results?: Array<{
    name: string;
    country?: string;
    latitude: number;
    longitude: number;
  }>;
};

export type OpenMeteoForecastResponse = OpenMeteoCurrentResponse;

// Full WMO Weather interpretation codes as defined by Open-Meteo spec
const weatherCodeMap: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Depositing rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Dense drizzle", icon: "🌧️" },
  56: { label: "Light freezing drizzle", icon: "🌧️" },
  57: { label: "Heavy freezing drizzle", icon: "🌧️" },
  61: { label: "Slight rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  66: { label: "Light freezing rain", icon: "🌨️" },
  67: { label: "Heavy freezing rain", icon: "🌨️" },
  71: { label: "Slight snow", icon: "🌨️" },
  73: { label: "Snow", icon: "🌨️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "❄️" },
  80: { label: "Slight rain showers", icon: "🌦️" },
  81: { label: "Moderate rain showers", icon: "🌦️" },
  82: { label: "Violent rain showers", icon: "⛈️" },
  85: { label: "Slight snow showers", icon: "🌨️" },
  86: { label: "Heavy snow showers", icon: "❄️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm with slight hail", icon: "⛈️" },
  99: { label: "Thunderstorm with heavy hail", icon: "⛈️" },
};

export function mapOpenMeteoResponse(
  locationName: string,
  response: OpenMeteoForecastResponse,
): Omit<WeatherData, "provider"> {
  const weatherCode = response.current.weather_code;
  const descriptor = weatherCodeMap[weatherCode] ?? {
    label: "Unknown conditions",
    icon: "☁️",
  };

  const result: Omit<WeatherData, "provider"> = {
    locationName,
    temperatureCelsius: response.current.temperature_2m,
    weatherCondition: descriptor.label,
    icon: descriptor.icon,
    humidity: response.current.relative_humidity_2m,
    windSpeedKph: response.current.wind_speed_10m,
    fetchedAt: new Date().toISOString(),
  };

  if (response.daily) {
    result.forecast = response.daily.time.slice(0, 7).map((date, index) => {
      const code = response.daily?.weather_code[index];
      const dayDescriptor = weatherCodeMap[code ?? -1] ?? {
        label: "Unknown conditions",
        icon: "☁️",
      };

      return {
        date,
        temperatureMaxCelsius: response.daily?.temperature_2m_max[index] ?? 0,
        temperatureMinCelsius: response.daily?.temperature_2m_min[index] ?? 0,
        weatherCondition: dayDescriptor.label,
        icon: dayDescriptor.icon,
      };
    });
  }

  return result;
}
