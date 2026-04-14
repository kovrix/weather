import { act } from "@testing-library/react-native";

jest.mock("expo-network", () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({ isConnected: true }),
}));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 0, longitude: 0 },
  }),
  reverseGeocodeAsync: jest
    .fn()
    .mockResolvedValue([{ city: "London", region: null, country: "UK" }]),
  Accuracy: { Balanced: 3 },
}));

jest.mock("@react-native-async-storage/async-storage", () => {
  const storage = new Map<string, string>();

  return {
    __esModule: true,
    default: {
      setItem: jest.fn(async (key: string, value: string) => {
        storage.set(key, value);
      }),
      getItem: jest.fn(async (key: string) => storage.get(key) ?? null),
      removeItem: jest.fn(async (key: string) => {
        storage.delete(key);
      }),
      clear: jest.fn(async () => {
        storage.clear();
      }),
      getAllKeys: jest.fn(async () => Array.from(storage.keys())),
      multiGet: jest.fn(async (keys: string[]) =>
        keys.map((key) => [key, storage.get(key) ?? null]),
      ),
      multiSet: jest.fn(async (entries: Array<[string, string]>) => {
        entries.forEach(([key, value]) => {
          storage.set(key, value);
        });
      }),
      multiRemove: jest.fn(async (keys: string[]) => {
        keys.forEach((key) => {
          storage.delete(key);
        });
      }),
    },
  };
});

import { resetWeatherPreferencesStore } from "./src/store/weatherPreferencesStore";

afterEach(() => {
  jest.clearAllMocks();
  return act(async () => {
    await resetWeatherPreferencesStore();
  });
});
