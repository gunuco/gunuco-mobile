import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { GText } from '../ui/GText';
import { GIcon } from '../ui/GIcon';
import { GBadge } from '../ui/GBadge';
import { SearchBar } from '../ui/SearchBar';
import { APP_NAME } from '@/src/constants';

export type HomeHeaderProps = {
  locationLabel: string;
  unreadNotificationCount?: number;
  onLocationPress?: () => void;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
};

function HomeHeaderComponent({
  locationLabel,
  unreadNotificationCount = 0,
  onLocationPress,
  onNotificationPress,
  onSearchPress,
}: HomeHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + theme.spacing.sm,
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.bg.canvas,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.default,
        gap: theme.spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delivery location ${locationLabel}`}
          onPress={onLocationPress}
          style={{ flex: 1, gap: 2 }}
        >
          <GText variant="caption" color="secondary">
            {APP_NAME}
          </GText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
            <GIcon name="location-outline" size="sm" color={theme.colors.brand.primary} />
            <GText variant="label" numberOfLines={1} style={{ flex: 1 }}>
              {locationLabel}
            </GText>
            <GIcon name="chevron-down" size="sm" color={theme.colors.text.secondary} />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={onNotificationPress}
          hitSlop={8}
          style={{
            width: theme.dimensions.touchMin,
            height: theme.dimensions.touchMin,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GIcon name="notifications-outline" />
          {unreadNotificationCount > 0 ? (
            <View style={{ position: 'absolute', top: 4, right: 4 }}>
              <GBadge
                label={unreadNotificationCount > 9 ? '9+' : String(unreadNotificationCount)}
                variant="danger"
              />
            </View>
          ) : null}
        </Pressable>
      </View>

      <SearchBar
        value=""
        onChangeText={() => undefined}
        placeholder="Search cakes, cookies & more"
        onPress={onSearchPress}
      />
    </View>
  );
}

export const HomeHeader = memo(HomeHeaderComponent);
