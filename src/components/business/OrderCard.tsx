import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { OrderListItem, OrderStatusGroup } from '@/src/types/order';
import { formatPaise } from '@/src/utils/money';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';
import { GBadge, type GBadgeVariant } from '../ui/GBadge';
import { GButton } from '../ui/GButton';
import { PriceDisplay } from './PriceDisplay';

export type OrderCardProps = {
  order: OrderListItem;
  group: OrderStatusGroup;
  onPress?: () => void;
  onTrack?: () => void;
  onReorder?: () => void;
  reorderLoading?: boolean;
};

function badgeVariant(order: OrderListItem): GBadgeVariant {
  if (order.presentationStatus === 'CANCELLED') {
    return 'danger';
  }
  if (order.presentationStatus === 'DELIVERED') {
    return 'success';
  }
  if (order.presentationStatus === 'OUT_FOR_DELIVERY') {
    return 'info';
  }
  return 'neutral';
}

export function OrderCard({
  order,
  group,
  onPress,
  onTrack,
  onReorder,
  reorderLoading,
}: OrderCardProps) {
  const theme = useTheme();
  const numberLabel = order.orderNumber ? `Order ${order.orderNumber}` : 'Order';
  const showTrack = group === 'active' && order.trackingAvailable === true && onTrack;
  const showReorder = order.canReorder === true && onReorder && group !== 'active';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${numberLabel}. ${order.statusLabel}. View Order`}
      onPress={onPress}
    >
      <GCard style={{ gap: theme.spacing.sm }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <GText variant="label">
            {order.orderNumber ? `Order #${order.orderNumber}` : 'Order'}
          </GText>
          <GBadge label={order.statusLabel} variant={badgeVariant(order)} />
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
            {group === 'active' && order.scheduleLabel ? (
              <GText variant="caption" color="secondary">
                {order.scheduleLabel}
              </GText>
            ) : null}
            {order.placedAtLabel ? (
              <GText variant="caption" color="secondary">
                {order.placedAtLabel}
              </GText>
            ) : null}
            {order.itemSummary ? (
              <GText variant="caption" color="secondary" numberOfLines={2}>
                {order.itemSummary}
              </GText>
            ) : typeof order.itemCount === 'number' ? (
              <GText variant="caption" color="secondary">
                {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
              </GText>
            ) : null}
            {group === 'cancelled' && typeof order.refundPaise === 'number' ? (
              <GText variant="caption" color="secondary">
                Refund {order.refundStatus ? `${order.refundStatus} · ` : ''}
                {formatPaise(order.refundPaise)}
              </GText>
            ) : null}
          </View>
          {typeof order.totalPaise === 'number' ? (
            <PriceDisplay pricePaise={order.totalPaise} size="md" />
          ) : null}
        </View>
        {showTrack || showReorder ? (
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            {showTrack ? (
              <GButton
                title="Track Order"
                size="sm"
                variant="secondary"
                onPress={onTrack}
                accessibilityLabel="Track Order"
              />
            ) : null}
            {showReorder ? (
              <GButton
                title="Reorder"
                size="sm"
                loading={reorderLoading}
                onPress={onReorder}
                accessibilityLabel="Reorder"
              />
            ) : null}
          </View>
        ) : null}
      </GCard>
    </Pressable>
  );
}
