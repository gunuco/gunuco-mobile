import { useTheme } from '@/src/providers';
import type { OrderListItem, OrderStatusGroup } from '@/src/types/order';
import { Pressable, View } from 'react-native';
import { GBadge, type GBadgeVariant } from '../ui/GBadge';
import { GButton } from '../ui/GButton';
import { GCard } from '../ui/GCard';
import { GIcon } from '../ui/GIcon';
import { GText } from '../ui/GText';
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

  const presentation = order.presentationStatus;
  const heroTone = presentation === 'CANCELLED' ? 'danger' : presentation === 'DELIVERED' ? 'success' : undefined;
  const heroIconName =
    presentation === 'CANCELLED'
      ? ('close-circle' as const)
      : presentation === 'DELIVERED'
        ? ('checkmark-circle' as const)
        : undefined;
  const heroBg =
    heroTone === 'success'
      ? theme.colors.semantic.success
      : heroTone === 'danger'
        ? theme.colors.semantic.danger
        : theme.colors.border.default;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${numberLabel}. ${order.statusLabel}. View Order`}
      onPress={onPress}
    >
      <GCard style={{ gap: theme.spacing.md, padding: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flex: 1 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: theme.radius.lg,
                backgroundColor: heroBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {heroIconName ? (
                <GIcon
                  name={heroIconName}
                  size="md"
                  color={theme.colors.text.inverse}
                  accessibilityLabel="Order status icon"
                />
              ) : (
                <GBadge label={order.statusLabel} variant={badgeVariant(order)} />
              )}
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <GText variant="label">
                {order.presentationStatus === 'CANCELLED' ? 'Order cancelled' : 'Order delivered'}
              </GText>
              {order.placedAtLabel ? (
                <GText variant="caption" color="secondary" numberOfLines={1}>
                  Placed at {order.placedAtLabel}
                </GText>
              ) : null}
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            {typeof order.totalPaise === 'number' ? (
              <PriceDisplay pricePaise={order.totalPaise} size="md" />
            ) : null}
            <GIcon name="chevron-forward" size="sm" color={theme.colors.text.secondary} />
          </View>
        </View>

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
            title={reorderLoading ? 'Adding...' : 'Order Again'}
            fullWidth
            loading={reorderLoading}
            onPress={onReorder}
            accessibilityLabel="Order Again"
          />
        ) : null}
      </GCard>
    </Pressable>
  );
}
