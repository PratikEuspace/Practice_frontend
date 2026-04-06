/**
 * app/(auth)/login.jsx
 *
 * Login screen for approved users.
 * POST /login  →  { token, user }  →  save token  →  /(app)/home
 */
import { getUserProfile, loginUser } from "@/src/services/api";
import { saveAuthToken, saveImage, saveUserData } from "@/src/services/storage";
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

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    let isValid = true;
    const e = { email: "", password: "" };

    if (!email.trim() || !email.includes("@")) {
      e.email = "Enter a valid email address";
      isValid = false;
    }

    if (password.length < 6) {
      e.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(e);
    return isValid;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // POST /login  →  { token, user: { id, name, email, status, ... } }
      const response = await loginUser({ email, password });

      if (!response.token) {
        throw new Error("No token received from server.");
      }

      await saveAuthToken(response.token);

      const userInfo = await getUserProfile(response.token);

      await saveUserData({
        username: userInfo.user?.name || "",
        email: userInfo.user?.email || email,
        mobile: userInfo.user?.mobile || "",
      });

      saveImage(userInfo.user?.photo_url || null);

      router.replace("/(app)");
    } catch (err) {
      console.error("Login failed:", err.message);
      Alert.alert("Login Failed", err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
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
            <Text style={styles.eyebrow}>Welcome Back</Text>
            <Text style={styles.headerTitle}>Log In</Text>
            <Text style={styles.headerSubtitle}>
              Sign in with your registered email and password.
            </Text>
          </View>

          {/* Fields */}
          <View style={styles.inputGroup}>
            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="you@example.com"
              placeholderTextColor="#B0B0B0"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            {!!errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Your password"
              placeholderTextColor="#B0B0B0"
              secureTextEntry
              textContentType="oneTimeCode"
              value={password}
              onChangeText={setPassword}
            />
            {!!errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Back to register */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.replace("/")}
            activeOpacity={0.7}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account?{" "}
              <Text style={styles.registerLinkBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: { padding: 28, flexGrow: 1, justifyContent: "center" },
  headerBlock: { marginBottom: 36 },
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
    marginBottom: 8,
  },
  headerSubtitle: { fontSize: 15, color: "#888", lineHeight: 22 },
  inputGroup: { marginBottom: 28 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginTop: 14,
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
  inputError: { borderColor: "#FF4D4F", backgroundColor: "#FFF1F0" },
  errorText: { color: "#FF4D4F", fontSize: 12, marginTop: 5, marginLeft: 4 },
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
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  registerLink: { marginTop: 24, alignItems: "center" },
  registerLinkText: { fontSize: 14, color: "#999" },
  registerLinkBold: { color: "#E91E63", fontWeight: "700" },
});
