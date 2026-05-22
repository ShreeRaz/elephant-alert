import { supabase } from "@/lib/supabase";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const NOTIFY_URL =
  "https://ebhvroepnkrlwcjrcpgy.supabase.co/functions/v1/notify-sighting";

export default function ModalScreen() {
  const router = useRouter();
  const { description, image } = useLocalSearchParams<{
    description: string;
    image?: string;
  }>();
  const [loading, setLoading] = useState(false);

  async function sendAlert() {
    if (loading) return;
    setLoading(true);

    try {
      // 1. Check location permission explicitly
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Required",
          "Enable location permission to report a sighting.",
          [{ text: "OK" }],
        );
        return;
      }

      // 2. Get high accuracy coords
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      // 3. Save sighting to Supabase
      const { error: insertError } = await supabase.from("sightings").insert({
        latitude: coords.latitude,
        longitude: coords.longitude,
        description: description ?? "Elephant sighted",
        photo_url: image ?? null,
        reported_by: "anonymous",
      });

      if (insertError) throw insertError;

      // 4. Trigger push notifications to all devices via Edge Function
      const res = await fetch(NOTIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          description,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      });

      if (!res.ok) throw new Error(`Edge function failed: ${await res.text()}`);

      // 5. Navigate to map focused on this sighting
      Alert.alert(
        "✅ Alert Sent!",
        "All nearby users have been notified about the elephant sighting.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
        ],
      );
    } catch (err) {
      console.error("sendAlert error:", err);
      Alert.alert("Error", "Failed to send alert. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.title}>Send Elephant Alert</Text>
      <Text style={styles.subtitle}>
        Your location will be shared with all nearby users immediately.
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, loading && styles.disabled]}
          onPress={sendAlert}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.sendText}>
            {loading ? "Sending..." : "Send Alert"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  emoji: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 8 },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 36,
    textAlign: "center",
    lineHeight: 22,
  },
  buttons: { flexDirection: "row", gap: 12, width: "100%" },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  sendButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f97316",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#f97316",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  disabled: { opacity: 0.6 },
  cancelText: { fontSize: 16, color: "#666", fontWeight: "500" },
  sendText: { fontSize: 16, color: "#fff", fontWeight: "700" },
});
