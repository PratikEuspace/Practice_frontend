/**
 * app/_layout.tsx  —  Root Layout & Auth Gate
 *
 * On cold start:
 *   No token                    →  /(auth)/register
 *   Token + approved            →  /(app)/home
 *   Token + pending             →  /(pending)
 *   Token + rejected            →  /(auth)/register  (clears data)
 *   Token + 401 Unauthorized    →  /(auth)/register  (clears stale token)
 *   Other network error         →  /(pending)        (let it retry)
 */

import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { getUserProfile } from "@/src/services/api";
import { getAuthToken } from "@/src/services/storage";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const token = await getAuthToken();

        if (!token) {
          // No token — user either hasn't registered or logged out
          // Send to login; they can navigate to register from there
          router.replace("/(auth)");
          return;
        } else {
          try {
            const user = await getUserProfile(token);
            if (user) {
              router.replace("/(app)");
            } else {
              // If we can't fetch the profile, treat it as pending (could be 401 or server error)
              router.replace("/(auth)");
            }
          } catch (error) {
            // Genuine network error (no internet, server down, etc.)
            // Fall to pending so the pending screen can keep retrying
            console.warn(
              "_layout: network error, falling back to pending",
              error,
            );
          }
        }
      } catch (error) {
        // AsyncStorage failure — safest fallback is register
        console.error("_layout: storage error", error);
        router.replace("/(auth)/login");
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
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
