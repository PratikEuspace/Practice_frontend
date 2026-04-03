import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getImage, saveImage } from "@/src/services/storage";
import { pickImage } from "@/src/utils/imagePicker";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileImage() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Step 5: Read stored data immediately upon render mount
  useEffect(() => {
    loadStoredImage();
  }, []);

  const loadStoredImage = async () => {
    setLoading(true);
    const stored = await getImage();
    if (stored) {
      setImageUri(stored);
    }
    setLoading(false);
  };

  /**
   * Action trigger sequence mapping to user UX. Invokes picker
   * and subsequently pushes to the abstracted AsyncStorage pipe.
   */
  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      setImageUri(uri); // Update UI Instantly
      await saveImage(uri); // Store it universally in device disk
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePickImage}
        activeOpacity={0.8}
        style={styles.imageWrapper}
      >
        {loading ? (
          <ActivityIndicator color="#E91E63" />
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={32} color="#888" />
            <Text style={styles.placeholderText}>Tap to add</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  imageWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: "#E91E63",
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#888",
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
  },
});
