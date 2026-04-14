import { Platform, StyleSheet, View } from "react-native";

import { WeatherScreen } from "../features/weather/ui/WeatherScreen";
import { AppProviders } from "./providers";
import { ErrorBoundary } from "./ErrorBoundary";

const app = (
  <ErrorBoundary>
    <AppProviders>
      <WeatherScreen />
    </AppProviders>
  </ErrorBoundary>
);

export default function App() {
  if (Platform.OS !== "web") {
    return app;
  }

  return (
    <View style={styles.webBackground}>
      <View style={styles.phoneFrame}>{app}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  webBackground: {
    alignItems: "center",
    backgroundColor: "#070e1a",
    flex: 1,
    justifyContent: "flex-start",
    minHeight: "100%" as unknown as number,
  },
  phoneFrame: {
    flex: 1,
    maxWidth: 430,
    minHeight: "100%" as unknown as number,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    width: "100%" as unknown as number,
  },
});
