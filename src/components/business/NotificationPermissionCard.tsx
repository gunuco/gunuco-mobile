import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';
import { GButton } from '../ui/GButton';

export type NotificationPermissionCardProps = {
  title?: string;
  description?: string;
  allowLabel?: string;
  laterLabel?: string;
  onAllow: () => void;
  onLater?: () => void;
  loading?: boolean;
};

export function NotificationPermissionCard({
  title = 'Get order updates',
  description = 'Allow notifications to know when your order is ready or out for delivery.',
  allowLabel = 'Allow Notifications',
  laterLabel = 'Not now',
  onAllow,
  onLater,
  loading,
}: NotificationPermissionCardProps) {
  const theme = useTheme();

  return (
    <GCard style={{ gap: theme.spacing.sm }}>
      <GText variant="titleSm">{title}</GText>
      <GText variant="bodyMd" color="secondary">
        {description}
      </GText>
      <View style={{ gap: theme.spacing.sm }}>
        <GButton
          title={allowLabel}
          fullWidth
          loading={loading}
          onPress={onAllow}
          accessibilityLabel={allowLabel}
        />
        {onLater ? (
          <GButton
            title={laterLabel}
            variant="ghost"
            fullWidth
            onPress={onLater}
            accessibilityLabel={laterLabel}
          />
        ) : null}
      </View>
    </GCard>
  );
}
