import AsyncStorage from "@react-native-async-storage/async-storage";

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------
const IMAGE_KEY = "user_profile_image";
const USER_DATA_KEY = "@user_profile_data";
const AUTH_TOKEN_KEY = "@auth_token";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface UserData {
  username: string;
  email?: string;
  password?: string;
}

// ---------------------------------------------------------------------------
// Profile Image
// ---------------------------------------------------------------------------

/** Persist the local URI of the user's chosen profile photo. */
export const saveImage = async (uri: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(IMAGE_KEY, uri);
    return true;
  } catch (e) {
    console.error("saveImage error", e);
    return false;
  }
};

/** Retrieve the stored profile photo URI. Returns null if none saved. */
export const getImage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(IMAGE_KEY);
  } catch (e) {
    console.error("getImage error", e);
    return null;
  }
};

/** Remove the stored profile photo (e.g. on logout). */
export const clearImage = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(IMAGE_KEY);
    return true;
  } catch (e) {
    console.error("clearImage error", e);
    return false;
  }
};

// ---------------------------------------------------------------------------
// User Data (name, email, etc.)
// ---------------------------------------------------------------------------

/** Persist basic user profile data locally for quick UI access. */
export const saveUserData = async (data: UserData): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("saveUserData error", e);
    return false;
  }
};

/** Retrieve locally stored user profile data. */
export const getUserData = async (): Promise<UserData | null> => {
  try {
    const json = await AsyncStorage.getItem(USER_DATA_KEY);
    return json != null ? JSON.parse(json) : null;
  } catch (e) {
    console.error("getUserData error", e);
    return null;
  }
};

/** Remove locally stored user profile data (e.g. on logout). */
export const clearUserData = async (): Promise<boolean> => {
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

/** Persist the JWT / session token returned by the backend after login. */
export const saveAuthToken = async (token: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    return true;
  } catch (e) {
    console.error("saveAuthToken error", e);
    return false;
  }
};

/** Retrieve the stored auth token. Returns null if the user is not logged in. */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    console.error("getAuthToken error", e);
    return null;
  }
};

/** Remove the auth token (call on logout). */
export const clearAuthToken = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    return true;
  } catch (e) {
    console.error("clearAuthToken error", e);
    return false;
  }
};

// ---------------------------------------------------------------------------
// Full Logout Helper — clears everything at once
// ---------------------------------------------------------------------------
export const clearAllUserData = async (): Promise<void> => {
  await Promise.all([clearImage(), clearUserData(), clearAuthToken()]);
};
