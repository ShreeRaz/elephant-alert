import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export function ZoomControls({ onZoomIn, onZoomOut }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onZoomIn}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={onZoomOut}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#fff",
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
      },
      android: { elevation: 5 },
    }),
  },
  buttonText: {
    fontSize: 26,
    fontWeight: "600",
    color: "#333",
    lineHeight: 30,
  },
});
