import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { OrderConfirmation } from '@/src/types/order';
import { PriceDisplay } from './PriceDisplay';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';
import { GIcon } from '../ui/GIcon';

export type OrderConfirmationCardProps = {
  confirmation: OrderConfirmation;
};

export function OrderConfirmationCard({ confirmation }: OrderConfirmationCardProps) {
  const theme = useTheme();
  const fulfilmentLabel =
    confirmation.fulfilment === 'PICKUP'
      ? 'Pickup'
      : confirmation.fulfilment === 'DELIVERY'
        ? 'Delivery'
        : null;

  return (
    <GCard style={{ gap: theme.spacing.md }}>
      <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
        <GIcon
          name="checkmark-circle"
          size="lg"
          color={theme.colors.semantic.success}
          accessibilityLabel="Order placed successfully"
        />
        <GText variant="titleMd" align="center">
          Order placed successfully
        </GText>
      </View>
      {confirmation.orderNumber ? (
        <GText
          variant="titleSm"
          align="center"
          accessibilityLabel={`Order ${confirmation.orderNumber}`}
        >
          Order #{confirmation.orderNumber}
        </GText>
      ) : null}
      {typeof confirmation.totalPaise === 'number' ? (
        <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
          <GText variant="label" color="secondary">
            Total
          </GText>
          <PriceDisplay pricePaise={confirmation.totalPaise} size="md" />
        </View>
      ) : null}
      {fulfilmentLabel ? (
        <View style={{ gap: theme.spacing.xs }}>
          <GText variant="label" color="secondary">
            {fulfilmentLabel}
          </GText>
          {confirmation.locationLabel ? (
            <GText variant="bodyMd">{confirmation.locationLabel}</GText>
          ) : null}
        </View>
      ) : null}
      {confirmation.scheduleLabel ? (
        <View style={{ gap: theme.spacing.xs }}>
          <GText variant="label" color="secondary">
            When
          </GText>
          <GText variant="bodyMd">{confirmation.scheduleLabel}</GText>
        </View>
      ) : null}
      {confirmation.paymentStatus ? (
        <GText variant="caption" color="secondary">
          Payment {confirmation.paymentStatus}
        </GText>
      ) : null}
    </GCard>
  );
}
