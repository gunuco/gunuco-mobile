import { Tabs } from 'expo-router';
import { useTheme } from '@/src/providers';
import { GIcon, type GIconName } from '@/src/components';

function TabIcon({ name, color, size }: { name: GIconName; color: string; size: number }) {
  return <GIcon name={name} color={color} size={size} />;
}

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarLabelStyle: {
          ...theme.typography.caption,
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: theme.colors.bg.surface,
          borderTopColor: theme.colors.border.default,
          borderTopWidth: 0.5,
          height: theme.dimensions.bottomNavHeight + 10,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={String(color)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'storefront' : 'storefront-outline'}
              color={String(color)}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reorder"
        options={{
          title: 'Reorder',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'cafe' : 'cafe-outline'} color={String(color)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'time' : 'time-outline'} color={String(color)} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="search" options={{ href: null, title: 'Search' }} />
      <Tabs.Screen name="cart" options={{ href: null, title: 'Cart' }} />
      <Tabs.Screen name="profile" options={{ href: null, title: 'Profile' }} />
    </Tabs>
  );
}
