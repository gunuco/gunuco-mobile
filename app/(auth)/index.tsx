import { Link } from 'expo-router';
import { View } from 'react-native';
import { GText, GButton } from '@/src/components';
import { useTheme } from '@/src/providers';

/** Placeholder — Phone OTP screens land in Phase 2. */
export default function AuthPlaceholderScreen() {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg.canvas,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
      }}
    >
      <GText variant="titleMd">Auth (Phase 2)</GText>
      <GText variant="bodyMd" color="secondary" align="center">
        Phone + OTP authentication screens will be implemented in Phase 2.
      </GText>
      <Link href="/" asChild>
        <GButton title="Back to Phase 1 gallery" />
      </Link>
    </View>
  );
}
