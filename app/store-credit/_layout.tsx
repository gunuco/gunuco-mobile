import { Stack } from 'expo-router';
import { useTheme } from '@/src/providers';

export default function StoreCreditLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bg.canvas },
      }}
    />
  );
}
