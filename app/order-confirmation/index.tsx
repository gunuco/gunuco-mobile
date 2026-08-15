import React, { useCallback } from 'react';
import { BackHandler, ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { peekOrderConfirmation } from '@/src/services/orderConfirmation';
import { GButton, GText, Header, OrderConfirmationCard, EmptyState } from '@/src/components';
import { orderHref } from '@/src/utils/navigation';

export default function OrderConfirmationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const confirmation = peekOrderConfirmation();
  const orderId = confirmation?.orderId;

  const goHome = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        goHome();
        return true;
      });
      return () => sub.remove();
    }, [goHome]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Order confirmed" showBack onBackPress={goHome} />
      {confirmation ? (
        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing['3xl'],
            gap: theme.spacing.md,
          }}
        >
          <OrderConfirmationCard confirmation={confirmation} />
          {orderId ? (
            <GButton
              title="View Order"
              size="lg"
              fullWidth
              onPress={() => router.replace(orderHref(orderId))}
              accessibilityLabel="View Order"
            />
          ) : (
            <GText variant="caption" color="secondary">
              Order details will be available in Orders.
            </GText>
          )}
          <GButton
            title="Continue Shopping"
            size="lg"
            fullWidth
            onPress={goHome}
            accessibilityLabel="Continue Shopping"
          />
        </ScrollView>
      ) : (
        <EmptyState
          title="Order confirmation"
          description="This confirmation is no longer available. Continue shopping from Home."
          actionLabel="Continue Shopping"
          onAction={goHome}
        />
      )}
    </View>
  );
}
