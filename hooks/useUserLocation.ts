import * as Location from "expo-location";
import { useCallback, useState } from "react";
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
  const [isLocating, setIsLocating]       = useState(false);
  const [lastLocation, setLastLocation]   = useState<LocationCoords | null>(null);

  const locateUser = useCallback(async (): Promise<LocationCoords | null> => {
    if (isLocating) return null;
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
      setIsLocating(false);
    }
  }, [isLocating]);

  return { isLocating, lastLocation, locateUser };
}