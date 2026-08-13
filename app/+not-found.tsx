import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { GButton, GText } from '@/src/components';
import { useTheme } from '@/src/providers';

export default function NotFoundScreen() {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: true }} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.bg.canvas,
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
        }}
      >
        <GText variant="titleMd">Screen not found</GText>
        <Link href="/" asChild>
          <GButton title="Go to Phase 1 gallery" />
        </Link>
      </View>
    </>
  );
}
