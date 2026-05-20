import { ElephantMarker } from "@/components/map/ElephantMarker";
import { LayerPicker } from "@/components/map/LayerPicker";
import { LocateButton } from "@/components/map/LocateButton";
import { ZoomControls } from "@/components/map/ZoomControls";
import {
  DEFAULT_ZOOM,
  LOCATION_ZOOM_DELTA,
  MIN_ZOOM,
  NEPAL_REGION,
} from "@/constants/map";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [isMapReady, setIsMapReady] = useState(false); // ✅ declared here

  const { isLocating, locateUser } = useUserLocation();

  // ✅ params declared before useEffect
  const { lat, lng } = useLocalSearchParams<{ lat?: string; lng?: string }>();

  const selectedLocation = useMemo(() => {
    if (!lat || !lng) return null;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) return null;

    return { latitude, longitude };
  }, [lat, lng]);
  // ✅ useEffect AFTER all declarations
  useEffect(() => {
    if (!isMapReady) return;
    if (!selectedLocation) return;

    const { latitude, longitude } = selectedLocation;

    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      900,
    );
  }, [isMapReady, selectedLocation]);
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
        onMapReady={() => setIsMapReady(true)}
        onPress={() => setShowLayerPicker(false)}
      >
        {selectedLocation && (
          <Marker coordinate={selectedLocation}>
            <ElephantMarker />
          </Marker>
        )}
      </MapView>

      <View style={styles.rightControls}>
        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
        <View style={styles.divider} />
        <LocateButton isLocating={isLocating} onPress={handleLocate} />
      </View>

      <View style={styles.layerContainer}>
        <LayerPicker
          activeType={mapType}
          visible={showLayerPicker}
          onSelect={setMapType}
          onToggle={() => setShowLayerPicker((v) => !v)}
        />
      </View>

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
