/**
 * app/(pending)/_layout.tsx
 *
 * Layout for the approval-waiting screen:
 *   - /pending  (index.tsx)
 *
 * No header, no back gesture — the user shouldn't be able to
 * swipe back to register while waiting for admin approval.
 */

import { Stack } from "expo-router";

export default function PendingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // prevent swipe-back to auth screens
      }}
    />
  );
}
