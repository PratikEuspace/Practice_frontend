import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

/**
 * Step 3: Image Picker Utility
 * Utility function to cleanly request permissions and prompt device gallery access.
 */
export const pickImage = async () => {
  // Gracefully handle platform permissions
  if (Platform.OS !== "web") {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to update your profile photo!",
      );
      return null;
    }
  }

  try {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1], // Perfect square for standard avatars
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error("Error launching image library: ", error);
    return null;
  }
};

// import * as ImagePicker from 'expo-image-picker';
// import { Alert, Platform } from 'react-native';

// /**
//  * Step 3: Image Picker Utility
//  * Utility function to cleanly request permissions and prompt device gallery access.
//  * @returns {Promise<string | null>} The URI of the selected media
//  */
// export const pickImage = async (): Promise<string | null> => {
//   // Gracefully handle platform permissions
//   if (Platform.OS !== 'web') {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to update your profile photo!');
//       return null;
//     }
//   }

//   try {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1], // Perfect square for standard avatars
//       quality: 0.8,
//     });

//     if (!result.canceled && result.assets && result.assets.length > 0) {
//       return result.assets[0].uri;
//     }
//     return null;
//   } catch (error) {
//     console.error('Error launching image library: ', error);
//     return null;
//   }
// };
