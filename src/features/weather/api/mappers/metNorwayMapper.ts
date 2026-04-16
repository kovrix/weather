import type { WeatherData, ForecastDay, HourlyEntry } from "@/features/weather/model/types";

type InstantDetails = {
  air_temperature: number;
  relative_humidity?: number;
  wind_speed?: number;
};

type PeriodSummary = {
  symbol_code: string;
};

type Next6HoursDetails = {
  air_temperature_max?: number;
  air_temperature_min?: number;
};

type TimeseriesEntry = {
  time: string;
  data: {
    instant: { details: InstantDetails };
    next_1_hours?: { summary: PeriodSummary };
    next_6_hours?: { summary: PeriodSummary; details: Next6HoursDetails };
    next_12_hours?: { summary: PeriodSummary };
  };
};

export type MetNorwayResponse = {
  properties: {
    timeseries: TimeseriesEntry[];
  };
};

// MET Norway symbol codes — strip _day/_night/_polartwilight suffix to get base
const symbolMap: Record<string, { label: string; icon: string }> = {
  clearsky:                        { label: "Clear sky",               icon: "☀️" },
  fair:                            { label: "Mainly clear",            icon: "🌤️" },
  partlycloudy:                    { label: "Partly cloudy",           icon: "⛅" },
  cloudy:                          { label: "Cloudy",                  icon: "☁️" },
  fog:                             { label: "Fog",                     icon: "🌫️" },
  lightrain:                       { label: "Light rain",              icon: "🌦️" },
  rain:                            { label: "Rain",                    icon: "🌧️" },
  heavyrain:                       { label: "Heavy rain",              icon: "🌧️" },
  lightrainshowers:                { label: "Light rain showers",      icon: "🌦️" },
  rainshowers:                     { label: "Rain showers",            icon: "🌦️" },
  heavyrainshowers:                { label: "Heavy rain showers",      icon: "⛈️" },
  lightsleet:                      { label: "Light sleet",             icon: "🌨️" },
  sleet:                           { label: "Sleet",                   icon: "🌨️" },
  heavysleet:                      { label: "Heavy sleet",             icon: "🌨️" },
  lightsleetshowers:               { label: "Light sleet showers",     icon: "🌨️" },
  sleetshowers:                    { label: "Sleet showers",           icon: "🌨️" },
  heavysleetshowers:               { label: "Heavy sleet showers",     icon: "🌨️" },
  lightsnow:                       { label: "Light snow",              icon: "🌨️" },
  snow:                            { label: "Snow",                    icon: "🌨️" },
  heavysnow:                       { label: "Heavy snow",              icon: "❄️" },
  lightsnowshowers:                { label: "Light snow showers",      icon: "🌨️" },
  snowshowers:                     { label: "Snow showers",            icon: "🌨️" },
  heavysnowshowers:                { label: "Heavy snow showers",      icon: "❄️" },
  lightrainandthunder:             { label: "Rain and thunder",        icon: "⛈️" },
  rainandthunder:                  { label: "Rain and thunder",        icon: "⛈️" },
  heavyrainandthunder:             { label: "Heavy rain and thunder",  icon: "⛈️" },
  lightsleetandthunder:            { label: "Sleet and thunder",       icon: "⛈️" },
  sleetandthunder:                 { label: "Sleet and thunder",       icon: "⛈️" },
  heavysleetandthunder:            { label: "Heavy sleet and thunder", icon: "⛈️" },
  lightsnowandthunder:             { label: "Snow and thunder",        icon: "⛈️" },
  snowandthunder:                  { label: "Snow and thunder",        icon: "⛈️" },
  heavysnowandthunder:             { label: "Heavy snow and thunder",  icon: "⛈️" },
  lightrainshowersandthunder:      { label: "Rain showers and thunder",         icon: "⛈️" },
  rainshowersandthunder:           { label: "Rain showers and thunder",         icon: "⛈️" },
  heavyrainshowersandthunder:      { label: "Heavy rain showers and thunder",   icon: "⛈️" },
  lightsleetshowersandthunder:     { label: "Sleet showers and thunder",        icon: "⛈️" },
  sleetshowersandthunder:          { label: "Sleet showers and thunder",        icon: "⛈️" },
  heavysleetshowersandthunder:     { label: "Heavy sleet showers and thunder",  icon: "⛈️" },
  lightsnowshowersandthunder:      { label: "Snow showers and thunder",         icon: "⛈️" },
  snowshowersandthunder:           { label: "Snow showers and thunder",         icon: "⛈️" },
  heavysnowshowersandthunder:      { label: "Heavy snow showers and thunder",   icon: "⛈️" },
};

