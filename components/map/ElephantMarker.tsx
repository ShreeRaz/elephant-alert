import { Platform, StyleSheet, Text, View } from "react-native";

// ✅ No shared state, pure render, unique per call
export function ElephantMarker() {
  return (
    <View style={styles.container} collapsable={false}>
      <Text style={styles.emoji}>🐘</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f97316",
    borderRadius: 20,
    padding: 5,
    borderWidth: 2,
    borderColor: "#fff",
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
  emoji: { fontSize: 18 },
});
