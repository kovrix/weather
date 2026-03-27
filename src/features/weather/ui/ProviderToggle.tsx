import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ProviderTheme } from "../../../theme/providerThemes";
import {
  WEATHER_PROVIDER_OPTIONS,
  type WeatherProviderId,
} from "../model/types";

type ProviderToggleProps = {
  selectedProvider: WeatherProviderId;
  onSelect: (provider: WeatherProviderId) => void;
  theme: ProviderTheme;
};

export function ProviderToggle({
  selectedProvider,
  onSelect,
  theme,
}: ProviderToggleProps) {
  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {WEATHER_PROVIDER_OPTIONS.map((option) => {
        const isActive = option.id === selectedProvider;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[
              styles.option,
              { borderColor: theme.surfaceMuted },
              isActive && { backgroundColor: theme.accent },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? "#17324D" : theme.textPrimary },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    flexDirection: "row",
    gap: 8,
    padding: 6,
    justifyContent: "center",
  },
  option: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
});
