import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import type { ForecastDay } from "../model/types";
import type { ProviderTheme } from "@/theme/providerThemes";
import { getWeatherIconName } from "@/utils/weatherIcons";
import {
  formatTemperatureBare,
  type TemperatureUnit,
} from "@/utils/temperature";

type ForecastListProps = {
  forecast?: ForecastDay[];
  theme: ProviderTheme;
  temperatureUnit: TemperatureUnit;
};

export function ForecastList({
  forecast,
  theme,
  temperatureUnit,
}: ForecastListProps) {
  if (!forecast || forecast.length === 0) {
    return null;
  }

  const nextDays = forecast.slice(1, 8);
  if (nextDays.length === 0) {
    return null;
  }

  const minTemp = Math.min(...nextDays.map((day) => day.temperatureMinCelsius));
  const maxTemp = Math.max(...nextDays.map((day) => day.temperatureMaxCelsius));
  const spread = Math.max(1, maxTemp - minTemp);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Next Days Forecast
      </Text>
      <View style={styles.rows}>
        {nextDays.map((day, index) => {
          const rangeStart =
            ((day.temperatureMinCelsius - minTemp) / spread) * 100;
          const rangeWidth =
            ((day.temperatureMaxCelsius - day.temperatureMinCelsius) / spread) *
            100;

          return (
            <View
              key={`${day.date}-${index}`}
              style={[
                styles.row,
                { borderBottomColor: theme.surfaceMuted },
                index === nextDays.length - 1 && styles.lastRow,
              ]}
            >
              <Text style={[styles.dayLabel, { color: theme.textPrimary }]}>
                {formatDay(day.date)}
              </Text>

              <MaterialCommunityIcons
                color={theme.textPrimary}
                name={getWeatherIconName(day.weatherCondition)}
                size={18}
                style={styles.iconGlyph}
              />

              <Text
                style={[styles.condition, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {day.weatherCondition}
              </Text>

              <Text style={[styles.tempMin, { color: theme.textSecondary }]}>
                {formatTemperatureBare(day.temperatureMinCelsius, temperatureUnit)}
              </Text>

              <View
                style={[
                  styles.rangeTrack,
                  { backgroundColor: theme.surfaceMuted },
                ]}
              >
                <View
                  style={[
                    styles.rangeFill,
                    {
                      backgroundColor: theme.accent,
                      left: `${rangeStart}%`,
                      width: `${Math.max(8, rangeWidth)}%`,
                    },
                  ]}
                />
              </View>

              <Text style={[styles.tempMax, { color: theme.textPrimary }]}>
                {formatTemperatureBare(day.temperatureMaxCelsius, temperatureUnit)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function formatDay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
  },
  rows: {
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 40,
    paddingVertical: 6,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: "700",
    width: 42,
  },
  iconGlyph: {
    marginLeft: 4,
    width: 24,
  },
  condition: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  tempMin: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
    textAlign: "right",
    width: 36,
  },
  rangeTrack: {
    borderRadius: 999,
    height: 4,
    marginHorizontal: 8,
    position: "relative",
    width: 72,
  },
  rangeFill: {
    borderRadius: 999,
    height: 4,
    position: "absolute",
  },
  tempMax: {
    fontSize: 13,
    fontWeight: "700",
    width: 36,
  },
});
