import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { CustomerNotification } from '@/src/types/notification';
import { GText } from '../ui/GText';
import { GCard } from '../ui/GCard';

export type NotificationItemProps = {
  notification: CustomerNotification;
  onPress: () => void;
};

function NotificationItemComponent({ notification, onPress }: NotificationItemProps) {
  const theme = useTheme();
  const unread = !notification.read;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}${unread ? ', unread' : ', read'}`}
      accessibilityHint="Opens the related screen"
      accessibilityState={{ selected: unread }}
      onPress={onPress}
    >
      <GCard
        style={{
          flexDirection: 'row',
          gap: theme.spacing.sm,
          borderLeftWidth: unread ? 3 : 0,
          borderLeftColor: unread ? theme.colors.brand.primary : 'transparent',
        }}
      >
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <GText variant={unread ? 'label' : 'bodyMd'} style={{ flex: 1 }} numberOfLines={2}>
              {notification.title}
            </GText>
            {unread ? (
              <GText variant="caption" color="brand">
                New
              </GText>
            ) : null}
          </View>
          {notification.body ? (
            <GText variant="bodyMd" color="secondary" numberOfLines={3}>
              {notification.body}
            </GText>
          ) : null}
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
            {notification.typeLabel ? (
              <GText variant="caption" color="secondary">
                {notification.typeLabel}
              </GText>
            ) : null}
            {notification.createdAtLabel ? (
              <GText variant="caption" color="secondary">
                {notification.createdAtLabel}
              </GText>
            ) : null}
          </View>
        </View>
      </GCard>
    </Pressable>
  );
}

export const NotificationItem = memo(NotificationItemComponent);
