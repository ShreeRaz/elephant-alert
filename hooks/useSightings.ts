import { fetchAllSightings, subscribeToNewSightings } from "@/services/sightings.service";
import { Sighting } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

export function useSightings() {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

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

    // Clean up existing subscription before creating new one
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    unsubscribeRef.current = subscribeToNewSightings((newSighting) => {
      setSightings((prev) => [newSighting, ...prev]);
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  return { sightings, isLoading, error, refetch: loadSightings };
}