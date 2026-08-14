import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { PaymentUiState } from '@/src/types/payment';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';
import { GButton } from '../ui/GButton';
import { GLoader } from '../ui/GLoader';

export type PaymentStatusCardProps = {
  state: PaymentUiState;
  message?: string | null;
  allowRetry?: boolean;
  onRetry?: () => void;
  onConfirmPending?: () => void;
  onBackToCheckout?: () => void;
};

function copyFor(state: PaymentUiState, message?: string | null): { title: string; body: string } {
  switch (state) {
    case 'PREPARING':
      return { title: 'Preparing payment', body: 'Please wait.' };
    case 'RAZORPAY_OPEN':
      return { title: 'Opening Razorpay', body: 'Complete payment in the Razorpay window.' };
    case 'VERIFYING':
      return { title: 'Confirming payment', body: 'Verifying your payment with GUNUCO.' };
    case 'FAILED':
      return {
        title: 'Payment failed',
        body: message ?? 'Payment failed. You have not been charged for a completed order.',
      };
    case 'CANCELLED':
      return { title: 'Payment cancelled', body: message ?? 'You closed the payment window.' };
    case 'UNKNOWN':
      return {
        title: 'Payment status could not be confirmed',
        body:
          message ??
          "We couldn't confirm your payment yet. Please check your payment status or try again.",
      };
    default:
      return { title: 'Payment', body: message ?? '' };
  }
}

export function PaymentStatusCard({
  state,
  message,
  allowRetry = true,
  onRetry,
  onConfirmPending,
  onBackToCheckout,
}: PaymentStatusCardProps) {
  const theme = useTheme();
  const busy = state === 'PREPARING' || state === 'RAZORPAY_OPEN' || state === 'VERIFYING';
  const { title, body } = copyFor(state, message);

  if (state === 'IDLE' || state === 'CONFIRMED') {
    return null;
  }

  return (
    <GCard style={{ gap: theme.spacing.sm }}>
      {busy ? <GLoader /> : null}
      <GText variant="titleSm">{title}</GText>
      {body ? (
        <GText variant="bodySm" color="secondary">
          {body}
        </GText>
      ) : null}
      {state === 'FAILED' || state === 'CANCELLED' ? (
        <View style={{ gap: theme.spacing.sm }}>
          {allowRetry && onRetry ? (
            <GButton title="Try Again" onPress={onRetry} accessibilityLabel="Try Again" />
          ) : null}
          {onBackToCheckout ? (
            <GButton
              title="Back to Checkout"
              variant="secondary"
              onPress={onBackToCheckout}
              accessibilityLabel="Back to Checkout"
            />
          ) : null}
        </View>
      ) : null}
      {state === 'UNKNOWN' ? (
        <View style={{ gap: theme.spacing.sm }}>
          {onConfirmPending ? (
            <GButton
              title="Confirm payment"
              onPress={onConfirmPending}
              accessibilityLabel="Confirm payment"
            />
          ) : null}
          {onBackToCheckout ? (
            <GButton
              title="Back to Checkout"
              variant="secondary"
              onPress={onBackToCheckout}
              accessibilityLabel="Back to Checkout"
            />
          ) : null}
        </View>
      ) : null}
    </GCard>
  );
}
