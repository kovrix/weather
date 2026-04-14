import * as Network from "expo-network";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

export function useNetworkStatus() {
  // Start optimistic — assume online until proven otherwise.
  // expo-network can report false negatives on simulators/emulators.
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const state = await Network.getNetworkStateAsync();
      if (!cancelled) {
        setIsConnected(state.isConnected ?? false);
      }
    };

    void check();

    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") void check();
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return { isConnected };
}
