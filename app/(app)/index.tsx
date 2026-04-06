/**
 * app/(app)/index.tsx
 *
 * Home / Profile screen for approved users.
 * Shows stored profile info and a logout button.
 */
import ProfileImage from "@/src/components/ProfileImage";
import { clearAllUserData, getUserData } from "@/src/services/storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    mobile: "",
  });

  useEffect(() => {
    (async () => {
      const data = await getUserData();
      if (data) {
        setUserData({
          username: data.username || "Guest",
          email: data.email || "",
          mobile: data.mobile || "",
        });
      }
    })();
  }, []);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await clearAllUserData();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <ProfileImage preventEdit />

        {/* Name */}
        <Text style={styles.usernameHeader}>{userData.username}</Text>

        {/* Details card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Details</Text>

          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={20} color="#E91E63" />
            </View>
            <View>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>{userData.email || "—"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Ionicons name="call-outline" size={20} color="#E91E63" />
            </View>
            <View>
              <Text style={styles.rowLabel}>Mobile</Text>
              <Text style={styles.rowValue}>{userData.mobile || "—"}</Text>
            </View>
          </View>
        </View>

        {/* Header */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#E91E63" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: "center",
  },
  usernameHeader: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1A1A2E",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 28,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#AAAAAA",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 16,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FCE4EC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  rowLabel: {
    fontSize: 12,
    color: "#AAAAAA",
    fontWeight: "600",
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 16,
    color: "#1A1A2E",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 4,
  },

  logoutButton: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  logoutText: {
    color: "#FF5252", // A slightly more "urgent" red
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 15,
  },
});
