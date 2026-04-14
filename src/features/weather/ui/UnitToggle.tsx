import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ProviderTheme } from "@/theme/providerThemes";
import type { TemperatureUnit } from "@/utils/temperature";

type UnitToggleProps = {
  unit: TemperatureUnit;
  onToggle: (unit: TemperatureUnit) => void;
  theme: ProviderTheme;
};

export function UnitToggle({ unit, onToggle, theme }: UnitToggleProps) {
  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceMuted }]}>
      {(["celsius", "fahrenheit"] as TemperatureUnit[]).map((option) => {
        const isActive = unit === option;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            key={option}
            onPress={() => onToggle(option)}
            style={[
              styles.option,
              isActive && { backgroundColor: theme.accent },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? "#17324D" : theme.textSecondary },
              ]}
            >
              {option === "celsius" ? "°C" : "°F"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    flexDirection: "row",
    padding: 3,
  },
  option: {
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
  },
});
