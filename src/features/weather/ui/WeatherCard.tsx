import { Image, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { MetricPill } from "@/components/MetricPill";
import type { WeatherData } from "../model/types";
import type { ProviderTheme } from "@/theme/providerThemes";
import { getWeatherIconName } from "@/utils/weatherIcons";
import {
  formatTemperature,
  type TemperatureUnit,
} from "@/utils/temperature";

type WeatherCardProps = {
  weather: WeatherData;
  theme: ProviderTheme;
  temperatureUnit: TemperatureUnit;
  isRefreshing?: boolean;
};

function formatMetric(value: number | null, suffix: string) {
  return value === null ? "N/A" : `${Math.round(value)}${suffix}`;
}

export function WeatherCard({
  weather,
  theme,
  temperatureUnit,
  isRefreshing = false,
}: WeatherCardProps) {
  const remoteIcon = weather.icon.startsWith("http");
  const iconName = getWeatherIconName(weather.weatherCondition);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.location, { color: theme.textPrimary }]}>
            {weather.locationName}
          </Text>
          <Text style={[styles.condition, { color: theme.textSecondary }]}>
            {weather.weatherCondition}
          </Text>
        </View>
        {remoteIcon ? (
          <Image source={{ uri: weather.icon }} style={styles.remoteIcon} />
        ) : (
          <MaterialCommunityIcons
            name={iconName}
            size={40}
            color={theme.textPrimary}
            style={styles.glyphIcon}
          />
        )}
      </View>

      <View style={styles.temperatureRow}>
        <Text style={[styles.temperature, { color: theme.textPrimary }]}>
          {formatTemperature(weather.temperatureCelsius, temperatureUnit)}
        </Text>
        <View
          style={[styles.providerBadge, { backgroundColor: theme.accentSoft }]}
        >
          <Text style={styles.providerBadgeText}>{weather.provider}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <MetricPill
          label="Humidity"
          value={formatMetric(weather.humidity, "%")}
          theme={theme}
        />
        <MetricPill
          label="Wind"
          value={formatMetric(weather.windSpeedKph, " km/h")}
          theme={theme}
        />
      </View>

      <Text style={[styles.meta, { color: theme.textSecondary }]}>
        {isRefreshing
          ? "Refreshing for the selected provider..."
          : `Updated ${new Date(weather.fetchedAt).toLocaleTimeString()}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    gap: 18,
    padding: 22,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
    gap: 6,
    paddingRight: 16,
  },
  location: {
    fontSize: 24,
    fontWeight: "800",
  },
  condition: {
    fontSize: 16,
    lineHeight: 22,
  },
  remoteIcon: {
    borderRadius: 18,
    height: 52,
    width: 52,
  },
  glyphIcon: {
    marginLeft: 8,
  },
  temperatureRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  temperature: {
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  providerBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  providerBadgeText: {
    color: "#1F3852",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  meta: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
