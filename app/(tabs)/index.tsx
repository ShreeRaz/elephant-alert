// app/(tabs)/index.tsx
import { supabase } from "@/lib/supabase";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";

type Sighting = {
  id: string;
  latitude: number;
  longitude: number;
  description: string;
  reported_by: string;
  created_at: string;
};

export default function MapScreen() {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getUserLocation();
    fetchSightings();
    subscribeToSightings();
  }, []);

  async function getUserLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Location access is needed to show your position.",
      );
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  }

  async function fetchSightings() {
    const { data, error } = await supabase
      .from("sightings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setSightings(data);
    setLoading(false);
  }

  function subscribeToSightings() {
    // Real-time: new sightings appear on map instantly
    const channel = supabase
      .channel("sightings-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sightings" },
        (payload) => setSightings((prev) => [payload.new as Sighting, ...prev]),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading sightings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude ?? 20.5937,
          longitude: userLocation?.longitude ?? 78.9629,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {sightings.map((s) => (
          <Marker
            key={s.id}
            coordinate={{ latitude: s.latitude, longitude: s.longitude }}
            pinColor="#f97316"
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>🐘 Elephant Sighting</Text>
                <Text style={styles.calloutDesc}>
                  {s.description || "No description"}
                </Text>
                <Text style={styles.calloutMeta}>
                  Reported by: {s.reported_by || "Anonymous"}
                </Text>
                <Text style={styles.calloutMeta}>
                  {new Date(s.created_at).toLocaleString()}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Report FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/report")}
      >
        <Text style={styles.fabText}>🐘 Report Sighting</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  callout: { width: 200, padding: 8 },
  calloutTitle: { fontWeight: "bold", fontSize: 14, marginBottom: 4 },
  calloutDesc: { fontSize: 13, marginBottom: 4 },
  calloutMeta: { fontSize: 11, color: "#888" },
  fab: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    backgroundColor: "#f97316",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 32,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
