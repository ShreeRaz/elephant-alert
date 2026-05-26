import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const isLocatingRef = useRef(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  // Auto-watch location on mount
  useEffect(() => {
    async function startWatching() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      // Clean up existing watcher
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,   // update every 10 seconds
          distanceInterval: 10,  // or every 10 meters
        },
        (location) => {
          setLastLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    }

    startWatching();

    return () => {
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    };
  }, []);

  // Manual locate (for map centering etc.)
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
  }, []);

  return { isLocating, lastLocation, locateUser };
}