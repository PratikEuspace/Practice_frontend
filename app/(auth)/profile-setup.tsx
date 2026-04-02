/**
 * profile-setup.tsx  —  Step 2 of 2: Profile Setup
 *
 * Collects the user's display name and optional profile photo, then
 * PATCHes the profile via the API and redirects to the Pending screen.
 *
 * Place this file at:  app/(auth)/profile-setup.tsx   (or wherever your
 * routing convention puts it — just make sure register.tsx pushes to
 * the same path string).
 */
import ProfileImage from "@/src/components/ProfileImage";
import { saveUserProfile } from "@/src/services/api";
import { getAuthToken, getImage, saveUserData } from "@/src/services/storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileSetupScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!name.trim()) {
      setNameError("Please enter your name");
      return false;
    }
    setNameError("");
    return true;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleContinue = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Session Error", "Please register again.");
        router.replace("/register");
        return;
      }

      // Grab any profile image the user just picked via <ProfileImage />
      const profileImage = await getImage();

      // PATCH /profile  →  saves name + photo on the server
      await saveUserProfile(token, { name: name.trim(), profileImage });

      // Update local cache with the confirmed name
      await saveUserData({ username: name.trim() });

      // Move to the approval-waiting screen
      router.replace("/pending");
    } catch (err: any) {
      console.error("Profile setup failed:", err);
      Alert.alert(
        "Setup Error",
        err?.response?.data?.message ||
          err?.message ||
          "Could not save profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerBlock}>
            <Text style={styles.eyebrow}>Almost there</Text>
            <Text style={styles.headerTitle}>Set Up Profile</Text>
            <Text style={styles.headerSubtitle}>
              Add your name and a photo so others can recognise you.
            </Text>
          </View>

          {/* Profile photo picker (reusable component) */}
          <ProfileImage />

          {/* Name field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder="e.g. Priya Sharma"
              placeholderTextColor="#B0B0B0"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit for Approval →</Text>
            )}
          </TouchableOpacity>

          {/* Step indicator */}
          <Text style={styles.stepHint}>Step 2 of 2</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    padding: 28,
    justifyContent: "center",
    flexGrow: 1,
  },
  headerBlock: {
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E91E63",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#888",
    lineHeight: 22,
  },
  inputGroup: {
    marginTop: 24,
    marginBottom: 32,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F7F7F9",
    borderWidth: 1.5,
    borderColor: "#E8E8EE",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1A1A2E",
  },
  inputError: {
    borderColor: "#FF4D4F",
    backgroundColor: "#FFF1F0",
  },
  errorText: {
    color: "#FF4D4F",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#E91E63",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  stepHint: {
    textAlign: "center",
    color: "#C0C0C0",
    fontSize: 13,
    marginTop: 20,
  },
});
