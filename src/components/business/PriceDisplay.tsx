import React from 'react';
import { View } from 'react-native';
import { formatPaise } from '@/src/utils';
import { GText } from '../ui/GText';
import type { TextVariant } from '@/src/design-system';

export type PriceDisplayProps = {
  pricePaise: number;
  compareAtPricePaise?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showFreeLabel?: boolean;
};

export function PriceDisplay({
  pricePaise,
  compareAtPricePaise,
  size = 'md',
  showFreeLabel,
}: PriceDisplayProps) {
  const variant: TextVariant = size === 'lg' ? 'priceLg' : size === 'sm' ? 'priceSm' : 'priceMd';
  const showCompare = typeof compareAtPricePaise === 'number' && compareAtPricePaise > pricePaise;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
      <GText variant={variant}>{formatPaise(pricePaise, { showFree: showFreeLabel })}</GText>
      {showCompare ? (
        <GText variant="caption" color="secondary" style={{ textDecorationLine: 'line-through' }}>
          {formatPaise(compareAtPricePaise)}
        </GText>
      ) : null}
    </View>
  );
}
