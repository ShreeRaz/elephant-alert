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
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { MapType, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [navigating, setNavigating] = useState(false);
  const [mapType, setMapType] = useState<MapType>("standard");
  const [showLayerPicker, setShowLayerPicker] = useState(false);

  const {
    isLocating,
    locateUser,
    lastLocation: userLocation,
  } = useUserLocation();

  const { lat, lng } = useLocalSearchParams<{ lat?: string; lng?: string }>();

  const selectedLocation = useMemo(() => {
    if (!lat || !lng) return null;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) return null;

    return { latitude, longitude };
  }, [lat, lng]);

  useFocusEffect(
    useCallback(() => {
      if (!selectedLocation || !mapRef.current) return;

      const timeout = setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          },
          900,
        );
      }, 250);

      return () => clearTimeout(timeout);
    }, [selectedLocation]),
  );
  // Handlers

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

  // Render
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
        {selectedLocation && (
          <Marker coordinate={selectedLocation}>
            <ElephantMarker />
          </Marker>
        )}
        {navigating && selectedLocation && userLocation && (
          <MapViewDirections
            origin={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            destination={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!}
            strokeWidth={4}
            strokeColor="#f97316"
            onReady={(result) => {
              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
              });
            }}
          />
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
      {selectedLocation && (
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={() => setNavigating((v) => !v)}
        >
          <Text style={styles.navigateText}>
            {navigating ? "✕ Stop" : "🧭 Navigate"}
          </Text>
        </TouchableOpacity>
      )}
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
  navigateButton: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#1a2e1a",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 32,
    elevation: 6,
  },
  navigateText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
