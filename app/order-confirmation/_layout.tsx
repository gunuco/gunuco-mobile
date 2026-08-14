import { Stack } from 'expo-router';
import { useTheme } from '@/src/providers';

export default function OrderConfirmationLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: theme.colors.bg.canvas },
      }}
    />
  );
}
