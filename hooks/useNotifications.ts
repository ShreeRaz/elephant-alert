// hooks/useNotifications.ts
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenAt, setLastSeenAt]   = useState<string>(
    new Date().toISOString()
  );

  useEffect(() => {
    // Count sightings newer than lastSeenAt
    async function fetchUnread() {
      const { count } = await supabase
        .from("sightings")
        .select("*", { count: "exact", head: true })
        .gt("created_at", lastSeenAt);

      setUnreadCount(count ?? 0);
    }

    fetchUnread();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sightings" },
        () => setUnreadCount((prev) => prev + 1)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  function markAllRead() {
    setLastSeenAt(new Date().toISOString());
    setUnreadCount(0);
  }

  return { unreadCount, markAllRead };
}