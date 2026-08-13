import { Tabs } from 'expo-router';
import { useTheme } from '@/src/providers';
import { GIcon } from '@/src/components';

/**
 * Primary tab shell for later phases.
 * Phase 1 only exposes a foundation placeholder tab.
 */
export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.bg.surface,
          borderTopColor: theme.colors.border.default,
          height: theme.dimensions.bottomNavHeight,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Foundation',
          tabBarIcon: ({ color, size }) => (
            <GIcon name="grid-outline" color={String(color)} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
