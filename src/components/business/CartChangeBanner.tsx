import React from 'react';
import { useTheme } from '@/src/providers';
import type { CartChange } from '@/src/types/cart';
import { formatPaise } from '@/src/utils/money';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';

export type CartChangeBannerProps = {
  changes: CartChange[];
  title?: string;
};

function changeText(change: CartChange): string {
  if (change.message?.trim()) {
    return change.message.trim();
  }
  if (
    change.previousPricePaise != null &&
    change.currentPricePaise != null &&
    change.previousPricePaise !== change.currentPricePaise
  ) {
    const name = change.productName ? `${change.productName} price changed` : 'Price changed';
    return `${name} from ${formatPaise(change.previousPricePaise)} to ${formatPaise(change.currentPricePaise)}.`;
  }
  if (change.productName) {
    return `${change.productName} was updated.`;
  }
  return 'Your cart was updated. Please review before continuing.';
}

export function CartChangeBanner({ changes, title = 'Cart updated' }: CartChangeBannerProps) {
  const theme = useTheme();
  if (changes.length === 0) {
    return null;
  }

  return (
    <GCard
      style={{
        gap: theme.spacing.xs,
        backgroundColor: theme.colors.bg.surfaceMuted,
      }}
    >
      <GText variant="label">{title}</GText>
      {changes.map((change, index) => (
        <GText key={`${change.type ?? 'change'}-${index}`} variant="bodySm" color="secondary">
          {changeText(change)}
        </GText>
      ))}
    </GCard>
  );
}
