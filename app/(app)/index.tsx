/**
 * home.tsx  —  Home / Account Settings Screen
 *
 * Shows the logged-in user's profile and lets them:
 *   • Update their display name
 *   • Change their profile photo
 *   • Change their password
 *   • Log out (clears all local data + token)
 */
import {
  clearAllUserData,
  getUserData,
  saveUserData,
  UserData,
} from "@/src/services/storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ProfileImage from "@/src/components/ProfileImage";

export default function HomeScreen() {
  const router = useRouter();

  // ── Screen state ─────────────────────────────────────────────────────────
  const [userData, setUserData] = useState<UserData>({
    username: "Guest User",
    password: "",
  });

  // ── Modal visibility ─────────────────────────────────────────────────────
  const [isUsernameModalVisible, setUsernameModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [tempUsername, setTempUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── Load on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getUserData();
    if (data) {
      setUserData({
        username: data.username || "Guest User",
        password: data.password || "",
        email: data.email || "",
      });
    }
  };

  // ── Persistence helper ────────────────────────────────────────────────────
  const updateDataAndSave = async (
    newData: Partial<UserData>,
    successMessage: string,
  ) => {
    const updatedUser = { ...userData, ...newData };
    setUserData(updatedUser);

    const isSaved = await saveUserData(updatedUser);
    if (isSaved) {
      Alert.alert("Success", successMessage);
    } else {
      Alert.alert("Error", "Failed to save. Please try again.");
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleUpdateUsername = () => {
    if (!tempUsername.trim()) {
      Alert.alert("Error", "Username cannot be empty.");
      return;
    }
    updateDataAndSave({ username: tempUsername.trim() }, "Username updated!");
    setUsernameModalVisible(false);
  };

  const handleUpdatePassword = () => {
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    updateDataAndSave({ password: newPassword }, "Password updated!");
    setPasswordModalVisible(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await clearAllUserData(); // clears token + profile data + image
          router.replace("/register");
        },
      },
    ]);
  };

  // ── UI ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#E91E63" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar + Name */}
        <ProfileImage />
        <Text style={styles.usernameHeader}>{userData.username}</Text>
        {userData.email ? (
          <Text style={styles.emailSubtext}>{userData.email}</Text>
        ) : null}

        {/* Settings cards */}
        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          {/* Change Username */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => {
              setTempUsername(userData.username);
              setUsernameModalVisible(true);
            }}
          >
            <View style={styles.optionRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={24} color="#E91E63" />
              </View>
              <Text style={styles.optionText}>Change Name</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          {/* Change Profile Photo */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() =>
              Alert.alert(
                "Tip",
                "Tap directly on your avatar above to update your profile photo!",
              )
            }
          >
            <View style={styles.optionRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="image-outline" size={24} color="#E91E63" />
              </View>
              <Text style={styles.optionText}>Change Profile Photo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          {/* Change Password */}
          <TouchableOpacity
            style={[styles.optionCard, { borderBottomWidth: 0 }]}
            onPress={() => setPasswordModalVisible(true)}
          >
            <View style={styles.optionRow}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color="#E91E63"
                />
              </View>
              <Text style={styles.optionText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Change Username Modal ── */}
      <Modal visible={isUsernameModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Name</Text>
            <TextInput
              style={styles.modalInput}
              value={tempUsername}
              onChangeText={setTempUsername}
              placeholder="Enter new name"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setUsernameModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleUpdateUsername}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Change Password Modal ── */}
      <Modal visible={isPasswordModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Password</Text>
            <TextInput
              style={styles.modalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password (min 6 chars)"
              secureTextEntry
              textContentType="oneTimeCode"
            />
            <TextInput
              style={styles.modalInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry
              textContentType="oneTimeCode"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleUpdatePassword}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#FCE4EC",
    alignSelf: "flex-start",
  },
  logoutText: {
    color: "#E91E63",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },
  usernameHeader: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1A1A2E",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  emailSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 32,
  },
  optionsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#AAAAAA",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 8,
    marginLeft: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FCE4EC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
    color: "#1A1A2E",
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#F7F7F9",
    borderWidth: 1.5,
    borderColor: "#E8E8EE",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 14,
    color: "#1A1A2E",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  modalButtonSave: {
    backgroundColor: "#E91E63",
    marginLeft: 8,
  },
  modalButtonTextCancel: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  modalButtonTextSave: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
