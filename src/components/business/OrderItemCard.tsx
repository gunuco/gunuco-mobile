import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { OrderItem } from '@/src/types/order';
import { formatOrderOptionSummary } from '@/src/utils/orders';
import { GCard } from '../ui/GCard';
import { GImage } from '../ui/GImage';
import { GText } from '../ui/GText';
import { GButton } from '../ui/GButton';
import { PriceDisplay } from './PriceDisplay';

export type OrderItemCardProps = {
  item: OrderItem;
  onWriteReview?: () => void;
};

export function OrderItemCard({ item, onWriteReview }: OrderItemCardProps) {
  const theme = useTheme();
  const options = formatOrderOptionSummary(item);
  const linePrice = item.lineTotalPaise ?? item.unitPricePaise;

  return (
    <GCard style={{ flexDirection: 'row', gap: theme.spacing.md }}>
      <GImage
        uri={item.imageUrl}
        width={theme.dimensions.productImage.thumb}
        height={theme.dimensions.productImage.thumb}
        accessibilityLabel={item.name}
      />
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <GText variant="label" numberOfLines={2}>
          {item.name}
        </GText>
        {options ? (
          <GText variant="caption" color="secondary">
            {options}
          </GText>
        ) : null}
        <GText variant="caption" color="secondary">
          Qty {item.quantity}
        </GText>
        {typeof linePrice === 'number' ? <PriceDisplay pricePaise={linePrice} size="sm" /> : null}
        {onWriteReview ? (
          <GButton
            title="Write Review"
            size="sm"
            variant="secondary"
            onPress={onWriteReview}
            accessibilityLabel="Write Review"
          />
        ) : null}
      </View>
    </GCard>
  );
}
