/**
 * src/components/discover/ReceivedRequestsModal.jsx
 *
 * Slide-up modal opened by the bell icon in the header.
 * Lists all pending received requests with Accept / Reject actions.
 */

import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useDiscoverStore } from "@/src/store/useDiscoverStore";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_H = SCREEN_H * 0.72;

export default function ReceivedRequestsModal({ visible, onClose }) {
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const {
    receivedRequests,
    isLoading,
    fetchReceivedRequests,
    acceptRequest,
    declineRequest,
    clearUnread,
  } = useDiscoverStore();

  // -- Animate + fetch when opened
  useEffect(() => {
    if (visible) {
      clearUnread();
      fetchReceivedRequests();

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
  }, [visible]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr.replace(" ", "T"));
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderItem = ({ item }) => (
    <RequestRow
      item={item}
      formatDate={formatDate}
      onAccept={() => acceptRequest(item.request_id)}
      onReject={() => declineRequest(item.request_id)}
    />
  );

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
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Received Requests</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.closeBtn}>✕</Text>
          </Pressable>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#8B1A4A" size="large" />
          </View>
        ) : receivedRequests.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>🕊️</Text>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptySubtitle}>
              When someone sends you a request, it'll appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={receivedRequests}
            keyExtractor={(item) => String(item.request_id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Request row
// ---------------------------------------------------------------------------
function RequestRow({ item, formatDate, onAccept, onReject }) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: item.photo_url }} style={styles.avatar} />

      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowDate}>{formatDate(item.created_at)}</Text>

        <View style={styles.rowActions}>
          <Pressable
            style={styles.acceptBtn}
            onPress={onAccept}
            android_ripple={{ color: "#a5d6a7" }}
          >
            <Text style={styles.acceptBtnText}>Accept</Text>
          </Pressable>

          <Pressable
            style={styles.rejectBtn}
            onPress={onReject}
            android_ripple={{ color: "#ef9a9a" }}
          >
            <Text style={styles.rejectBtnText}>Decline</Text>
          </Pressable>
        </View>
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
    paddingBottom: 36,
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
    alignSelf: "center",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E8E3",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A0A0F",
  },
  closeBtn: {
    fontSize: 18,
    color: "#9E7D8A",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A0A0F",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9E7D8A",
    textAlign: "center",
    lineHeight: 21,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#8B1A4A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0E8E3",
  },
  rowInfo: {
    flex: 1,
    gap: 5,
  },
  rowName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A0A0F",
  },
  rowDate: {
    fontSize: 12,
    color: "#9E7D8A",
  },
  rowActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: "#8B1A4A",
    borderRadius: 50,
    paddingVertical: 9,
    alignItems: "center",
  },
  acceptBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: "#F5EAF0",
    borderRadius: 50,
    paddingVertical: 9,
    alignItems: "center",
  },
  rejectBtnText: {
    color: "#8B1A4A",
    fontWeight: "700",
    fontSize: 13,
  },
});
