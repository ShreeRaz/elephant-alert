
import { MapType } from "react-native-maps";

export type Sighting = {
  id: string;
  latitude: number;
  longitude: number;
  description: string;
  reported_by: string;
  created_at: string;
};

export type MapLayer = {
  type: MapType;
  label: string;
  icon: string;
};