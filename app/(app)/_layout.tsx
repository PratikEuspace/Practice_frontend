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

import { Stack } from "expo-router";

export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
