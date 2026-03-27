import { WeatherScreen } from "../features/weather/ui/WeatherScreen";
import { AppProviders } from "./providers";

export default function App() {
  return (
    <AppProviders>
      <WeatherScreen />
    </AppProviders>
  );
}
