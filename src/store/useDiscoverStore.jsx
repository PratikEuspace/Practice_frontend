/**
 * src/store/useDiscoverStore.jsx
 *
 * In-memory store for the Discover screen.
 * No persistence — every app session fetches fresh from the API.
 *
 * State:
 *   allUsers          [{ id, name, photo_url }]   from GET /users/all
 *   sentRequestIds    [id, ...]                   tracked in-memory for this session
 *   connectedIds      [id, ...]                   derived from GET /notifications
 *   receivedRequests  [{ request_id, ... }]       from GET /users/requests/pending
 *   unreadCount       number                      drives the bell badge
 *   isLoading         boolean
 *   error             string | null
 *
 * User status (computed):
 *   connectedIds includes id   → "connected"
 *   sentRequestIds includes id → "sent"
 *   neither                    → "none"
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react";

import {
  approveProfileRequest,
  getAllUsers,
  getConnectedUsers,
  getNotifications,
  getPendingRequests,
  rejectProfileRequest,
  sendProfileRequest,
} from "@/src/services/api";
import { getAuthToken } from "@/src/services/storage";

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
const initialState = {
  allUsers: [],
  sentRequestIds: [],
  connectedIds: [],
  receivedRequests: [],
  unreadCount: 0,
  connectedUsers: [],
  isLoading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------
const A = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_ALL_USERS: "SET_ALL_USERS",
  SEND_REQUEST: "SEND_REQUEST",
  SET_RECEIVED: "SET_RECEIVED",
  APPROVE_RECEIVED: "APPROVE_RECEIVED",
  REJECT_RECEIVED: "REJECT_RECEIVED",
  SET_NOTIFICATIONS: "SET_NOTIFICATIONS",
  CLEAR_UNREAD: "CLEAR_UNREAD",
  SET_CONNECTED_USERS: "SET_CONNECTED_USERS",
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function reducer(state, action) {
  switch (action.type) {
    case A.SET_LOADING:
      return { ...state, isLoading: action.payload, error: null };

    case A.SET_ERROR:
      return { ...state, isLoading: false, error: action.payload };

    case A.SET_ALL_USERS:
      return { ...state, allUsers: action.payload, isLoading: false };

    case A.SEND_REQUEST: {
      const id = action.payload;
      if (state.sentRequestIds.includes(id)) return state;
      return { ...state, sentRequestIds: [...state.sentRequestIds, id] };
    }

    case A.SET_RECEIVED:
      return {
        ...state,
        receivedRequests: action.payload,
        unreadCount: action.payload.length,
        isLoading: false,
      };

    case A.APPROVE_RECEIVED: {
      const updated = state.receivedRequests.filter(
        (r) => r.request_id !== action.payload,
      );
      return {
        ...state,
        receivedRequests: updated,
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }

    case A.REJECT_RECEIVED: {
      const updated = state.receivedRequests.filter(
        (r) => r.request_id !== action.payload,
      );
      return {
        ...state,
        receivedRequests: updated,
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }

    case A.SET_NOTIFICATIONS: {
      // Pull user_ids from notifications where someone approved our request
      const newConnectedIds = action.payload
        .filter((n) => n.user_id)
        .map((n) => n.user_id);
      const merged = Array.from(
        new Set([...state.connectedIds, ...newConnectedIds]),
      );
      return { ...state, connectedIds: merged };
    }

    case A.CLEAR_UNREAD:
      return { ...state, unreadCount: 0 };

    case A.SET_CONNECTED_USERS:
      return { ...state, connectedUsers: action.payload, isLoading: false };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const DiscoverContext = createContext(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function DiscoverStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------

  /** Fetch all approved users. Always hits the network. */
  const fetchAllUsers = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) return;

    dispatch({ type: A.SET_LOADING, payload: true });
    try {
      const data = await getAllUsers(token);
      dispatch({ type: A.SET_ALL_USERS, payload: data.users });
    } catch (e) {
      dispatch({ type: A.SET_ERROR, payload: "Failed to load users." });
    }
  }, []);

  /** Send a connection request. Optimistic — UI updates before the server responds. */
  const sendRequest = useCallback(async (targetId) => {
    const token = await getAuthToken();
    if (!token) return;

    dispatch({ type: A.SEND_REQUEST, payload: targetId });
    try {
      await sendProfileRequest(token, targetId);
    } catch (e) {
      // 400 "Request already sent" is fine — UI is already correct
      console.warn("sendRequest error:", e?.response?.data ?? e.message);
    }
  }, []);

  /** Fetch received (pending) requests. */
  const fetchReceivedRequests = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) return;

    try {
      const data = await getPendingRequests(token);
      dispatch({ type: A.SET_RECEIVED, payload: data.pending_requests });
    } catch (e) {
      console.warn(
        "fetchReceivedRequests error:",
        e?.response?.data ?? e.message,
      );
    }
  }, []);

  /** Accept a received request. Optimistic removal from list. */
  const acceptRequest = useCallback(async (requestId) => {
    const token = await getAuthToken();
    if (!token) return;

    dispatch({ type: A.APPROVE_RECEIVED, payload: requestId });
    try {
      await approveProfileRequest(token, requestId);
    } catch (e) {
      console.warn("acceptRequest error:", e?.response?.data ?? e.message);
    }
  }, []);

  /** Decline a received request. Optimistic removal from list. */
  const declineRequest = useCallback(async (requestId) => {
    const token = await getAuthToken();
    if (!token) return;

    dispatch({ type: A.REJECT_RECEIVED, payload: requestId });
    try {
      await rejectProfileRequest(token, requestId);
    } catch (e) {
      console.warn("declineRequest error:", e?.response?.data ?? e.message);
    }
  }, []);

  /** Fetch notifications and update connectedIds from approvals. */
  const fetchNotifications = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) return;

    try {
      const data = await getNotifications(token);
      dispatch({ type: A.SET_NOTIFICATIONS, payload: data.notifications });
    } catch (e) {
      console.warn("fetchNotifications error:", e?.response?.data ?? e.message);
    }
  }, []);

  /** Clear the bell badge (called when the user opens the received requests modal). */
  const clearUnread = useCallback(() => {
    dispatch({ type: A.CLEAR_UNREAD });
  }, []);

  // --------------------------------------------------------------------------
  // Derived values
  // --------------------------------------------------------------------------

  /** "connected" | "sent" | "none" for a given user id. */
  const getUserStatus = useCallback(
    (userId) => {
      if (state.connectedIds.includes(userId)) return "connected";
      if (state.sentRequestIds.includes(userId)) return "sent";
      return "none";
    },
    [state.connectedIds, state.sentRequestIds],
  );

  /** Fetch connected users. Always hits the network. */
  const fetchConnectedUsers = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) return;

    dispatch({ type: A.SET_LOADING, payload: true });
    try {
      const data = await getConnectedUsers(token);
      dispatch({ type: A.SET_CONNECTED_USERS, payload: data.approved_users });
    } catch (e) {
      dispatch({ type: A.SET_ERROR, payload: "Failed to load users." });
    }
  }, []);

  /**
   * Users we've sent a request to this session that haven't connected yet.
   * Drives the Sent tab list.
   */
  const sentPendingUsers = state.allUsers.filter(
    (u) =>
      state.sentRequestIds.includes(u.id) && !state.connectedIds.includes(u.id),
  );

  return (
    <DiscoverContext.Provider
      value={{
        ...state,
        fetchAllUsers,
        sendRequest,
        fetchReceivedRequests,
        acceptRequest,
        declineRequest,
        fetchNotifications,
        clearUnread,
        getUserStatus,
        fetchConnectedUsers,
        sentPendingUsers,
      }}
    >
      {children}
    </DiscoverContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useDiscoverStore() {
  const ctx = useContext(DiscoverContext);
  if (!ctx)
    throw new Error(
      "useDiscoverStore must be used within DiscoverStoreProvider",
    );
  return ctx;
}
