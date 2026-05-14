import { supabase } from "@/lib/supabase";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ModalScreen() {
  const router = useRouter();
  const { description, image } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  async function sendAlert() {
    setLoading(true);
    try {
      // 1. Get user location
      const { coords } = await Location.getCurrentPositionAsync({});

      // 2. Save sighting to Supabase
      const { error } = await supabase.from("sightings").insert({
        latitude: coords.latitude,
        longitude: coords.longitude,
        description,
        photo_url: image || null,
      });

      if (error) throw error;

      // 3. Call Edge Function to notify all users
      await fetch(
        "https://ebhvroepnkrlwcjrcpgy.supabase.co/functions/v1/notify-sighting",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            latitude: coords.latitude,
            longitude: coords.longitude,
          }),
        },
      );

      // 4. Go back to map
      router.dismissAll();
    } catch (err) {
      console.log("Error sending alert:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.title}>Send Elephant Alert</Text>
      <Text style={styles.subtitle}>Send elephant alert to nearby users?</Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, loading && { opacity: 0.7 }]}
          onPress={sendAlert}
          disabled={loading}
        >
          <Text style={styles.sendText}>{loading ? "Sending..." : "Send"}</Text>
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
    padding: 20,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  buttons: { flexDirection: "row", gap: 12 },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  sendButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f97316",
    alignItems: "center",
  },
  cancelText: { fontSize: 16, color: "#666" },
  sendText: { fontSize: 16, color: "#fff", fontWeight: "bold" },
});
