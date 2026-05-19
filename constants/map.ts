import { MapLayer } from "@/types";
import { Region } from "react-native-maps";

export const MAP_LAYERS: MapLayer[] = [
  { type: "standard",  label: "Map",       icon: "🗺️" },
  { type: "satellite", label: "Satellite", icon: "🛰️" },
  { type: "terrain",   label: "Terrain",   icon: "⛰️" },
];

export const NEPAL_REGION: Region = {
  latitude: 27.7172,
  longitude: 85.324,
  latitudeDelta: 10,
  longitudeDelta: 10,
};

export const LOCATION_ZOOM_DELTA = 0.01;
export const MIN_ZOOM = 3;
export const DEFAULT_ZOOM = 12;