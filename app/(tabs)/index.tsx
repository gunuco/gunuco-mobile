import { Link } from 'expo-router';
import { View } from 'react-native';
import { GText, GButton } from '@/src/components';
import { useTheme } from '@/src/providers';

/** Placeholder tab — feature tabs (Home/Search/Categories/Cart/Profile) arrive in later phases. */
export default function TabsPlaceholderScreen() {
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
      <GText variant="titleMd">Tabs shell</GText>
      <GText variant="bodyMd" color="secondary" align="center">
        Navigation foundation is ready. Customer feature tabs will be added starting Phase 3.
      </GText>
      <Link href="/" asChild>
        <GButton title="Open design system gallery" />
      </Link>
      <Link href="/(auth)" asChild>
        <GButton title="Open auth shell" variant="secondary" />
      </Link>
    </View>
  );
}
