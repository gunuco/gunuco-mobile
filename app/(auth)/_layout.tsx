import { Stack } from 'expo-router';

/**
 * Auth stack shell for Phase 2 (Phone OTP).
 * No feature screens yet.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
