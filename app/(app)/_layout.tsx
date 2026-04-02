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

import { getAuthToken } from "@/src/services/storage";
import { router, Stack } from "expo-router";
import { useEffect } from "react";

export default function AppLayout() {
  useEffect(() => {
    (async () => {
      const token = await getAuthToken();
      if (!token) {
        router.replace("/(auth)/register");
      }
    })();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
