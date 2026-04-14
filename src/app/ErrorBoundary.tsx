import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          {this.state.error?.message ? (
            <Text style={styles.message}>{this.state.error.message}</Text>
          ) : null}
          <TouchableOpacity style={styles.button} onPress={this.reset}>
            <Text style={styles.buttonLabel}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#0f1923",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    color: "#8ba3ba",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1e6fbf",
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  buttonLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
