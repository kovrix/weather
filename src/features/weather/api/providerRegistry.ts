import type { WeatherProviderRegistry } from "../model/provider";
import { OpenMeteoAdapter } from "./providers/openMeteoAdapter";
import { WttrAdapter } from "./providers/wttrAdapter";
import { MetNorwayAdapter } from "./providers/metNorwayAdapter";

export const weatherProviderRegistry: WeatherProviderRegistry = {
  openMeteo: new OpenMeteoAdapter(),
  wttr: new WttrAdapter(),
  metNorway: new MetNorwayAdapter(),
};
