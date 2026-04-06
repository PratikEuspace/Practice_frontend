/**
 * app/(auth)/register.jsx
 *
 * Single registration screen — collects all fields the real API needs:
 *   name, email, mobile, password + profile photo
 *
 * POST /register  →  multipart/form-data
 * On success: saves token → navigates to /(pending)
 */
import ProfileImage from "@/src/components/ProfileImage";
import { registerUser } from "@/src/services/api";
import { getImage, saveUserData } from "@/src/services/storage";
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

  // ── Form state ────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const e = {
      name: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    };

    if (!name.trim()) {
      e.name = "Name is required";
      isValid = false;
    }

    if (!email.trim() || !emailRegex.test(email)) {
      e.email = "Enter a valid email address";
      isValid = false;
    }

    if (!mobile.trim() || mobile.length < 10) {
      e.mobile = "Enter a valid 10-digit mobile number";
      isValid = false;
    }

    if (password.length < 6) {
      e.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (confirmPassword !== password) {
      e.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(e);
    return isValid;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // Pick up any photo the user selected via <ProfileImage />
      const photoUri = await getImage();

      // POST /register  (multipart/form-data)
      // Registration only creates the account — no token is returned.
      // The user must wait for admin approval, then login separately.
      await registerUser({
        name,
        email,
        mobile,
        password,
        photoUri,
      });

      // Persist minimal user info (email) for quick access
      await saveUserData({ username: name, email, mobile });

      // Move to Step 2: profile setup
      router.replace("/(pending)");
    } catch (err) {
      console.error("Registration failed:", err.message);

      Alert.alert(
        "Registration Error",
        err.message || "Unable to register. Please try again.",
      );
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
            <Text style={styles.eyebrow}>Welcome</Text>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>
              Fill in your details to get started.
            </Text>
          </View>

          {/* Profile photo */}
          <ProfileImage />

          {/* Fields */}
          <View style={styles.inputGroup}>
            {/* Name */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="e.g. Priya Sharma"
              placeholderTextColor="#B0B0B0"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
            {!!errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}

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

            {/* Mobile */}
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={[styles.input, errors.mobile && styles.inputError]}
              placeholder="9876543210"
              placeholderTextColor="#B0B0B0"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
            />
            {!!errors.mobile && (
              <Text style={styles.errorText}>{errors.mobile}</Text>
            )}

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Min. 6 characters"
              placeholderTextColor="#B0B0B0"
              secureTextEntry
              textContentType="oneTimeCode"
              value={password}
              onChangeText={setPassword}
            />
            {!!errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="Repeat your password"
              placeholderTextColor="#B0B0B0"
              secureTextEntry
              textContentType="oneTimeCode"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {!!errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
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
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: { padding: 28, flexGrow: 1 },
  headerBlock: { marginBottom: 24 },
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
  inputGroup: { marginTop: 8, marginBottom: 28 },
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
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 6,
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E91E63",
  },
});
