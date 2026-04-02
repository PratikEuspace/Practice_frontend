import AsyncStorage from '@react-native-async-storage/async-storage';

const IMAGE_KEY = 'user_profile_image';

// Step 4: AsyncStorage Service

/**
 * Save image URI in AsyncStorage
 * @param uri Local file path of selected photo
 */
export const saveImage = async (uri: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(IMAGE_KEY, uri);
    return true;
  } catch (e) {
    console.error('AsyncStorage - Error saving image', e);
    return false;
  }
};

/**
 * Retrieve image URI from AsyncStorage
 */
export const getImage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(IMAGE_KEY);
  } catch (e) {
    console.error('AsyncStorage - Error reading image', e);
    return null;
  }
};

/**
 * Clear stored image (optional helper)
 */
export const clearImage = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(IMAGE_KEY);
    return true;
  } catch (e) {
    console.error('AsyncStorage - Error clearing image', e);
    return false;
  }
};

// Keeping the older unified UserData for backwards compatibility of text operations
const USER_DATA_KEY = '@user_profile_data';
export interface UserData {
  username: string;
  password?: string;
}
export const getUserData = async (): Promise<UserData | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_DATA_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    return null;
  }
};
export const saveUserData = async (data: UserData): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
};
