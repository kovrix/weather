import { WeatherScreen } from "../features/weather/ui/WeatherScreen";
import { AppProviders } from "./providers";
import { ErrorBoundary } from "./ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <WeatherScreen />
      </AppProviders>
    </ErrorBoundary>
  );
}
