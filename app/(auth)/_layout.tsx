import { Stack } from 'expo-router';
import { useTheme } from '@/src/providers';

export default function AuthLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bg.canvas },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}
