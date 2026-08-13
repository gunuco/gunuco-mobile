import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { CartLineSummary } from '@/src/types';
import { GCard } from '../ui/GCard';
import { GImage } from '../ui/GImage';
import { GText } from '../ui/GText';
import { PriceDisplay } from './PriceDisplay';
import { QuantitySelector } from './QuantitySelector';

export type CartItemProps = {
  item: CartLineSummary;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
  onEditOptions?: () => void;
};

export function CartItem({ item, onQuantityChange, onRemove, onEditOptions }: CartItemProps) {
  const theme = useTheme();
  const unavailable = item.isAvailable === false;

  return (
    <GCard
      style={{
        flexDirection: 'row',
        gap: theme.spacing.md,
        opacity: unavailable ? 0.6 : 1,
      }}
    >
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
        {item.optionsSummary ? (
          <GText variant="caption" color="secondary" numberOfLines={2}>
            {item.optionsSummary}
          </GText>
        ) : null}
        <PriceDisplay pricePaise={item.unitPricePaise} size="sm" />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.xs,
          }}
        >
          {onQuantityChange ? (
            <QuantitySelector
              value={item.quantity}
              onChange={onQuantityChange}
              disabled={unavailable}
            />
          ) : (
            <GText variant="caption">Qty {item.quantity}</GText>
          )}
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            {onEditOptions ? (
              <Pressable accessibilityRole="button" onPress={onEditOptions} hitSlop={8}>
                <GText variant="label" color="brand">
                  Edit
                </GText>
              </Pressable>
            ) : null}
            {onRemove ? (
              <Pressable accessibilityRole="button" onPress={onRemove} hitSlop={8}>
                <GText variant="label" color="danger">
                  Remove
                </GText>
              </Pressable>
            ) : null}
          </View>
        </View>
        {unavailable ? (
          <GText variant="caption" color="danger">
            Item unavailable
          </GText>
        ) : null}
      </View>
    </GCard>
  );
}
