import { act } from "@testing-library/react-native";

import { resetWeatherPreferencesStore } from "./src/store/weatherPreferencesStore";

afterEach(() => {
  jest.clearAllMocks();
  act(() => {
    resetWeatherPreferencesStore();
  });
});
