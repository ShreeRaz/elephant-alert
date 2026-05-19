import { ElephantMarker } from "@/components/map/ElephantMarker";
import { LayerPicker } from "@/components/map/LayerPicker";
import { LocateButton } from "@/components/map/LocateButton";
import { ZoomControls } from "@/components/map/ZoomControls";
import { SightingsBadge } from "@/components/ui/Badge";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import {
  DEFAULT_ZOOM,
  LOCATION_ZOOM_DELTA,
  MIN_ZOOM,
  NEPAL_REGION,
} from "@/constants/map";
import { useSightings } from "@/hooks/useSightings";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { MapType, Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [mapType, setMapType] = useState<MapType>("standard");
  const [showLayerPicker, setShowLayerPicker] = useState(false);

  const { sightings, isLoading } = useSightings();
  const { isLocating, locateUser } = useUserLocation();

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleLocate = useCallback(async () => {
    setShowLayerPicker(false);
    const coords = await locateUser();
    if (!coords) return;

    mapRef.current?.animateToRegion(
      {
        ...coords,
        latitudeDelta: LOCATION_ZOOM_DELTA,
        longitudeDelta: LOCATION_ZOOM_DELTA,
      },
      800,
    );
  }, [locateUser]);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.getCamera().then((cam) => {
      mapRef.current?.animateCamera(
        { zoom: (cam.zoom ?? DEFAULT_ZOOM) + 2 },
        { duration: 250 },
      );
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.getCamera().then((cam) => {
      mapRef.current?.animateCamera(
        { zoom: Math.max((cam.zoom ?? DEFAULT_ZOOM) - 2, MIN_ZOOM) },
        { duration: 250 },
      );
    });
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return <LoadingOverlay message="Loading sightings..." />;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType={mapType}
        initialRegion={NEPAL_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        rotateEnabled={true}
        pitchEnabled={false}
        toolbarEnabled={false}
        onPress={() => setShowLayerPicker(false)}
      >
        {sightings.map((s) => (
          <Marker
            key={s.id}
            coordinate={{ latitude: s.latitude, longitude: s.longitude }}
            title={s.description}
            description={`Reported by ${s.reported_by}`}
            tracksViewChanges={false}
          >
            <ElephantMarker />
          </Marker>
        ))}
      </MapView>

      {/* Right controls */}
      <View style={styles.rightControls}>
        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
        <View style={styles.divider} />
        <LocateButton isLocating={isLocating} onPress={handleLocate} />
      </View>

      {/* Layer picker */}
      <View style={styles.layerContainer}>
        <LayerPicker
          activeType={mapType}
          visible={showLayerPicker}
          onSelect={setMapType}
          onToggle={() => setShowLayerPicker((v) => !v)}
        />
      </View>

      {/* Badge */}
      <SightingsBadge count={sightings.length} />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/report")}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>🐘 Report Sighting</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  map: { flex: 1 },
  rightControls: {
    position: "absolute",
    right: 12,
    top: "35%",
    gap: 6,
    alignItems: "center",
  },
  divider: {
    width: 30,
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 2,
  },
  layerContainer: {
    position: "absolute",
    bottom: 108,
    left: 12,
  },
  fab: {
    position: "absolute",
    bottom: 36,
    alignSelf: "center",
    backgroundColor: "#f97316",
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 6 },
    }),
  },
  fabText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
