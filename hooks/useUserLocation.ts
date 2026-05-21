import * as Location from "expo-location";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";

type LocationCoords = {
  latitude: number;
  longitude: number;
};

type UseUserLocationReturn = {
  isLocating: boolean;
  lastLocation: LocationCoords | null;
  locateUser: () => Promise<LocationCoords | null>;
};

export function useUserLocation(): UseUserLocationReturn {
  const [isLocating, setIsLocating] = useState(false);
  const [lastLocation, setLastLocation] = useState<LocationCoords | null>(null);
  const isLocatingRef = useRef(false); // ← use ref instead of state for the guard

  const locateUser = useCallback(async (): Promise<LocationCoords | null> => {
    if (isLocatingRef.current) return null;
    isLocatingRef.current = true;
    setIsLocating(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Access Denied",
          "Enable location permissions in Settings to use this feature.",
          [{ text: "OK" }]
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const coords: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setLastLocation(coords);
      return coords;
    } catch {
      Alert.alert(
        "Location Error",
        "Could not retrieve your location. Please try again.",
        [{ text: "OK" }]
      );
      return null;
    } finally {
      isLocatingRef.current = false;
      setIsLocating(false);
    }
  }, []); // ← empty deps, stable forever

  return { isLocating, lastLocation, locateUser };
}