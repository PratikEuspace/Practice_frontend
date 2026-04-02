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

import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
