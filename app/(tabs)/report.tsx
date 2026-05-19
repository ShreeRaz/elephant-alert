import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
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

  async function openGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Gallery permission denied!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  }

  async function openCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission denied!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  }

  function selectImage() {
    Alert.alert("Select Image", "Choose an option", [
      { text: "📷 Camera", onPress: openCamera },
      { text: "🖼️ Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the location..."
      />

      <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
        <Text style={styles.imageButtonText}>📷 Select Image</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.preview} />}

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/modal",
            params: {
              description,
              image: image || "",
            },
          })
        }
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
    marginTop: 60,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 20,
    fontSize: 16,
    color: "black",
  },
  button: {
    backgroundColor: "#f97316",
    padding: 20,
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
