import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { weatherProviderRegistry } from "../api/providerRegistry";
import { useWeather } from "../hooks/useWeather";
import type { WeatherProviderRegistry } from "../model/provider";
import { parseLocationInput } from "../model/validation";
import { ForecastList } from "./ForecastList";
import { ProviderToggle } from "./ProviderToggle";
import { WeatherCard } from "./WeatherCard";
import { getProviderTheme } from "@/theme/providerThemes";
import { useWeatherPreferencesStore } from "@/store/weatherPreferencesStore";

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
  const setLastSearchedLocation = useWeatherPreferencesStore(
    (state) => state.setLastSearchedLocation,
  );
  const [locationInput, setLocationInput] = useState(lastSearchedLocation);
  const [validationError, setValidationError] = useState<string | null>(null);
  const theme = useMemo(
    () => getProviderTheme(selectedProvider),
    [selectedProvider],
  );
  const { weatherQuery } = useWeather({ registry });

  useEffect(() => {
    setLocationInput(lastSearchedLocation);
  }, [lastSearchedLocation]);

  const handleSubmit = () => {
    const result = parseLocationInput(locationInput);

    if (!result.success) {
      setValidationError(
        result.error.issues[0]?.message ?? "Enter a valid location.",
      );
      return;
    }

    setValidationError(null);
    setLocationInput(result.data);
    setLastSearchedLocation(result.data);
  };

  const hasSearched = Boolean(lastSearchedLocation);

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
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Location
            </Text>
            <TextInput
              accessibilityLabel="Location input"
              autoCapitalize="words"
              autoCorrect={false}
              onChangeText={setLocationInput}
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
            {validationError ? (
              <Text style={[styles.validationError, { color: theme.error }]}>
                {validationError}
              </Text>
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

            {weatherQuery.isError ? (
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
                />
                <ForecastList
                  forecast={weatherQuery.data.forecast}
                  theme={theme}
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
  title: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.2,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  panel: {
    borderRadius: 28,
    gap: 14,
    padding: 20,
  },
  sectionSpacing: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  validationError: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
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
