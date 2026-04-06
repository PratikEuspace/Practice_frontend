/**
 * app/(auth)/_layout.tsx
 *
 * Layout for unauthenticated screens:
 *   - /register
 *   - /profile-setup
 *
 * Plain Stack, no header — each screen owns its own UI.
 * No auth guard here; the root _layout already redirects
 * unauthenticated users into this group.
 */

import { Stack, useRouter } from "expo-router";
import React from "react";

export default function AuthLayout() {
  const router = useRouter();
  // useEffect(() => {
  //   const localData = getUserData();
  //   if (localData) {
  //     router.push("/(auth)");
  //   } else {
  //     router.push("/(auth)/login");
  //   }
  //   console.log("Entered (auth) layout");
  // }, []);

  return <Stack screenOptions={{ headerShown: false }} >
    <Stack.Screen name="index" />
    <Stack.Screen name="login" />
  </Stack>;
}
