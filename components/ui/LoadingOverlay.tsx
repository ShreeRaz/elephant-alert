import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type Props = {
  message?: string;
};

export function LoadingOverlay({ message = "Loading..." }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#f97316" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: { marginTop: 12, fontSize: 16, color: "#666" },
});
