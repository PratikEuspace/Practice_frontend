/**
 * register.tsx  —  Step 1 of 2: Account Creation
 *
 * Collects email + password, calls POST /register, stores the returned
 * auth token, then pushes the user to the Profile Setup screen.
 */
import { registerUser } from "@/src/services/api";
import { saveAuthToken, saveUserData } from "@/src/services/storage";
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

export default function RegisterScreen() {
  const router = useRouter();

  // ── Form state ──────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── Inline validation errors ─────────────────────────────────────────────
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    let isValid = true;
    const newErrors = { email: "", password: "", confirmPassword: "" };

    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // POST /register  →  { token, user: { id, name, email, status } }
      const response = await registerUser({ email, password });

      // Persist auth token for subsequent authenticated requests
      await saveAuthToken(response.token);

      // Persist minimal user info (email) for quick access
      await saveUserData({ username: response.user.name || "", email });

      // Move to Step 2: profile setup
      router.push("/profile-setup");
    } catch (err: any) {
      console.error("Registration failed:", err);
      Alert.alert(
        "Registration Error",
        err?.response?.data?.message ||
          err?.message ||
          "Unable to register. Please try again.",
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
            <Text style={styles.eyebrow}>Welcome</Text>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>
              Enter your email and a secure password to get started.
            </Text>
          </View>

          {/* Fields */}
          <View style={styles.inputGroup}>
            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="you@example.com"
              placeholderTextColor="#B0B0B0"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="Min. 6 characters"
              placeholderTextColor="#B0B0B0"
              secureTextEntry
              textContentType="oneTimeCode"
              value={password}
              onChangeText={setPassword}
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword ? styles.inputError : null,
              ]}
              placeholder="Repeat your password"
              placeholderTextColor="#B0B0B0"
              secureTextEntry
              textContentType="oneTimeCode"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue →</Text>
            )}
          </TouchableOpacity>

          {/* Step indicator */}
          <Text style={styles.stepHint}>Step 1 of 2</Text>
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
    marginBottom: 36,
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
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginTop: 12,
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
