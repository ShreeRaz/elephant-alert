import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.title}>Send Elephant Alert</Text>
      <Text style={styles.subtitle}>Send elephant alert to nearby users?</Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => console.log("Sending...")}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  buttons: { flexDirection: "row", gap: 12 },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  sendButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f97316",
    alignItems: "center",
  },
  cancelText: { fontSize: 16, color: "#666" },
  sendText: { fontSize: 16, color: "#fff", fontWeight: "bold" },
});
