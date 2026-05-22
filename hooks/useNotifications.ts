import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenAt, setLastSeenAt] = useState<string>(
    new Date().toISOString()
  );
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    async function fetchUnread() {
      const { count } = await supabase
        .from("sightings")
        .select("*", { count: "exact", head: true })
        .gt("created_at", lastSeenAt);
      setUnreadCount(count ?? 0);
    }

    fetchUnread();

    // Clean up existing channel before creating new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sightings" },
        () => setUnreadCount((prev) => prev + 1)
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  function markAllRead() {
    setLastSeenAt(new Date().toISOString());
    setUnreadCount(0);
  }

  return { unreadCount, markAllRead };
}