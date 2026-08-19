import React from 'react';
import { View } from 'react-native';
import { formatPaise } from '@/src/utils';
import { useTheme } from '@/src/providers';
import { GText } from '../ui/GText';
import type { TextVariant } from '@/src/design-system';

export type PriceDisplayProps = {
  pricePaise: number;
  compareAtPricePaise?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showFreeLabel?: boolean;
  pill?: boolean;
};

export function PriceDisplay({
  pricePaise,
  compareAtPricePaise,
  size = 'md',
  showFreeLabel,
  pill = false,
}: PriceDisplayProps) {
  const theme = useTheme();
  const variant: TextVariant = size === 'lg' ? 'priceLg' : size === 'sm' ? 'priceSm' : 'priceMd';
  const showCompare = typeof compareAtPricePaise === 'number' && compareAtPricePaise > pricePaise;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {pill ? (
        <View
          style={{
            backgroundColor: theme.colors.semantic.success,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 2,
          }}
        >
          <GText variant={variant} color="inverse">
            {formatPaise(pricePaise, { showFree: showFreeLabel })}
          </GText>
        </View>
      ) : (
        <GText variant={variant}>{formatPaise(pricePaise, { showFree: showFreeLabel })}</GText>
      )}
      {showCompare ? (
        <GText variant="caption" color="secondary" style={{ textDecorationLine: 'line-through' }}>
          {formatPaise(compareAtPricePaise)}
        </GText>
      ) : null}
    </View>
  );
}
