import { supabase } from "@/lib/supabase";
import { Sighting } from "@/types";

export async function fetchAllSightings(): Promise<Sighting[]> {
  const { data, error } = await supabase
    .from("sightings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function subscribeToNewSightings(
  onNew: (sighting: Sighting) => void
): () => void {
  const channel = supabase
    .channel("sightings-realtime")
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