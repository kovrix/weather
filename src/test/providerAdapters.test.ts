import { OpenMeteoAdapter } from "../features/weather/api/providers/openMeteoAdapter";
import { WttrAdapter } from "../features/weather/api/providers/wttrAdapter";

describe("weather adapters", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("maps Open-Meteo responses into the domain model", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              name: "Berlin",
              country: "Germany",
              latitude: 52.52,
              longitude: 13.41,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          current: {
            temperature_2m: 18.4,
            relative_humidity_2m: 62,
            weather_code: 2,
            wind_speed_10m: 21.2,
          },
        }),
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    const adapter = new OpenMeteoAdapter();
    const weather = await adapter.getWeather({ location: "Berlin" });

    expect(weather).toMatchObject({
      provider: "openMeteo",
      locationName: "Berlin, Germany",
      temperatureCelsius: 18.4,
      weatherCondition: "Partly cloudy",
      icon: "⛅",
      humidity: 62,
      windSpeedKph: 21.2,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("maps wttr.in responses into the domain model", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current_condition: [
          {
            temp_C: "11",
            humidity: "70",
            windspeedKmph: "14",
            weatherDesc: [{ value: "Light rain" }],
            weatherIconUrl: [{ value: "https://cdn.example.com/rain.png" }],
          },
        ],
        nearest_area: [
          {
            areaName: [{ value: "London" }],
            country: [{ value: "United Kingdom" }],
          },
        ],
      }),
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const adapter = new WttrAdapter();
    const weather = await adapter.getWeather({ location: "London" });

    expect(weather).toMatchObject({
      provider: "wttr",
      locationName: "London, United Kingdom",
      temperatureCelsius: 11,
      weatherCondition: "Light rain",
      icon: "https://cdn.example.com/rain.png",
      humidity: 70,
      windSpeedKph: 14,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
