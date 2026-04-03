import AsyncStorage from "@react-native-async-storage/async-storage";

const IMAGE_KEY = "user_profile_image";
const USER_DATA_KEY = "@user_profile_data";
const AUTH_TOKEN_KEY = "@auth_token";

// ---------------------------------------------------------------------------
// Profile Image
// ---------------------------------------------------------------------------

export const saveImage = async (uri) => {
  try {
    await AsyncStorage.setItem(IMAGE_KEY, uri);
    return true;
  } catch (e) {
    console.error("saveImage error", e);
    return false;
  }
};

export const getImage = async () => {
  try {
    return await AsyncStorage.getItem(IMAGE_KEY);
  } catch (e) {
    console.error("getImage error", e);
    return null;
  }
};

export const clearImage = async () => {
  try {
    await AsyncStorage.removeItem(IMAGE_KEY);
    return true;
  } catch (e) {
    console.error("clearImage error", e);
    return false;
  }
};

// ---------------------------------------------------------------------------
// User Data  { username, email, mobile }
// ---------------------------------------------------------------------------

export const saveUserData = async (data) => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("saveUserData error", e);
    return false;
  }
};

export const getUserData = async () => {
  try {
    const json = await AsyncStorage.getItem(USER_DATA_KEY);
    return json != null ? JSON.parse(json) : null;
  } catch (e) {
    console.error("getUserData error", e);
    return null;
  }
};

export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
    return true;
  } catch (e) {
    console.error("clearUserData error", e);
    return false;
  }
};

// ---------------------------------------------------------------------------
// Auth Token
// ---------------------------------------------------------------------------

export const saveAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    return true;
  } catch (e) {
    console.error("saveAuthToken error", e);
    return false;
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    console.error("getAuthToken error", e);
    return null;
  }
};

export const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    return true;
  } catch (e) {
    console.error("clearAuthToken error", e);
    return false;
  }
};

// ---------------------------------------------------------------------------
// Full logout — clears everything at once
// ---------------------------------------------------------------------------
export const clearAllUserData = async () => {
  await Promise.all([clearImage(), clearUserData(), clearAuthToken()]);
};