const FALLBACK = { label: "Unknown conditions", icon: "☁️" };

function resolveSymbol(symbolCode: string): { label: string; icon: string } {
  // Strip _day / _night / _polartwilight suffix
  const base = symbolCode.replace(/_(day|night|polartwilight)$/, "");
  return symbolMap[base] ?? FALLBACK;
}

function symbolFromEntry(entry: TimeseriesEntry): string {
  return (
    entry.data.next_1_hours?.summary.symbol_code ??
    entry.data.next_6_hours?.summary.symbol_code ??
    entry.data.next_12_hours?.summary.symbol_code ??
    ""
  );
}

export function mapMetNorwayResponse(
  locationName: string,
  response: MetNorwayResponse,
): Omit<WeatherData, "provider"> {
  const timeseries = response.properties.timeseries;

  if (!timeseries.length) {
    throw new Error("MET Norway returned an empty timeseries.");
  }

  const first = timeseries[0]!;
  const currentDescriptor = resolveSymbol(symbolFromEntry(first));

  const result: Omit<WeatherData, "provider"> = {
    locationName,
    temperatureCelsius: first.data.instant.details.air_temperature,
    weatherCondition: currentDescriptor.label,
    icon: currentDescriptor.icon,
    humidity: first.data.instant.details.relative_humidity ?? null,
    // MET Norway wind is in m/s — convert to km/h
    windSpeedKph:
      first.data.instant.details.wind_speed != null
        ? Math.round(first.data.instant.details.wind_speed * 3.6 * 10) / 10
        : null,
    fetchedAt: new Date().toISOString(),
  };

  // Group entries by UTC date (YYYY-MM-DD)
  const byDate = new Map<string, TimeseriesEntry[]>();
  for (const entry of timeseries) {
    const dateKey = entry.time.slice(0, 10);
    const list = byDate.get(dateKey);
    if (list) {
      list.push(entry);
    } else {
      byDate.set(dateKey, [entry]);
    }
  }

  const dates = Array.from(byDate.keys()).slice(0, 7);

  result.forecast = dates.map((date): ForecastDay => {
    const entries = byDate.get(date)!;

    // Representative entry: prefer one closest to noon UTC
    const noonEntry =
      entries.find((e) => e.time.slice(11, 13) === "12") ??
      entries.find((e) => e.data.next_6_hours !== undefined) ??
      entries[0]!;

    const symbol = symbolFromEntry(noonEntry);
    const descriptor = resolveSymbol(symbol);

    // Max/min: prefer next_6_hours data, fall back to instant temps across the day
    let tempMax: number;
    let tempMin: number;

    const sixHourMaxes = entries
      .map((e) => e.data.next_6_hours?.details.air_temperature_max)
      .filter((v): v is number => v !== undefined);
    const sixHourMins = entries
      .map((e) => e.data.next_6_hours?.details.air_temperature_min)
      .filter((v): v is number => v !== undefined);

    if (sixHourMaxes.length > 0 && sixHourMins.length > 0) {
      tempMax = Math.max(...sixHourMaxes);
      tempMin = Math.min(...sixHourMins);
    } else {
      const temps = entries.map((e) => e.data.instant.details.air_temperature);
      tempMax = Math.max(...temps);
      tempMin = Math.min(...temps);
    }

    const hourly: HourlyEntry[] = entries.map((entry) => {
      const hourSymbol = symbolFromEntry(entry);
      const hourDescriptor = resolveSymbol(hourSymbol);
      const windMs = entry.data.instant.details.wind_speed ?? 0;
      return {
        time: entry.time.slice(11, 16), // "HH:MM"
        temperatureCelsius: entry.data.instant.details.air_temperature,
        weatherCondition: hourDescriptor.label,
        icon: hourDescriptor.icon,
        windSpeedKph: Math.round(windMs * 3.6 * 10) / 10,
      };
    });

    return {
      date,
      temperatureMaxCelsius: tempMax,
      temperatureMinCelsius: tempMin,
      weatherCondition: descriptor.label,
      icon: descriptor.icon,
      hourly,
    };
  });

  return result;
}
