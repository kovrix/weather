import { StyleSheet, Text, View } from "react-native";

import type { ProviderTheme } from "../theme/providerThemes";

type MetricPillProps = {
  label: string;
  value: string;
  theme: ProviderTheme;
};

export function MetricPill({ label, value, theme }: MetricPillProps) {
  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceMuted }]}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    gap: 4,
    minWidth: 112,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
  },
});
