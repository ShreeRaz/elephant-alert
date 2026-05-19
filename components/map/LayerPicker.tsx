import { MAP_LAYERS } from "@/constants/map";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MapType } from "react-native-maps";

type Props = {
  activeType: MapType;
  visible: boolean;
  onSelect: (type: MapType) => void;
  onToggle: () => void;
};

export function LayerPicker({
  activeType,
  visible,
  onSelect,
  onToggle,
}: Props) {
  const activeLayer = MAP_LAYERS.find((l) => l.type === activeType)!;

  return (
    <View style={styles.container}>
      {visible && (
        <View style={styles.picker}>
          {MAP_LAYERS.map(({ type, label, icon }) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.option,
                activeType === type && styles.optionActive,
              ]}
              onPress={() => onSelect(type)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionIcon}>{icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  activeType === type && styles.optionLabelActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <Text style={styles.toggleIcon}>{activeLayer.icon}</Text>
        <Text style={styles.toggleLabel}>{activeLayer.label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const SHADOW = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  android: { elevation: 5 },
});

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    gap: 8,
  },
  picker: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    ...SHADOW,
  },
  option: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  optionActive: { backgroundColor: "#fff3e8" },
  optionIcon: { fontSize: 20 },
  optionLabel: { fontSize: 11, marginTop: 3, color: "#888" },
  optionLabelActive: { color: "#f97316", fontWeight: "700" },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 10,
    ...SHADOW,
  },
  toggleIcon: { fontSize: 18 },
  toggleLabel: { fontSize: 13, fontWeight: "600", color: "#333" },
});
