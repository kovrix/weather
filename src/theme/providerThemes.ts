import type { WeatherProviderId } from "../features/weather/model/types";

export type ProviderTheme = {
  background: [string, string, string];
  surface: string;
  surfaceMuted: string;
  accent: string;
  accentSoft: string;
  textPrimary: string;
  textSecondary: string;
  error: string;
};

export const providerThemes: Record<WeatherProviderId, ProviderTheme> = {
  openMeteo: {
    background: ["#102A43", "#1F4E79", "#2C7FB8"],
    surface: "rgba(235, 245, 255, 0.16)",
    surfaceMuted: "rgba(235, 245, 255, 0.12)",
    accent: "#FFCC66",
    accentSoft: "#FFEFC9",
    textPrimary: "#F4FAFF",
    textSecondary: "#CFE2F2",
    error: "#FFD7D7",
  },
  wttr: {
    background: ["#173F5F", "#20639B", "#3CAEA3"],
    surface: "rgba(246, 246, 236, 0.16)",
    surfaceMuted: "rgba(246, 246, 236, 0.12)",
    accent: "#F6D55C",
    accentSoft: "#FFF6CC",
    textPrimary: "#F7FFF7",
    textSecondary: "#D8F3EE",
    error: "#FFD7C2",
  },
};

export function getProviderTheme(provider: WeatherProviderId) {
  return providerThemes[provider];
}
