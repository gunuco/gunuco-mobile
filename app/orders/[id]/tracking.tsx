import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useGetOrderRiderQuery, useGetOrderTrackingQuery } from '@/src/store';
import { startPhoneCall } from '@/src/services/orderActions';
import { getErrorMessage } from '@/src/utils/errors';
import { orderChatHref, ordersHref } from '@/src/utils/navigation';
import {
  EmptyState,
  ErrorState,
  GText,
  Header,
  RiderInfo,
  RiderMap,
  TrackingStatus,
} from '@/src/components';

const TRACKING_POLL_MS = 15000;

export default function OrderTrackingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [focused, setFocused] = useState(false);
  const params = useLocalSearchParams<{ id?: string }>();
  const orderId = typeof params.id === 'string' ? params.id : '';
  const [callMessage, setCallMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  const trackingQuery = useGetOrderTrackingQuery(orderId, {
    skip: !orderId || !focused,
    pollingInterval: 0,
    refetchOnFocus: true,
  });
  const tracking = trackingQuery.data;
  const trackingComplete =
    tracking?.delivered === true || tracking?.cancelled === true || tracking?.available === false;
  useGetOrderTrackingQuery(orderId, {
    skip: !orderId || !focused || !tracking || trackingComplete,
    pollingInterval: TRACKING_POLL_MS,
  });
  const riderQuery = useGetOrderRiderQuery(orderId, {
    skip: !orderId || !focused,
    refetchOnFocus: true,
  });

  const rider = riderQuery.data;

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ordersHref());
  }, [router]);

  const onCall = async () => {
    setCallMessage(null);
    if (rider?.callAllowed !== true || !rider.callNumber) {
      setCallMessage('Calling the rider is not available right now.');
      return;
    }
    try {
      await startPhoneCall(rider.callNumber);
    } catch {
      setCallMessage('Calling the rider is not available right now.');
    }
  };

  if (!orderId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Tracking" showBack onBackPress={goBack} />
        <EmptyState title="Order not found" />
      </View>
    );
  }

  if (trackingQuery.isError && !tracking) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Tracking" showBack onBackPress={goBack} />
        <ErrorState
          title="Live location is temporarily unavailable"
          message={getErrorMessage(trackingQuery.error)}
          onRetry={() => void trackingQuery.refetch()}
        />
      </View>
    );
  }

  if (trackingQuery.isLoading && !tracking) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Tracking" showBack onBackPress={goBack} />
        <GText variant="bodyMd" color="secondary" style={{ padding: theme.spacing.lg }}>
          Loading live tracking.
        </GText>
      </View>
    );
  }

  if (
    !tracking ||
    tracking.available === false ||
    tracking.delivered === true ||
    tracking.cancelled === true
  ) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Tracking" showBack onBackPress={goBack} />
        <EmptyState
          title={
            tracking?.delivered
              ? 'This order has been delivered'
              : tracking?.cancelled
                ? 'This order was cancelled'
                : 'Tracking is no longer available'
          }
          description="You can still view the order details."
          actionLabel="Back to order"
          onAction={goBack}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Tracking" showBack onBackPress={goBack} />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing['3xl'],
          gap: theme.spacing.md,
        }}
      >
        <RiderMap tracking={tracking} />
        <TrackingStatus tracking={tracking} />
        {riderQuery.isError ? (
          <GText variant="bodySm" color="secondary">
            Rider information is temporarily unavailable.
          </GText>
        ) : rider ? (
          <RiderInfo
            rider={rider}
            onChat={
              rider.chatAllowed === true ? () => router.push(orderChatHref(orderId)) : undefined
            }
            onCall={rider.callAllowed === true ? () => void onCall() : undefined}
          />
        ) : null}
        {callMessage ? (
          <GText variant="bodySm" color="danger">
            {callMessage}
          </GText>
        ) : null}
      </ScrollView>
    </View>
  );
}
