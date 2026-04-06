/**
 * src/components/discover/UserProfileModal.jsx
 *
 * Bottom-sheet style modal that opens when a user card is tapped.
 *
 * Button states:
 *   "none"      → "Send Request"  → calls sendRequest → optimistic update
 *   "sent"      → "Request Sent"  (disabled)
 *   "connected" → "View Profile"  → fetches full profile (email, mobile)
 */

import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_H = SCREEN_H * 0.6;

export default function UserProfileModal({
  visible,
  user,
  status,
  onClose,
  onSendRequest,
}) {
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const [fullProfile, setFullProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [sending, setSending] = useState(false);

  // -- Animate in / out
  useEffect(() => {
    if (visible) {
      setFullProfile(null);
      setProfileError(null);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // If already connected, auto-fetch full profile
      if (status === "connected" && user) {
        setFullProfile(user);
      }
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_H,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, status, user]);

  const handleSendRequest = async () => {
    if (!user || sending) return;
    setSending(true);
    await onSendRequest(user.id);
    setSending(false);
  };

  const handleViewProfile = () => {
    if (user) loadFullProfile(user.id);
  };

  if (!user) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Photo */}
        <View style={styles.photoWrap}>
          <Image source={{ uri: user.photo_url }} style={styles.photo} />
          {status === "connected" && (
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedBadgeText}>✓ Connected</Text>
            </View>
          )}
        </View>

        {/* Name */}
        <Text style={styles.name}>{user.name}</Text>

        {/* Full profile section (only when connected) */}
        {status === "connected" && (
          <View style={styles.profileBox}>
            {profileLoading ? (
              <ActivityIndicator color="#8B1A4A" />
            ) : profileError ? (
              <Text style={styles.errorText}>{profileError}</Text>
            ) : fullProfile ? (
              <>
                <ProfileRow
                  iconName="mail-outline"
                  label="Email"
                  value={fullProfile.email}
                />
                <ProfileRow
                  iconName="call-outline"
                  label="Mobile"
                  value={fullProfile.mobile}
                />
              </>
            ) : (
              <Pressable style={styles.viewBtn} onPress={handleViewProfile}>
                <Text style={styles.viewBtnText}>View Full Profile</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Action button */}
        <ActionButton
          status={status}
          sending={sending}
          onSend={handleSendRequest}
        />
      </Animated.View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ActionButton({ status, sending, onSend }) {
  if (status === "connected") return null; // Profile details replace the button

  const isSent = status === "sent";

  return (
    <Pressable
      style={[styles.actionBtn, isSent && styles.actionBtnDisabled]}
      onPress={isSent ? null : onSend}
      disabled={isSent || sending}
    >
      {sending ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.actionBtnText}>
          {isSent ? "Request Sent ✓" : "Send Request "}
        </Text>
      )}
    </Pressable>
  );
}

function ProfileRow({ iconName, label, value }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={20} color="#E91E63" />
      </View>
      <View>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value || "—"}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26,10,15,0.55)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_H,
    backgroundColor: "#FDF8F5",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: "center",
    paddingBottom: 36,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D5B8C4",
    marginTop: 12,
    marginBottom: 24,
  },
  photoWrap: {
    alignItems: "center",
    marginBottom: 16,
  },
  photo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F0E8E3",
    borderWidth: 3,
    borderColor: "#8B1A4A",
  },
  connectedBadge: {
    position: "absolute",
    bottom: -8,
    backgroundColor: "#2E7D32",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  connectedBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A0A0F",
    letterSpacing: 0.3,
    marginBottom: 20,
    textAlign: "center",
  },
  profileBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    shadowColor: "#8B1A4A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileIcon: {
    fontSize: 20,
  },
  profileLabel: {
    fontSize: 11,
    color: "#9E7D8A",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  profileValue: {
    fontSize: 15,
    color: "#1A0A0F",
    fontWeight: "500",
    marginTop: 1,
  },
  actionBtn: {
    backgroundColor: "#8B1A4A",
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: "100%",
    alignItems: "center",
    shadowColor: "#8B1A4A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    marginTop: "auto",
  },
  actionBtnDisabled: {
    backgroundColor: "#C9A0B0",
    shadowOpacity: 0.1,
    elevation: 1,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  viewBtn: {
    alignItems: "center",
    padding: 8,
  },
  viewBtnText: {
    color: "#8B1A4A",
    fontWeight: "600",
    fontSize: 15,
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    textAlign: "center",
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
});
