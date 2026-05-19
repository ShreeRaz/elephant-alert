import { fetchAllSightings, subscribeToNewSightings } from "@/services/sightings.service";
import { Sighting } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export function useSightings() {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [isLoading, setIsLoading]  = useState(true);
  const [error, setError]          = useState<string | null>(null);

  const loadSightings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAllSightings();
      setSightings(data);
    } catch (err) {
      const message = "Failed to load sightings.";
      setError(message);
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSightings();

    const unsubscribe = subscribeToNewSightings((newSighting) => {
      setSightings((prev) => [newSighting, ...prev]);
    });

    return unsubscribe;
  }, []);

  return { sightings, isLoading, error, refetch: loadSightings };
}