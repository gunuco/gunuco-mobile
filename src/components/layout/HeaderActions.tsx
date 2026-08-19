import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useGetCartQuery, useGetHomeQuery } from '@/src/store';
import { getCartBadgeCount } from '@/src/utils/cart';
import { cartHref, notificationsHref, profileHref, searchHref } from '@/src/utils/navigation';
import { GBadge } from '../ui/GBadge';
import { GIcon, type GIconName } from '../ui/GIcon';

export type HeaderActionsProps = {
  showProfile?: boolean;
  showNotifications?: boolean;
  showCart?: boolean;
  showSearch?: boolean;
};

function HeaderIconButton({
  iconName,
  accessibilityLabel,
  badgeCount,
  onPress,
}: {
  iconName: GIconName;
  accessibilityLabel: string;
  badgeCount?: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const badge = badgeCount && badgeCount > 0 ? badgeCount : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={{
        width: theme.dimensions.touchMin,
        height: theme.dimensions.touchMin,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <GIcon name={iconName} />
      {badge > 0 ? (
        <View style={{ position: 'absolute', top: 4, right: 4 }}>
          <GBadge label={badge > 9 ? '9+' : String(badge)} variant="danger" />
        </View>
      ) : null}
    </Pressable>
  );
}

export function HeaderActions({
  showProfile = false,
  showNotifications = false,
  showCart = false,
  showSearch = false,
}: HeaderActionsProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const cartQuery = useGetCartQuery(undefined, { skip: !isAuthenticated || !showCart });
  const homeQuery = useGetHomeQuery(undefined, { skip: !showNotifications });
  const cartBadge = showCart ? getCartBadgeCount(cartQuery.data) : 0;
  const unread = showNotifications ? (homeQuery.data?.unreadNotificationCount ?? 0) : 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {showSearch ? (
        <HeaderIconButton
          iconName="search-outline"
          accessibilityLabel="Search"
          onPress={() => router.push(searchHref())}
        />
      ) : null}
      {showProfile ? (
        <HeaderIconButton
          iconName="person-circle-outline"
          accessibilityLabel="Profile"
          onPress={() => router.push(profileHref())}
        />
      ) : null}
      {showNotifications ? (
        <HeaderIconButton
          iconName="notifications-outline"
          accessibilityLabel={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          badgeCount={unread}
          onPress={() => router.push(notificationsHref())}
        />
      ) : null}
      {showCart ? (
        <HeaderIconButton
          iconName="cart-outline"
          accessibilityLabel={cartBadge > 0 ? `Cart, ${cartBadge} items` : 'Cart'}
          badgeCount={cartBadge}
          onPress={() => router.push(cartHref())}
        />
      ) : null}
    </View>
  );
}
