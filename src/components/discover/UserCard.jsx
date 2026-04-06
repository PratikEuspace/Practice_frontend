/**
 * src/components/discover/UserCard.jsx
 *
 * Single card in the Discover / Sent list.
 * Shows photo, name, and a status badge derived from the store.
 */

import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

const STATUS_CONFIG = {
  none: { label: null },
  sent: { label: "Pending", bg: "#FFF3E0", color: "#E65100" },
  connected: { label: "Connected", bg: "#E8F5E9", color: "#2E7D32" },
};

export default function UserCard({ user, status = "none", onPress }) {
  const badge = STATUS_CONFIG[status];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(user)}
      android_ripple={{ color: "#f5e6ed" }}
    >
      {/* Photo */}
      <View style={styles.avatarWrap}>
        <Image source={{ uri: user.photo_url }} style={styles.avatar} />
        {status === "connected" && <View style={styles.connectedDot} />}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>

        {badge.label && (
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>
        )}
      </View>

      {/* Chevron C9A0B0 */}
      <Ionicons name="chevron-forward-outline" size={20} color="#C9A0B0" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#8B1A4A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0E8E3",
  },
  connectedDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#43A047",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  info: {
    flex: 1,
    marginLeft: 14,
    gap: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A0A0F",
    letterSpacing: 0.1,
  },

  chevron: {
    fontSize: 22,
    color: "#C9A0B0",
    marginLeft: 8,
  },
});
