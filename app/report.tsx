import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";

export default function ReportScreen() {
  const [description, setDescription] = useState("");
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the location..."
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("Alert tapped!")}
      >
        <Text style={styles.buttonText}>🐘 Send Alert</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "white",
  },
  button: {
    backgroundColor: "#f97316",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
