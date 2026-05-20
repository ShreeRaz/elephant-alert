import { supabase } from "@/lib/supabase";
import { Sighting } from "@/types";
import * as Location from "expo-location";

export async function fetchAllSightings(): Promise<Sighting[]> {
  const { data, error } = await supabase
    .from("sightings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results.length === 0) return "Unknown location";
    const r = results[0];
    return (
      r.district ||
      r.city ||
      r.subregion ||
      r.region ||
      "Unknown location"
    );
  } catch {
    return "Unknown location";
  }
}

export function subscribeToNewSightings(
  onNew: (sighting: Sighting) => void
): () => void {
  // Use a unique channel name each time to avoid reuse conflicts
  const channelName = `sightings-realtime-${Date.now()}`;
  
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "sightings" },
      (payload) => onNew(payload.new as Sighting)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}