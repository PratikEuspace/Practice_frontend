import axios from "axios";

// ---------------------------------------------------------------------------
// 🔧 MOCK FLAG — flip to `false` when your backend is ready
// ---------------------------------------------------------------------------
const USE_MOCK = true;

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------
const BASE = process.env.EXPO_PUBLIC_API_URL || "https://example.com/api";

export const ENDPOINTS = {
  auth: {
    register: `${BASE}/register`,
    login: `${BASE}/login`,
    profile: `${BASE}/profile`,
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface RegisterPayload {
  email: string;
  password: string;
}

export interface ProfilePayload {
  name: string;
  profileImage: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    status: "pending" | "approved" | "rejected";
  };
}

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

/** Simulates network latency so the UI behaves realistically */
const mockDelay = (ms = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * In-memory store for the mock session.
 * Holds the current user status so getUserProfile returns
 * whatever was last set — useful for testing the pending → approved flow.
 */
const mockSession: {
  token: string;
  user: AuthResponse["user"];
} = {
  token: "mock-token-abc123",
  user: {
    id: "mock-user-1",
    name: "",
    email: "",
    // ✏️  Change this to "approved" or "rejected" to test those flows
    status: "pending",
  },
};

// ---------------------------------------------------------------------------
// Mock implementations
// ---------------------------------------------------------------------------

const mock = {
  registerUser: async (data: RegisterPayload): Promise<AuthResponse> => {
    await mockDelay();
    mockSession.user.email = data.email;
    mockSession.user.status = "pending"; // always starts pending
    return { ...mockSession };
  },

  saveUserProfile: async (
    _token: string,
    data: ProfilePayload,
  ): Promise<void> => {
    await mockDelay();
    mockSession.user.name = data.name;
  },

  loginUser: async (data: LoginPayload): Promise<AuthResponse> => {
    await mockDelay();
    mockSession.user.email = data.email;
    return { ...mockSession };
  },

  getUserProfile: async (_token: string): Promise<AuthResponse["user"]> => {
    await mockDelay(400);
    return { ...mockSession.user };
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ---------------------------------------------------------------------------
// Exported API functions
// Each one delegates to mock or real network based on USE_MOCK
// ---------------------------------------------------------------------------

export const registerUser = async (
  data: RegisterPayload,
): Promise<AuthResponse> => {
  if (USE_MOCK) return mock.registerUser(data);
  try {
    const res = await axios.post(ENDPOINTS.auth.register, data);
    return res.data;
  } catch (error: any) {
    console.error(
      "registerUser error:",
      error?.response?.data || error.message,
    );
    throw error;
  }
};

export const saveUserProfile = async (
  token: string,
  data: ProfilePayload,
): Promise<void> => {
  if (USE_MOCK) return mock.saveUserProfile(token, data);
  try {
    await axios.patch(ENDPOINTS.auth.profile, data, authHeader(token));
  } catch (error: any) {
    console.error(
      "saveUserProfile error:",
      error?.response?.data || error.message,
    );
    throw error;
  }
};

export const loginUser = async (data: LoginPayload): Promise<AuthResponse> => {
  if (USE_MOCK) return mock.loginUser(data);
  try {
    const res = await axios.post(ENDPOINTS.auth.login, data);
    return res.data;
  } catch (error: any) {
    console.error("loginUser error:", error?.response?.data || error.message);
    throw error;
  }
};

export const getUserProfile = async (
  token: string,
): Promise<AuthResponse["user"]> => {
  if (USE_MOCK) return mock.getUserProfile(token);
  try {
    const res = await axios.get(ENDPOINTS.auth.profile, authHeader(token));
    return res.data;
  } catch (error: any) {
    console.error(
      "getUserProfile error:",
      error?.response?.data || error.message,
    );
    throw error;
  }
};

// ---------------------------------------------------------------------------
// 🧪 Test helper — only use in dev/testing, never ship to production
//
// Call this anywhere to simulate the admin changing the approval status:
//   import { __setMockStatus } from "@/services/api";
//   __setMockStatus("approved");   // → pending screen will redirect to home
//   __setMockStatus("rejected");   // → pending screen will show rejection UI
// ---------------------------------------------------------------------------
export const __setMockStatus = (status: AuthResponse["user"]["status"]) => {
  if (!USE_MOCK) return;
  mockSession.user.status = status;
  console.log(`[MOCK] user status set to "${status}"`);
};

// import axios from "axios";

// // ---------------------------------------------------------------------------
// // Base URL — override with EXPO_PUBLIC_API_URL env var in production
// // ---------------------------------------------------------------------------
// const BASE_URL = "https://example.com/api";
// const BASE = process.env.EXPO_PUBLIC_API_URL || BASE_URL;

// // ---------------------------------------------------------------------------
// // Endpoint map (kept for reference / future use)
// // ---------------------------------------------------------------------------
// export const ENDPOINTS = {
//   auth: {
//     register: `${BASE}/register`,
//     login: `${BASE}/login`,
//     profile: `${BASE}/profile`,
//   },
// };

// // ---------------------------------------------------------------------------
// // Types
// // ---------------------------------------------------------------------------
// export interface RegisterPayload {
//   email: string;
//   password: string;
// }

// export interface ProfilePayload {
//   name: string;
//   profileImage: string | null;
// }

// export interface LoginPayload {
//   email: string;
//   password: string;
// }

// export interface AuthResponse {
//   token: string;
//   user: {
//     id: string;
//     name: string;
//     email: string;
//     status: "pending" | "approved" | "rejected";
//   };
// }

// // ---------------------------------------------------------------------------
// // Helpers
// // ---------------------------------------------------------------------------

// /**
//  * Builds an Axios config object with the Bearer token when provided.
//  */
// const authHeader = (token: string) => ({
//   headers: { Authorization: `Bearer ${token}` },
// });

// // ---------------------------------------------------------------------------
// // Auth API calls
// // ---------------------------------------------------------------------------

// /**
//  * Step 1 of registration — creates the account with email + password.
//  * Returns the server response (expected to contain a token or user id).
//  */
// export const registerUser = async (
//   data: RegisterPayload,
// ): Promise<AuthResponse> => {
//   try {
//     const response = await axios.post(ENDPOINTS.auth.register, data);
//     return response.data;
//   } catch (error: any) {
//     console.error(
//       "registerUser error:",
//       error?.response?.data || error.message,
//     );
//     throw error;
//   }
// };

// /**
//  * Step 2 of registration — saves the profile (name + image) for an
//  * already-created account.  Requires the auth token returned by registerUser.
//  */
// export const saveUserProfile = async (
//   token: string,
//   data: ProfilePayload,
// ): Promise<void> => {
//   try {
//     // Re-uses the /profile endpoint with a PATCH so the server merges the fields
//     await axios.patch(ENDPOINTS.auth.profile, data, authHeader(token));
//   } catch (error: any) {
//     console.error(
//       "saveUserProfile error:",
//       error?.response?.data || error.message,
//     );
//     throw error;
//   }
// };

// /**
//  * Logs an existing user in.
//  * Returns the auth token + user object (including approval status).
//  */
// export const loginUser = async (data: LoginPayload): Promise<AuthResponse> => {
//   try {
//     const response = await axios.post(ENDPOINTS.auth.login, data);
//     return response.data;
//   } catch (error: any) {
//     console.error("loginUser error:", error?.response?.data || error.message);
//     throw error;
//   }
// };

// /**
//  * Fetches the current user's profile + approval status.
//  * Used by the Pending screen to poll for admin approval.
//  */
// export const getUserProfile = async (
//   token: string,
// ): Promise<AuthResponse["user"]> => {
//   try {
//     const response = await axios.get(ENDPOINTS.auth.profile, authHeader(token));
//     return response.data;
//   } catch (error: any) {
//     console.error(
//       "getUserProfile error:",
//       error?.response?.data || error.message,
//     );
//     throw error;
//   }
// };
