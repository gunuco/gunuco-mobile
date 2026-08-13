import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { OrderSummary } from '@/src/types';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';
import { GBadge } from '../ui/GBadge';
import { PriceDisplay } from './PriceDisplay';

export type OrderCardProps = {
  order: OrderSummary;
  onPress?: () => void;
};

export function OrderCard({ order, onPress }: OrderCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.publicOrderId}`}
      onPress={onPress}
    >
      <GCard style={{ gap: theme.spacing.sm }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <GText variant="label">{order.publicOrderId}</GText>
          <GBadge label={order.statusLabel} variant="info" />
        </View>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            {order.fulfilmentLabel ? (
              <GText variant="bodySm" color="secondary">
                {order.fulfilmentLabel}
              </GText>
            ) : null}
            {order.placedAtLabel ? (
              <GText variant="caption" color="secondary">
                {order.placedAtLabel}
              </GText>
            ) : null}
            {typeof order.itemCount === 'number' ? (
              <GText variant="caption" color="secondary">
                {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
              </GText>
            ) : null}
          </View>
          <PriceDisplay pricePaise={order.totalPaise} size="md" />
        </View>
      </GCard>
    </Pressable>
  );
}
