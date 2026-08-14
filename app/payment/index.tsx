import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/providers';
import { EmptyState, GText, Header } from '@/src/components';
import { checkoutHref } from '@/src/utils/navigation';

/**
 * Payment boundary only. Razorpay / confirmation belong to Phase 9.
 */
export default function PaymentBoundaryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ checkoutId?: string }>();
  const checkoutId = typeof params.checkoutId === 'string' ? params.checkoutId : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Payment" showBack onBackPress={() => router.replace(checkoutHref())} />
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md }}>
        {checkoutId ? (
          <GText variant="caption" color="secondary">
            Checkout ready.
          </GText>
        ) : null}
      </View>
      <EmptyState
        title="Payment will be handled in the next phase"
        description="Your checkout was created. Razorpay, payment confirmation, and order confirmation are not implemented yet."
        actionLabel="Back to cart"
        onAction={() => router.replace('/(tabs)/cart')}
      />
    </View>
  );
}
