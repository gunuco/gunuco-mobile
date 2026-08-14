import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { CartTotals } from '@/src/types/cart';
import { formatPaise } from '@/src/utils/money';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';
import { GDivider } from '../ui/GDivider';

export type CartSummaryProps = {
  totals: CartTotals;
};

type SummaryRow = {
  key: string;
  label: string;
  amountPaise: number;
  tone?: 'danger' | 'primary' | 'success';
  emphasize?: boolean;
};

function buildRows(totals: CartTotals): SummaryRow[] {
  const rows: SummaryRow[] = [];
  if (typeof totals.subtotalPaise === 'number') {
    rows.push({ key: 'subtotal', label: 'Subtotal', amountPaise: totals.subtotalPaise });
  }
  if (typeof totals.discountPaise === 'number' && totals.discountPaise !== 0) {
    const discount =
      totals.discountPaise > 0 ? -Math.abs(totals.discountPaise) : totals.discountPaise;
    rows.push({
      key: 'discount',
      label: 'Discount',
      amountPaise: discount,
      tone: 'success',
    });
  }
  if (typeof totals.taxPaise === 'number') {
    rows.push({ key: 'tax', label: 'Tax', amountPaise: totals.taxPaise });
  }
  if (typeof totals.deliveryFeePaise === 'number') {
    rows.push({ key: 'delivery', label: 'Delivery fee', amountPaise: totals.deliveryFeePaise });
  }
  if (typeof totals.totalPaise === 'number') {
    rows.push({
      key: 'total',
      label: 'Total',
      amountPaise: totals.totalPaise,
      emphasize: true,
    });
  }
  return rows;
}

export function CartSummary({ totals }: CartSummaryProps) {
  const theme = useTheme();
  const rows = buildRows(totals);

  if (rows.length === 0) {
    return null;
  }

  return (
    <GCard style={{ gap: theme.spacing.sm }}>
      <GText variant="titleSm">Summary</GText>
      {rows.map((row, index) => (
        <View key={row.key} style={{ gap: theme.spacing.sm }}>
          {row.emphasize ? <GDivider /> : null}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: theme.spacing.md,
              marginTop: row.emphasize && index > 0 ? theme.spacing.xs : 0,
            }}
          >
            <GText variant={row.emphasize ? 'label' : 'bodyMd'} color="secondary">
              {row.label}
            </GText>
            <GText
              variant={row.emphasize ? 'priceMd' : 'bodyMd'}
              color={
                row.tone === 'danger' ? 'danger' : row.tone === 'success' ? 'success' : 'primary'
              }
            >
              {formatPaise(row.amountPaise)}
            </GText>
          </View>
        </View>
      ))}
    </GCard>
  );
}
