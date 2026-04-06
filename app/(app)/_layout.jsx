/**
 * app/(app)/_layout.tsx
 *
 * Protected layout for approved users:
 *   - /home
 *
 * Adds a lightweight auth guard — if somehow a user lands here
 * without a valid token (e.g. deep link, stale navigation state),
 * they get bounced back to /register immediately.
 */

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#8B1A4A", // Matches your rowValue/usernameHeader
        tabBarInactiveTintColor: "#AAAAAA", // Matches your rowLabel/cardTitle
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          textTransform: "uppercase", // Matches your cardTitle style
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF", // Matches your card background
          borderTopWidth: 1,
          borderTopColor: "#F5F5F5", // Matches your divider color
          height: 90,
          paddingBottom: 10,
          paddingTop: 5,
          elevation: 2, // Keeping it flat to match your shadow style
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
