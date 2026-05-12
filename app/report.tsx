import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ReportScreen() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();

  // Function to pick an image from the gallery

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the location..."
      />
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>📷 Add Photo</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.preview} />}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/modal")}
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
  imageButton: {
    borderWidth: 1,
    borderColor: "#f97316",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  imageButtonText: {
    color: "#f97316",
    fontWeight: "bold",
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
});
