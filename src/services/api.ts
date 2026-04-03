import axios from "axios";

// ---------------------------------------------------------------------------
// 🔧 MOCK FLAG — flip to false when hitting the real backend
// ---------------------------------------------------------------------------
export const USE_MOCK = false;

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------
const BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://my-env.eba-hiugtrzm.ap-south-1.elasticbeanstalk.com";

export const ENDPOINTS = {
  register: `${BASE}/register`,
  login: `${BASE}/login`,
  profile: `${BASE}/profile`,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ---------------------------------------------------------------------------
// Mock session — in-memory store for dev/testing
// ---------------------------------------------------------------------------
const mockSession = {
  token: "mock-token-abc123",
  user: {
    id: "1",
    name: "",
    email: "",
    mobile: "",
    status: "pending", // ✏️ change to "approved" / "rejected" to test cold-start
  },
};

const mockDelay = (ms = 800) => new Promise((res) => setTimeout(res, ms));

const mock = {
  registerUser: async (data) => {
    await mockDelay();
    mockSession.user.name = data.name || "";
    mockSession.user.email = data.email || "";
    mockSession.user.mobile = data.mobile || "";
    mockSession.user.status = "pending";
    return { token: mockSession.token, user: { ...mockSession.user } };
  },

  loginUser: async (data) => {
    await mockDelay();
    mockSession.user.email = data.email;
    return { token: mockSession.token, user: { ...mockSession.user } };
  },

  getUserProfile: async () => {
    await mockDelay(400);
    return { ...mockSession.user };
  },
};

// ---------------------------------------------------------------------------
// registerUser
//
// Real API: POST /register  →  multipart/form-data
//   Fields: name, email, mobile, password, photo (file)
// ---------------------------------------------------------------------------
export const registerUser = async ({
  name,
  email,
  mobile,
  password,
  photoUri,
}) => {
  if (USE_MOCK) return mock.registerUser({ name, email, mobile });

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("mobile", mobile);
  formData.append("password", password);

  if (photoUri) {
    // React Native FormData accepts this object shape for file uploads
    const filename = photoUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename ?? "");
    const type = match ? `image/${match[1]}` : "image/jpeg";
    formData.append("photo", { uri: photoUri, name: filename, type });
  }

  try {
    const res = await axios.post(ENDPOINTS.register, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error(
      "registerUser error:",
      error?.response?.data.error || error.message,
    );
    throw error;
  }
};

// ---------------------------------------------------------------------------
// loginUser
//
// Real API: POST /login  →  application/json
//   Body: { email, password }
// ---------------------------------------------------------------------------
export const loginUser = async ({ email, password }) => {
  if (USE_MOCK) return mock.loginUser({ email });

  try {
    const res = await axios.post(ENDPOINTS.login, { email, password });
    return res.data;
  } catch (error) {
    console.error("loginUser error:", error?.response?.data || error.message);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// getUserProfile
//
// Real API: GET /profile  →  requires Bearer token
// ---------------------------------------------------------------------------
export const getUserProfile = async (token) => {
  if (USE_MOCK) return mock.getUserProfile();

  try {
    const res = await axios.get(ENDPOINTS.profile, authHeader(token));
    return res.data;
  } catch (error) {
    console.error(
      "getUserProfile error:",
      error?.response?.data || error.message,
    );
    throw error;
  }
};

// ---------------------------------------------------------------------------
// 🧪 Dev helper — simulate admin changing approval status
//   import { __setMockStatus } from "@/services/api";
//   __setMockStatus("approved");
// ---------------------------------------------------------------------------
export const __setMockStatus = (status) => {
  if (!USE_MOCK) return;
  mockSession.user.status = status;
  console.log(`[MOCK] status → "${status}"`);
};
