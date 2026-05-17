import { supabase } from "@/lib/supabase";
import {
  Camera,
  CameraRef,
  Map,
  Marker,
  UserLocation,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const cameraRef = useRef<CameraRef>(null);

  useEffect(() => {
    getUserLocation();
    fetchSightings();
    subscribeToSightings();
  }, []);

  // Fly to user location when GPS responds
  useEffect(() => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        duration: 1000,
      });
    }
  }, [userLocation]);

  function zoomIn() {
    cameraRef.current?.zoomTo(16, { duration: 300 });
  }

  function zoomOut() {
    cameraRef.current?.zoomTo(8, { duration: 300 });
  }

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
      <Map
        style={styles.map}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [85.324, 27.7172],
            zoom: 5,
          }}
        />
        <UserLocation />
        {sightings.map((s) => (
          <Marker key={s.id} id={s.id} lngLat={[s.longitude, s.latitude]}>
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>🐘</Text>
            </View>
          </Marker>
        ))}
      </Map>
      <View style={styles.zoomButtons}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <Text style={styles.zoomText}>−</Text>
        </TouchableOpacity>
      </View>

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
  markerContainer: {
    backgroundColor: "#f97316",
    borderRadius: 20,
    padding: 4,
  },
  markerText: {
    fontSize: 20,
  },
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
  zoomButtons: {
    position: "absolute",
    right: 16,
    top: "40%",
    gap: 8,
  },
  zoomButton: {
    backgroundColor: "#fff",
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  zoomText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  fabText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
