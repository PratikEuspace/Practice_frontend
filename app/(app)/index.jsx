/**
 * app/(app)/discover.jsx
 *
 * Main Discover screen.
 *
 * Layout:
 *   ┌─────────────────────────────────┐
 *   │  Discover              🔔 (2)   │  ← header
 *   ├─────────────────────────────────┤
 *   │  [ Discover ]  [ Sent ]         │  ← custom tab bar
 *   ├─────────────────────────────────┤
 *   │  FlatList                       │
 *   └─────────────────────────────────┘
 *
 * Modals:
 *   - UserProfileModal  (tapping a user card)
 *   - ReceivedRequestsModal (tapping the bell)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ReceivedRequestsModal from "@/src/components/discover/ReceivedRequestsModal";
import UserCard from "@/src/components/discover/UserCard";
import UserProfileModal from "@/src/components/discover/UserProfileModal";
import {
  DiscoverStoreProvider,
  useDiscoverStore,
} from "@/src/store/useDiscoverStore";

// ---------------------------------------------------------------------------
// Wrap the inner screen so all children can access the store
// ---------------------------------------------------------------------------
export default function DiscoverScreen() {
  return (
    <DiscoverStoreProvider>
      <DiscoverInner />
    </DiscoverStoreProvider>
  );
}

// ---------------------------------------------------------------------------
// Inner screen — has access to the store
// ---------------------------------------------------------------------------
function DiscoverInner() {
  const [activeTab, setActiveTab] = useState("discover"); // "discover" | "sent"
  const [bellModalVisible, setBellModalVisible] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  const {
    allUsers,
    unreadCount,
    isLoading,
    fetchAllUsers,
    fetchNotifications,
    fetchReceivedRequests,
    fetchConnectedUsers,
    sendRequest,
    getUserStatus,
    sentPendingUsers,
    connectedUsers,
  } = useDiscoverStore();

  // -- Initial load
  useEffect(() => {
    fetchAllUsers();
    fetchNotifications();
    fetchReceivedRequests();
    fetchConnectedUsers();
  }, []);

  // -- Tab indicator animation (3 positions)
  useEffect(() => {
    const toValue = activeTab === "discover" ? 0 : activeTab === "sent" ? 1 : 2;
    Animated.spring(tabIndicatorAnim, {
      toValue,
      damping: 20,
      stiffness: 200,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  // -- Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAllUsers(),
      fetchNotifications(),
      fetchReceivedRequests(),
      fetchConnectedUsers(),
    ]);
    setRefreshing(false);
  }, []);

  // -- Modal handlers
  const openProfile = (user) => setProfileModalUser(user);
  const closeProfile = () => setProfileModalUser(null);

  const openBell = () => setBellModalVisible(true);
  const closeBell = () => setBellModalVisible(false);

  // -- Data for active tab
  const listData =
    activeTab === "discover"
      ? allUsers
      : activeTab === "sent"
        ? sentPendingUsers
        : connectedUsers;

  const renderItem = ({ item }) => (
    <UserCard
      user={item}
      status={getUserStatus(item.id)}
      onPress={openProfile}
    />
  );

  const indicatorLeft = tabIndicatorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ["1.5%", "34.5%", "67.5%"],
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>

        <Pressable style={styles.bellWrap} onPress={openBell} hitSlop={10}>
          <Text style={styles.bellIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* ── Custom Tab Bar ── */}
      <View style={styles.tabBar}>
        <View style={styles.tabTrack}>
          {/* Sliding indicator */}
          <Animated.View
            style={[styles.tabIndicator, { left: indicatorLeft }]}
          />

          <Pressable
            style={styles.tabBtn}
            onPress={() => setActiveTab("discover")}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === "discover" && styles.tabLabelActive,
              ]}
            >
              Discover
            </Text>
          </Pressable>

          <Pressable style={styles.tabBtn} onPress={() => setActiveTab("sent")}>
            <View style={styles.tabLabelRow}>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "sent" && styles.tabLabelActive,
                ]}
              >
                Sent
              </Text>
              {sentPendingUsers.length > 0 && (
                <View style={styles.tabCountBadge}>
                  <Text style={styles.tabCountText}>
                    {sentPendingUsers.length}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>

          <Pressable
            style={styles.tabBtn}
            onPress={() => setActiveTab("connected")}
          >
            <View style={styles.tabLabelRow}>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "connected" && styles.tabLabelActive,
                ]}
              >
                Connected
              </Text>
              {connectedUsers.length > 0 && (
                <View style={styles.tabCountBadge}>
                  <Text style={styles.tabCountText}>
                    {connectedUsers.length}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>
      </View>

      {/* ── List ── */}
      <FlatList
        data={listData}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B1A4A"
            colors={["#8B1A4A"]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            tab={activeTab}
            isLoading={isLoading && listData.length === 0}
          />
        }
      />

      {/* ── Modals ── */}
      <UserProfileModal
        visible={!!profileModalUser}
        user={profileModalUser}
        status={profileModalUser?.mobile ? "connected" : "none"}
        onClose={closeProfile}
        onSendRequest={sendRequest}
      />

      <ReceivedRequestsModal visible={bellModalVisible} onClose={closeBell} />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ tab, isLoading }) {
  if (isLoading) return null;

  const config =
    tab === "discover"
      ? { icon: "🌸", title: "No profiles yet", sub: "Pull down to refresh." }
      : tab === "sent"
        ? {
            icon: "📨",
            title: "No sent requests",
            sub: "Discover profiles and send a request.",
          }
        : {
            icon: "💞",
            title: "No connections yet",
            sub: "Send requests and wait for them to accept.",
          };

  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{config.icon}</Text>
      <Text style={styles.emptyTitle}>{config.title}</Text>
      <Text style={styles.emptySub}>{config.sub}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FDF8F5",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FDF8F5",
    borderBottomWidth: 1,
    borderBottomColor: "#F0E8E3",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A0A0F",
    letterSpacing: 0.3,
  },
  bellWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F5EAF0",
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: {
    fontSize: 20,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#8B1A4A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FDF8F5",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },

  // Tab bar
  tabBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FDF8F5",
  },
  tabTrack: {
    flexDirection: "row",
    backgroundColor: "#F0E8E3",
    borderRadius: 50,
    padding: 3,
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    top: 3,
    width: "31%",
    bottom: 3,
    backgroundColor: "#8B1A4A",
    borderRadius: 50,
    shadowColor: "#8B1A4A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    zIndex: 1,
  },
  tabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#9E7D8A",
  },
  tabLabelActive: {
    color: "#FFFFFF",
  },
  tabCountBadge: {
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4, // spacing from text
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeInactive: {
    backgroundColor: "#8B1A4A", // Dark badge on light track
  },
  badgeActive: {
    backgroundColor: "rgba(255,255,255,0.25)", // Light glassmorphism on dark indicator
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: "700",
  },
  textInactive: {
    color: "#FFFFFF",
  },
  textActive: {
    color: "#FFFFFF",
  },
  // Ensure tabBtn has overflow visible so badges don't clip
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  // List
  listContent: {
    paddingVertical: 8,
    paddingBottom: 32,
    flexGrow: 1,
  },

  // Empty state
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A0A0F",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 14,
    color: "#9E7D8A",
    textAlign: "center",
    lineHeight: 21,
  },
});
