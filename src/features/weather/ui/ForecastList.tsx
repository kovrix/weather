import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import type { ForecastDay, HourlyEntry } from "../model/types";
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
  const todayISO = new Date().toISOString().slice(0, 10);
  const [expandedDate, setExpandedDate] = useState<string | null>(todayISO);

  if (!forecast || forecast.length === 0) {
    return null;
  }

  const nextDays = forecast.slice(0, 7);
  if (nextDays.length === 0) {
    return null;
  }

  const minTemp = Math.min(...nextDays.map((day) => day.temperatureMinCelsius));
  const maxTemp = Math.max(...nextDays.map((day) => day.temperatureMaxCelsius));
  const spread = Math.max(1, maxTemp - minTemp);

  // "HH:MM" of the current hour — used to trim past entries on today's row
  const currentHourStr = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        7-Day Forecast
      </Text>
      <View style={styles.rows}>
        {nextDays.map((day, index) => {
          const rangeStart =
            ((day.temperatureMinCelsius - minTemp) / spread) * 100;
          const rangeWidth =
            ((day.temperatureMaxCelsius - day.temperatureMinCelsius) / spread) *
            100;
          const isExpanded = expandedDate === day.date;
          const hourlyEntries =
            day.date === todayISO
              ? (day.hourly?.filter((e) => e.time >= currentHourStr) ?? [])
              : (day.hourly ?? []);
          const hasHourly = hourlyEntries.length > 0;

          return (
            <View key={`${day.date}-${index}`}>
              <TouchableOpacity
                activeOpacity={hasHourly ? 0.6 : 1}
                onPress={() => {
                  if (!hasHourly) return;
                  setExpandedDate(isExpanded ? null : day.date);
                }}
                style={[
                  styles.row,
                  { borderBottomColor: theme.surfaceMuted },
                  !isExpanded &&
                    index === nextDays.length - 1 &&
                    styles.lastRow,
                ]}
              >
                <Text style={[styles.dayLabel, { color: theme.textPrimary }]}>
                  {formatDay(day.date, todayISO)}
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
                  {formatTemperatureBare(
                    day.temperatureMinCelsius,
                    temperatureUnit,
                  )}
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
                  {formatTemperatureBare(
                    day.temperatureMaxCelsius,
                    temperatureUnit,
                  )}
                </Text>

                {hasHourly && (
                  <MaterialCommunityIcons
                    color={theme.textSecondary}
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    style={styles.chevron}
                  />
                )}
              </TouchableOpacity>

              {isExpanded && hourlyEntries.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={[
                    styles.hourlyScroll,
                    {
                      borderBottomColor: theme.surfaceMuted,
                      borderBottomWidth:
                        index === nextDays.length - 1 ? 0 : 1,
                    },
                  ]}
                  contentContainerStyle={styles.hourlyContent}
                >
                  {hourlyEntries.map((entry) => (
                    <HourlyCard
                      key={entry.time}
                      entry={entry}
                      theme={theme}
                      temperatureUnit={temperatureUnit}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

type HourlyCardProps = {
  entry: HourlyEntry;
  theme: ProviderTheme;
  temperatureUnit: TemperatureUnit;
};

function HourlyCard({ entry, theme, temperatureUnit }: HourlyCardProps) {
  return (
    <View style={styles.hourlyCard}>
      <Text style={[styles.hourlyTime, { color: theme.textSecondary }]}>
        {entry.time}
      </Text>
      <MaterialCommunityIcons
        color={theme.textPrimary}
        name={getWeatherIconName(entry.weatherCondition)}
        size={18}
      />
      <Text style={[styles.hourlyTemp, { color: theme.textPrimary }]}>
        {formatTemperatureBare(entry.temperatureCelsius, temperatureUnit)}
      </Text>
      <Text style={[styles.hourlyWind, { color: theme.textSecondary }]}>
        {Math.round(entry.windSpeedKph)} km/h
      </Text>
    </View>
  );
}

function formatDay(dateString: string, todayISO: string): string {
  if (dateString === todayISO) return "Today";
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
  chevron: {
    marginLeft: 4,
    width: 20,
  },
  hourlyScroll: {
    paddingVertical: 8,
  },
  hourlyContent: {
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  hourlyCard: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 64,
  },
  hourlyTime: {
    fontSize: 11,
    fontWeight: "600",
  },
  hourlyTemp: {
    fontSize: 13,
    fontWeight: "700",
  },
  hourlyWind: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
  },
});
