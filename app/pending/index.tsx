/**
 * index.tsx  —  Request Status Screen (Pending / Approved / Rejected)
 *
 * Polls GET /profile every 5 seconds using the stored auth token.
 * - approved → navigates to /home
 * - rejected → shows rejection message with option to re-register
 * - pending  → shows spinner
 */
import { getUserProfile } from "@/src/services/api";
import { clearAllUserData, getAuthToken } from "@/src/services/storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

type StatusType = "pending" | "approved" | "rejected";

const POLL_INTERVAL_MS = 50000; // poll every 5 m

export default function PendingScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<StatusType>("pending");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Polling logic ────────────────────────────────────────────────────────
  const checkStatus = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        // No token means the user isn't authenticated — send back to register
        router.replace("/register");
        return;
      }

      const user = await getUserProfile(token);

      if (user.status === "approved" || user.status === "rejected") {
        setStatus(user.status);
        // Stop polling once a final state is reached
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      // if still pending, do nothing — interval will re-check
    } catch (err: any) {
      console.error("Status check failed:", err);
      // Don't crash the screen on a transient network error — just wait
    }
  }, [router]);

  useEffect(() => {
    // Immediate first check
    checkStatus();

    // Then poll
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkStatus]);

  // ── Navigation side-effects ──────────────────────────────────────────────
  useEffect(() => {
    if (status === "approved") {
      // Small visual delay so the user sees "Approved" before navigating
      const t = setTimeout(() => router.replace("/"), 1500);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleRegisterAgain = async () => {
    await clearAllUserData();
    router.replace("/register");
  };

  // ── Status config ────────────────────────────────────────────────────────
  const getStatusContent = () => {
    switch (status) {
      case "approved":
        return {
          emoji: "✅",
          title: "Approved!",
          subtext: "Taking you to the app…",
          color: "#4CAF50",
          bgColor: "#F1FBF4",
        };
      case "rejected":
        return {
          emoji: "❌",
          title: "Not Approved",
          subtext:
            "Your registration was not approved by the admin. You can try registering again with different details.",
          color: "#F44336",
          bgColor: "#FFF5F5",
        };
      case "pending":
      default:
        return {
          emoji: null,
          title: "Awaiting Approval",
          subtext: "Your account is being reviewed by our admin team.",
          color: "#E91E63",
          bgColor: "#FFF0F5",
        };
    }
  };

  const content = getStatusContent();

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: content.bgColor }]}
    >
      <View style={styles.container}>
        {/* Icon / Spinner */}
        <View style={styles.iconBlock}>
          {status === "pending" && (
            <Text style={styles.emoji}>{content.emoji}</Text>
          )}
        </View>

        {/* Text */}
        <Text style={[styles.title, { color: content.color }]}>
          {content.title}
        </Text>
        <Text style={styles.subtext}>{content.subtext}</Text>

        {/* Action button for rejected state */}
        {status === "rejected" && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRegisterAgain}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Register Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
  },
  iconBlock: {
    marginBottom: 32,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    transform: [{ scale: 1.4 }],
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 300,
  },
  pollingHint: {
    marginTop: 28,
    fontSize: 13,
    color: "#BBBBBB",
    letterSpacing: 0.3,
  },
  retryButton: {
    marginTop: 40,
    backgroundColor: "#E91E63",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
