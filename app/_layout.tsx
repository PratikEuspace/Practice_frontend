import { getUserProfile } from "@/src/services/api";
import { clearAllUserData, getAuthToken } from "@/src/services/storage";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAuthToken();

        if (!token) {
          router.replace("/register");
          return;
        }

        try {
          const user = await getUserProfile(token);

          if (user.status === "approved") {
            router.replace("/");
          } else if (user.status === "rejected") {
            await clearAllUserData();
            router.replace("/register");
          } else {
            // pending (or any unknown status)
            router.replace("/pending");
          }
        } catch {
          // Network error — pending screen will handle retrying
          router.replace("/pending");
        }
      } catch {
        router.replace("/register");
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  return (
    <>
      {/* Stack registers all screens — headerShown: false for full custom UI */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* Overlay the splash until the redirect fires */}
      {!isReady && <Splash />}
    </>
  );
}

function Splash() {
  return (
    <View style={styles.splash}>
      <Text style={styles.logo}>💍</Text>
      <Text style={styles.title}>Matrimony</Text>
      <ActivityIndicator color="#E91E63" size="large" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  logo: { fontSize: 56 },
  title: { fontSize: 28, fontWeight: "800", color: "#1A1A2E" },
  spinner: { marginTop: 32 },
});
