import { fetchJson } from "../../../../utils/fetchJson";
import type { WeatherProvider } from "../../model/provider";
import { mapWttrResponse, type WttrResponse } from "../mappers/wttrMapper";

export class WttrAdapter implements WeatherProvider {
  readonly id = "wttr" as const;

  readonly displayName = "wttr.in";

  async getWeather(params: { location: string }) {
    const url = `https://wttr.in/${encodeURIComponent(params.location)}?format=j1`;
    const response = await fetchJson<WttrResponse>(url);

    return {
      provider: this.id,
      ...mapWttrResponse(response),
    };
  }
}
