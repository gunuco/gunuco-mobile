import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { FulfilmentType } from '@/src/types/fulfilment';
import { PriceDisplay } from './PriceDisplay';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';

export type PaymentSummaryProps = {
  amountPaise?: number;
  fulfilment?: FulfilmentType;
  locationLabel?: string;
  scheduleLabel?: string;
};

export function PaymentSummary({
  amountPaise,
  fulfilment,
  locationLabel,
  scheduleLabel,
}: PaymentSummaryProps) {
  const theme = useTheme();
  const fulfilmentLabel =
    fulfilment === 'PICKUP' ? 'Pickup' : fulfilment === 'DELIVERY' ? 'Delivery' : null;

  return (
    <GCard style={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.xs }}>
        <GText variant="label" color="secondary">
          Amount to pay
        </GText>
        {typeof amountPaise === 'number' ? (
          <PriceDisplay pricePaise={amountPaise} size="lg" />
        ) : (
          <GText variant="bodyMd" color="secondary">
            Amount will be confirmed by the server.
          </GText>
        )}
      </View>
      {fulfilmentLabel ? (
        <View style={{ gap: theme.spacing.xs }}>
          <GText variant="label" color="secondary">
            {fulfilmentLabel}
          </GText>
          {locationLabel ? (
            <GText variant="bodyMd">{locationLabel}</GText>
          ) : (
            <GText variant="bodySm" color="secondary">
              {fulfilment === 'PICKUP'
                ? 'Pickup details from checkout.'
                : 'Delivery address from checkout.'}
            </GText>
          )}
        </View>
      ) : null}
      {scheduleLabel ? (
        <View style={{ gap: theme.spacing.xs }}>
          <GText variant="label" color="secondary">
            Scheduled
          </GText>
          <GText variant="bodyMd">{scheduleLabel}</GText>
        </View>
      ) : null}
    </GCard>
  );
}
