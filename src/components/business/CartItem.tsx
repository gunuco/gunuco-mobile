import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { CartLine } from '@/src/types/cart';
import { formatPaise } from '@/src/utils/money';
import { formatCartOptionSummary } from '@/src/utils/cart';
import { GCard } from '../ui/GCard';
import { GImage } from '../ui/GImage';
import { GText } from '../ui/GText';
import { GBadge } from '../ui/GBadge';
import { PriceDisplay } from './PriceDisplay';
import { QuantitySelector } from './QuantitySelector';

export type CartItemProps = {
  item: CartLine;
  quantityLoading?: boolean;
  removeDisabled?: boolean;
  compact?: boolean;
  onPress?: () => void;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
  onEditOptions?: () => void;
};

function CartItemComponent({
  item,
  quantityLoading = false,
  removeDisabled = false,
  compact = false,
  onPress,
  onQuantityChange,
  onRemove,
  onEditOptions,
}: CartItemProps) {
  const theme = useTheme();
  const unavailable = item.isAvailable === false;
  const optionSummary = formatCartOptionSummary(item);
  const minQuantity = item.quantityMin && item.quantityMin > 0 ? item.quantityMin : 1;
  const maxQuantity = item.quantityMax && item.quantityMax >= minQuantity ? item.quantityMax : 99;
  const showPriceChange =
    item.priceChanged === true &&
    item.previousPricePaise != null &&
    item.previousPricePaise !== item.unitPricePaise;

  return (
    <GCard
      style={{
        flexDirection: 'row',
        gap: theme.spacing.md,
        opacity: unavailable ? 0.7 : 1,
      }}
    >
      <Pressable accessibilityRole="button" accessibilityLabel={item.name} onPress={onPress}>
        <GImage
          uri={item.imageUrl}
          width={theme.dimensions.productImage.thumb}
          height={theme.dimensions.productImage.thumb}
          accessibilityLabel={item.name}
        />
      </Pressable>
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <Pressable accessibilityRole="button" accessibilityLabel={item.name} onPress={onPress}>
          <GText variant="label" numberOfLines={2}>
            {item.name}
          </GText>
        </Pressable>
        {optionSummary ? (
          <GText variant="caption" color="secondary">
            {optionSummary}
          </GText>
        ) : null}
        {showPriceChange ? (
          <GText variant="caption" color="danger">
            {formatPaise(item.previousPricePaise ?? 0)} → {formatPaise(item.unitPricePaise)}
          </GText>
        ) : (
          <PriceDisplay
            pricePaise={item.unitPricePaise}
            compareAtPricePaise={item.compareAtPricePaise}
            size="sm"
          />
        )}
        {typeof item.lineTotalPaise === 'number' ? (
          <GText variant="bodySm">{formatPaise(item.lineTotalPaise)}</GText>
        ) : null}
        {compact ? (
          <GText variant="caption">Qty {item.quantity}</GText>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: theme.spacing.sm,
              marginTop: theme.spacing.xs,
              flexWrap: 'wrap',
            }}
          >
            {onQuantityChange ? (
              <QuantitySelector
                value={item.quantity}
                min={minQuantity}
                max={maxQuantity}
                onChange={onQuantityChange}
                disabled={unavailable}
                loading={quantityLoading}
              />
            ) : (
              <GText variant="caption">Qty {item.quantity}</GText>
            )}
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              {item.optionsChanged && onEditOptions ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Choose options for ${item.name}`}
                  onPress={onEditOptions}
                  hitSlop={8}
                >
                  <GText variant="label" color="brand">
                    Choose options
                  </GText>
                </Pressable>
              ) : null}
              {onRemove ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.name} from cart`}
                  disabled={removeDisabled}
                  onPress={onRemove}
                  hitSlop={8}
                >
                  <GText variant="label" color="danger">
                    Remove
                  </GText>
                </Pressable>
              ) : null}
            </View>
          </View>
        )}
        {unavailable ? (
          <GBadge label={item.availabilityLabel ?? 'Unavailable'} variant="danger" />
        ) : null}
        {item.optionsChanged ? (
          <GText variant="caption" color="danger">
            Selected options are no longer valid. Open the product to choose a new configuration.
          </GText>
        ) : null}
      </View>
    </GCard>
  );
}

export const CartItem = memo(CartItemComponent);
