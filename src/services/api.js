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
  // Auth
  register: `${BASE}/register`,
  login: `${BASE}/login`,
  profile: `${BASE}/profile`,

  // Discover
  allUsers: `${BASE}/users/all`,
  sendRequest: (targetId) => `${BASE}/users/request/${targetId}`,
  pendingRequests: `${BASE}/users/requests/pending`,
  approveRequest: (requestId) => `${BASE}/users/request/${requestId}/approve`,
  rejectRequest: (requestId) => `${BASE}/users/request/${requestId}/reject`,
  viewProfile: (targetId) => `${BASE}/users/profile/${targetId}`,
  notifications: `${BASE}/notifications`,
  connectedUsers: `${BASE}/users/requests/approved`,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockUsers = [
  {
    id: 2,
    name: "Priya Sharma",
    photo_url: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: 3,
    name: "Ananya Patel",
    photo_url: "https://i.pravatar.cc/150?img=44",
  },
  {
    id: 4,
    name: "Meera Krishnan",
    photo_url: "https://i.pravatar.cc/150?img=49",
  },
  { id: 5, name: "Riya Nair", photo_url: "https://i.pravatar.cc/150?img=41" },
  { id: 6, name: "Divya Menon", photo_url: "https://i.pravatar.cc/150?img=45" },
  {
    id: 7,
    name: "Kavitha Reddy",
    photo_url: "https://i.pravatar.cc/150?img=39",
  },
];

const mockPendingRequests = [
  {
    request_id: 15,
    requester_id: 8,
    name: "Arjun Mehta",
    photo_url: "https://i.pravatar.cc/150?img=12",
    created_at: "2026-04-06 10:30:00",
  },
  {
    request_id: 16,
    requester_id: 9,
    name: "Rohit Verma",
    photo_url: "https://i.pravatar.cc/150?img=15",
    created_at: "2026-04-05 14:20:00",
  },
];

const mockNotifications = [
  {
    id: 5,
    message: "Priya Sharma has approved your profile request.",
    created_at: "2026-04-06 10:35:00",
    user_id: 2, // the user who approved — attach this so we can mark connectedIds
  },
];

const mockFullProfiles = {
  2: {
    id: 2,
    name: "Priya Sharma",
    email: "priya@example.com",
    mobile: "9876543210",
    photo_url: "https://i.pravatar.cc/150?img=47",
  },
  3: {
    id: 3,
    name: "Ananya Patel",
    email: "ananya@example.com",
    mobile: "9876543211",
    photo_url: "https://i.pravatar.cc/150?img=44",
  },
};

const mockDelay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

const mock = {
  getAllUsers: async () => {
    await mockDelay();
    return { users: mockUsers };
  },
  sendRequest: async (targetId) => {
    await mockDelay(400);
    return { message: "Profile request sent successfully ✅" };
  },
  getPendingReqs: async () => {
    await mockDelay();
    return { pending_requests: mockPendingRequests };
  },
  approveRequest: async (reqId) => {
    await mockDelay(400);
    return { message: "Request approved ✅" };
  },
  rejectRequest: async (reqId) => {
    await mockDelay(400);
    return { message: "Request rejected ❌" };
  },
  viewProfile: async (targetId) => {
    await mockDelay();
    return { profile: mockFullProfiles[targetId] ?? null };
  },
  getNotifications: async () => {
    await mockDelay();
    return { notifications: mockNotifications };
  },
};

// ---------------------------------------------------------------------------
// Existing Auth APIs
// ---------------------------------------------------------------------------

export const registerUser = async ({
  name,
  email,
  mobile,
  password,
  photoUri,
}) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("mobile", mobile);
  formData.append("password", password);

  if (photoUri) {
    const filename = photoUri.split("/").pop();
    const ext = /\.(\w+)$/.exec(filename ?? "")?.[1] ?? "jpeg";
    formData.append("photo", {
      uri: photoUri,
      name: filename,
      type: `image/${ext}`,
    });
  }

  try {
    const res = await axios.post(ENDPOINTS.register, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error ?? error.message;
    console.error(errorMessage);
    throw new Error(errorMessage || " failed");
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const res = await axios.post(ENDPOINTS.login, { email, password });
    return res.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error ?? error.message;
    console.error(errorMessage);
    throw new Error(errorMessage || "Registration failed");
  }
};

