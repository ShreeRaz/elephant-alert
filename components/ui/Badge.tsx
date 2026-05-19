import { StyleSheet, Text, View } from "react-native";

type Props = {
  count: number;
};

export function SightingsBadge({ count }: Props) {
  if (count === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {/* 🐘 {count} sighting{count !== 1 ? "s" : ""} */}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  text: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
