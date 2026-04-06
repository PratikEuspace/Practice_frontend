/**
 * app/(pending)/index.jsx
 *
 * Shown immediately after registration — no token yet.
 * Polls GET /profile using the stored token IF one exists,
 * otherwise just shows the waiting UI (user registered but not logged in yet).
 *
 *   pending  → spinner + "checking" hint
 *   approved → ✅ + "Go to Login" button
 *   rejected → ❌ + "Register Again" button
 *
 * DEV: tap 🛠 to simulate status changes.
 */
import { clearAllUserData } from "@/src/services/storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const POLL_INTERVAL_MS = 5000;

export default function PendingScreen() {
  const router = useRouter();
  const [status, setStatus] = useState("approved");

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleGoToLogin = () => {
    router.replace("/(auth)/login");
  };

  const handleRegisterAgain = async () => {
    await clearAllUserData();
    router.replace("/");
  };

  // ── Status config ─────────────────────────────────────────────────────────
  const getStatusContent = () => {
    switch (status) {
      case "pending":
        return {
          emoji: "⏳",
          title: "Pending Approval",
          subtext:
            "Your account is currently under review by the admin. Please wait for approval.",
          color: "#FFA500",
          bgColor: "#FFF3E0",
        };
      case "rejected":
        return {
          emoji: "❌",
          title: "Not Approved",
          subtext:
            "Your registration was not approved. You can try registering again.",
          color: "#F44336",
          bgColor: "#FFF5F5",
        };
      default:
        return {
          emoji: null,
          title: "Awaiting Approval",
          subtext:
            "Your account is being reviewed by our admin team. Try to login after some time.",
          color: "#E91E63",
          bgColor: "#FFF0F5",
        };
    }
  };

  const content = getStatusContent();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: content.bgColor }]}
    >
      <View style={styles.container}>
        <View style={styles.iconBlock}>
          <Text style={styles.emoji}>{content.emoji}</Text>
        </View>

        {/* Text */}
        <Text style={[styles.title, { color: content.color }]}>
          {content.title}
        </Text>
        <Text style={styles.subtext}>{content.subtext}</Text>

        {status === "pending" && (
          <Text style={styles.pollingHint}>
            Checking every {POLL_INTERVAL_MS / 1000} seconds…
          </Text>
        )}

        {/* Approved → Go to Login */}
        {status === "approved" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#FFA500" }]}
            onPress={handleGoToLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Go to Login →</Text>
          </TouchableOpacity>
        )}

        {/* Rejected → Register Again */}
        {status === "rejected" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#E91E63" }]}
            onPress={handleRegisterAgain}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Register Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
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
  spinner: { transform: [{ scale: 1.4 }] },
  emoji: { fontSize: 64 },
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
  actionButton: {
    marginTop: 40,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
