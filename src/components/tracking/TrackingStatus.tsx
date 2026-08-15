import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { OrderTracking } from '@/src/types/tracking';
import { minutesSince } from '@/src/utils/orders';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';

export type TrackingStatusProps = {
  tracking: OrderTracking;
};

export function TrackingStatus({ tracking }: TrackingStatusProps) {
  const theme = useTheme();
  const minutes = minutesSince(tracking.updatedAt);
  let freshness: string | undefined;
  if (tracking.stale === true && typeof minutes !== 'number') {
    freshness = 'Location update unavailable';
  } else if (typeof minutes === 'number') {
    freshness =
      minutes === 0 ? 'Location updated just now' : `Location last updated ${minutes} minutes ago`;
  }

  return (
    <GCard style={{ gap: theme.spacing.sm }}>
      {tracking.statusLabel ? (
        <GText variant="titleSm" accessibilityLabel={`Status ${tracking.statusLabel}`}>
          {tracking.statusLabel}
        </GText>
      ) : null}
      {tracking.etaLabel ? (
        <View style={{ gap: theme.spacing.xxs }}>
          <GText variant="label" color="secondary">
            ETA
          </GText>
          <GText variant="titleMd" accessibilityLabel={`Estimated arrival ${tracking.etaLabel}`}>
            {tracking.etaLabel}
          </GText>
        </View>
      ) : null}
      {freshness ? (
        <GText variant="caption" color="secondary">
          {freshness}
        </GText>
      ) : null}
      {tracking.message ? (
        <GText variant="bodySm" color="secondary">
          {tracking.message}
        </GText>
      ) : null}
    </GCard>
  );
}
