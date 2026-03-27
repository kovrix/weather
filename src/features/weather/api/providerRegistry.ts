import type { WeatherProviderRegistry } from "../model/provider";
import { OpenMeteoAdapter } from "./providers/openMeteoAdapter";
import { WttrAdapter } from "./providers/wttrAdapter";

export const weatherProviderRegistry: WeatherProviderRegistry = {
  openMeteo: new OpenMeteoAdapter(),
  wttr: new WttrAdapter(),
};