export const getUserProfile = async (token) => {
  try {
    const res = await axios.get(ENDPOINTS.profile, authHeader(token));
    return res.data;
  } catch (error) {
    console.error(
      "getUserProfile error:",
      error?.response?.data ?? error.message,
    );
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Discover APIs — all require Bearer token
// ---------------------------------------------------------------------------

/**
 * GET /users/all
 * Returns { users: [{ id, name, photo_url }] }
 */
export const getAllUsers = async (token) => {
  if (USE_MOCK) return mock.getAllUsers();
  try {
    const res = await axios.get(ENDPOINTS.allUsers, authHeader(token));
    return res.data;
  } catch (error) {
    console.error("getAllUsers error:", error?.response?.data ?? error.message);
    throw error;
  }
};

/**
 * POST /users/request/<TARGET_USER_ID>
 * Returns { message }
 */
export const sendProfileRequest = async (token, targetId) => {
  if (USE_MOCK) return mock.sendRequest(targetId);
  try {
    const res = await axios.post(
      ENDPOINTS.sendRequest(targetId),
      null,
      authHeader(token),
    );
    return res.data;
  } catch (error) {
    console.error(
      "sendProfileRequest error:",
      error?.response?.data ?? error.message,
    );
    throw error;
  }
};

/**
 * GET /users/requests/pending
 * Returns { pending_requests: [{ request_id, requester_id, name, photo_url, created_at }] }
 */
export const getPendingRequests = async (token) => {
  if (USE_MOCK) return mock.getPendingReqs();
  try {
    const res = await axios.get(ENDPOINTS.pendingRequests, authHeader(token));
    return res.data;
  } catch (error) {
    console.error(
      "getPendingRequests error:",
      error?.response?.data ?? error.message,
    );
    throw error;
  }
};

/**
 * POST /users/request/<REQUEST_ID>/approve
 * Returns { message }
 */
export const approveProfileRequest = async (token, requestId) => {
  if (USE_MOCK) return mock.approveRequest(requestId);
  try {
    const res = await axios.post(
      ENDPOINTS.approveRequest(requestId),
      null,
      authHeader(token),
    );
    return res.data;
  } catch (error) {
    console.error(
      "approveProfileRequest error:",
      error?.response?.data ?? error.message,
    );
    throw error;
  }
};

/**
 * POST /users/request/<REQUEST_ID>/reject
 * Returns { message }
 */
export const rejectProfileRequest = async (token, requestId) => {
  if (USE_MOCK) return mock.rejectRequest(requestId);
  try {
    const res = await axios.post(
      ENDPOINTS.rejectRequest(requestId),
      null,
      authHeader(token),
    );
    return res.data;
  } catch (error) {
    console.error(
      "rejectProfileRequest error:",
      error?.response?.data ?? error.message,
    );
    throw error;
  }
};

/**
 * GET /users/profile/<TARGET_USER_ID>
 * Returns { profile: { id, name, email, mobile, photo_url } }
 * Throws 403 if request was not approved
 */
export const getFullProfile = async (token, targetId) => {
  if (USE_MOCK) return mock.viewProfile(targetId);
  try {
    const res = await axios.get(
      ENDPOINTS.viewProfile(targetId),
      authHeader(token),
    );
    return res.data;
  } catch (error) {
    console.error(
      "getFullProfile error:",
      error?.response?.data ?? error.message,
    );
    throw error;
  }
};

/**
 * GET /notifications
 * Returns { notifications: [{ id, message, created_at }] }
 * Only unread notifications are returned by the server
 */
export const getNotifications = async (token) => {
  if (USE_MOCK) return mock.getNotifications();
  try {
    const res = await axios.get(ENDPOINTS.notifications, authHeader(token));
    return res.data;
  } catch (error) {
    console.error(
      "getNotifications error:",
      error?.response?.data ?? error.message,
    );
    throw error;
  }
};

/**
 * GET /users/requests/approved
 * Returns { users: [{ id, name, photo_url }] }
 */
export const getConnectedUsers = async (token) => {
  try {
    const res = await axios.get(ENDPOINTS.connectedUsers, authHeader(token));
    return res.data;
  } catch (error) {
    console.error(
      "getConnectedUsers error:",
      error?.response?.data ?? error.message,
    );
    throw error;
  }
};
