import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { weatherProviderRegistry } from "../api/providerRegistry";
import { useWeather } from "../hooks/useWeather";
import type { WeatherProviderRegistry } from "../model/provider";
import { parseLocationInput } from "../model/validation";
import { ForecastList } from "./ForecastList";
import { ProviderToggle } from "./ProviderToggle";
import { UnitToggle } from "./UnitToggle";
import { WeatherCard } from "./WeatherCard";
import { getProviderTheme } from "@/theme/providerThemes";
import { useWeatherPreferencesStore } from "@/store/weatherPreferencesStore";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { fetchJson } from "@/utils/fetchJson";

type BigDataCloudResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
};

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const data = await fetchJson<BigDataCloudResponse>(url);
    return data.city ?? data.locality ?? data.principalSubdivision ?? null;
  } catch {
    return null;
  }
}

type WeatherScreenProps = {
  registry?: WeatherProviderRegistry;
};

export function WeatherScreen({
  registry = weatherProviderRegistry,
}: WeatherScreenProps) {
  const selectedProvider = useWeatherPreferencesStore(
    (state) => state.selectedProvider,
  );
  const setSelectedProvider = useWeatherPreferencesStore(
    (state) => state.setSelectedProvider,
  );
  const lastSearchedLocation = useWeatherPreferencesStore(
    (state) => state.lastSearchedLocation,
  );
  const lastSearchedDisplayName = useWeatherPreferencesStore(
    (state) => state.lastSearchedDisplayName,
  );
  const setLastSearchedLocation = useWeatherPreferencesStore(
    (state) => state.setLastSearchedLocation,
  );
  const locationHistory = useWeatherPreferencesStore(
    (state) => state.locationHistory,
  );
  const addToLocationHistory = useWeatherPreferencesStore(
    (state) => state.addToLocationHistory,
  );
  const temperatureUnit = useWeatherPreferencesStore(
    (state) => state.temperatureUnit,
  );
  const setTemperatureUnit = useWeatherPreferencesStore(
    (state) => state.setTemperatureUnit,
  );

  const [locationInput, setLocationInput] = useState(lastSearchedDisplayName || lastSearchedLocation);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const theme = useMemo(
    () => getProviderTheme(selectedProvider),
    [selectedProvider],
  );
  const { weatherQuery } = useWeather({ registry });
  const { isConnected } = useNetworkStatus();

  const isOffline = isConnected === false;

  useEffect(() => {
    setLocationInput(lastSearchedDisplayName || lastSearchedLocation);
  }, [lastSearchedDisplayName, lastSearchedLocation]);

  // For text searches: location and display name are the same city string.
  // For GPS: location is "lat,lon" (passed to adapters), display name is the city name.
  const submitLocation = (location: string, displayName = location) => {
    const result = parseLocationInput(displayName);
    if (!result.success) {
      setValidationError(
        result.error.issues[0]?.message ?? "Enter a valid location.",
      );
      return;
    }
    setValidationError(null);
    setLocationInput(result.data);
    setLastSearchedLocation(location, result.data);
    addToLocationHistory(result.data);
  };

  const handleSubmit = () => submitLocation(locationInput);

  const handleHistorySelect = (location: string) => {
    setIsInputFocused(false);
    submitLocation(location);
  };

  const handleUseLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = position.coords;
      const coordString = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
      const cityName = await reverseGeocode(latitude, longitude);
      if (cityName) {
        // Query by coords for accuracy, display city name in UI and history
        submitLocation(coordString, cityName);
      } else {
        // Reverse geocoding failed — coords as both query and display
        setValidationError(null);
        setLocationInput(coordString);
        setLastSearchedLocation(coordString, coordString);
        addToLocationHistory(coordString);
      }
    } catch {
      setLocationError("Failed to get location. Please try again.");
    } finally {
      setIsLocating(false);
    }
  };

  const hasSearched = Boolean(lastSearchedLocation);

  const visibleHistory = isInputFocused
    ? locationHistory.filter(
        (l) => l.toLowerCase() !== locationInput.trim().toLowerCase(),
      )
    : [];

  return (
    <LinearGradient colors={theme.background} style={styles.gradient}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: theme.accentSoft }]}>
              Provider-driven weather explorer
            </Text>
          </View>

          <View style={styles.sectionSpacing}>
            <ProviderToggle
              onSelect={setSelectedProvider}
              selectedProvider={selectedProvider}
              theme={theme}
            />
          </View>

          <View style={[styles.panel, { backgroundColor: theme.surface }]}>
            <View style={styles.panelHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Location
              </Text>
              <UnitToggle
                unit={temperatureUnit}
                onToggle={setTemperatureUnit}
                theme={theme}
              />
            </View>

            <View style={styles.inputRow}>
              <TextInput
                accessibilityLabel="Location input"
                autoCapitalize="words"
                autoCorrect={false}
                onChangeText={(text) => {
                  setLocationInput(text);
                  setValidationError(null);
                }}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => {
                  // delay so tapping a history item fires before blur hides it
                  setTimeout(() => setIsInputFocused(false), 150);
                }}
                placeholder="Search city or region"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  {
                    borderColor: validationError
                      ? theme.error
                      : theme.surfaceMuted,
                    color: theme.textPrimary,
                  },
                ]}
                value={locationInput}
              />
              <Pressable
                accessibilityLabel="Use my location"
                accessibilityRole="button"
                onPress={handleUseLocation}
                style={[
                  styles.locationButton,
                  { backgroundColor: theme.surfaceMuted },
                ]}
                disabled={isLocating}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color={theme.textPrimary} />
                ) : (
                  <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={20}
                    color={theme.textPrimary}
                  />
                )}
              </Pressable>
            </View>

            {validationError ? (
              <Text style={[styles.validationError, { color: theme.error }]}>
                {validationError}
              </Text>
            ) : null}

            {locationError ? (
              <Text style={[styles.validationError, { color: theme.error }]}>
                {locationError}
              </Text>
            ) : null}

            {visibleHistory.length > 0 ? (
              <View
                style={[
                  styles.historyList,
                  { backgroundColor: theme.surfaceMuted },
                ]}
              >
                {visibleHistory.map((location) => (
                  <Pressable
                    key={location}
                    onPress={() => handleHistorySelect(location)}
                    style={({ pressed }) => [
                      styles.historyItem,
                      { borderBottomColor: theme.surface },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="history"
                      size={14}
                      color={theme.textSecondary}
                      style={styles.historyIcon}
                    />
                    <Text
                      style={[
                        styles.historyLabel,
                        { color: theme.textPrimary },
                      ]}
                    >
                      {location}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={handleSubmit}
              style={[styles.searchButton, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.searchButtonLabel}>Search Weather</Text>
            </Pressable>
          </View>

          <View style={styles.sectionSpacing}>
            {isOffline ? (
              <View
                style={[
                  styles.offlineBanner,
                  { backgroundColor: theme.surface },
                ]}
              >
                <MaterialCommunityIcons
                  name="wifi-off"
                  size={16}
                  color={theme.error}
                />
                <Text style={[styles.offlineText, { color: theme.error }]}>
                  {weatherQuery.data
                    ? "You're offline — showing cached data"
                    : "No connection — connect to the internet and search"}
                </Text>
              </View>
            ) : null}

            {!hasSearched ? (
              <View
                style={[styles.stateCard, { backgroundColor: theme.surface }]}
              >
                <Text style={[styles.stateTitle, { color: theme.textPrimary }]}>
                  Idle
                </Text>
                <Text
                  style={[
                    styles.stateDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Enter a location to request normalized weather data from the
                  selected provider.
                </Text>
              </View>
            ) : null}

            {weatherQuery.isPending ? (
              <View
                style={[styles.stateCard, { backgroundColor: theme.surface }]}
              >
                <Text style={[styles.stateTitle, { color: theme.textPrimary }]}>
                  Loading weather...
                </Text>
                <Text
                  style={[
                    styles.stateDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Fetching current conditions from {selectedProvider}.
                </Text>
              </View>
            ) : null}

            {weatherQuery.isError && !weatherQuery.data ? (
              <View
                style={[styles.stateCard, { backgroundColor: theme.surface }]}
              >
                <Text style={[styles.stateTitle, { color: theme.textPrimary }]}>
                  Unable to load weather
                </Text>
                <Text
                  style={[
                    styles.stateDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  {weatherQuery.error instanceof Error
                    ? weatherQuery.error.message
                    : "Unknown weather error."}
                </Text>
              </View>
            ) : null}

            {weatherQuery.data ? (
              <>
                <WeatherCard
                  isRefreshing={weatherQuery.isFetching}
                  theme={theme}
                  weather={weatherQuery.data}
                  temperatureUnit={temperatureUnit}
                />
                <ForecastList
                  forecast={weatherQuery.data.forecast}
                  theme={theme}
                  temperatureUnit={temperatureUnit}
                />
              </>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    gap: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 72,
  },
  heroCopy: {
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    textAlign: "center",
  },
  panel: {
    borderRadius: 28,
    gap: 14,
    padding: 20,
  },
  panelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionSpacing: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  locationButton: {
    alignItems: "center",
    borderRadius: 18,
    justifyContent: "center",
    width: 54,
  },
  validationError: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  historyList: {
    borderRadius: 14,
    overflow: "hidden",
  },
  historyItem: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  historyIcon: {
    marginRight: 10,
  },
  historyLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  searchButton: {
    alignItems: "center",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 16,
  },
  searchButtonLabel: {
    color: "#17324D",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  offlineBanner: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  offlineText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  stateCard: {
    borderRadius: 28,
    gap: 8,
    padding: 20,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  stateDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
});
