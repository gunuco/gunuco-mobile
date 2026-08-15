import React, { useCallback, useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import {
  useGetCancellationEligibilityQuery,
  useGetOrderQuery,
  useGetOrderRiderQuery,
  useGetReviewableItemsQuery,
  useLazyGetOrderInvoiceQuery,
  useReorderOrderMutation,
} from '@/src/store';
import { openInvoiceUrl, startPhoneCall } from '@/src/services/orderActions';
import { setAuthIntent } from '@/src/services/authIntent';
import { createIdempotencyKey } from '@/src/utils/idempotency';
import { formatPaise } from '@/src/utils/money';
import { getErrorMessage, isNotFoundError } from '@/src/utils/errors';
import {
  orderCancelHref,
  orderChatHref,
  orderComplaintHref,
  orderHref,
  ordersHref,
  orderTrackingHref,
  writeReviewHref,
} from '@/src/utils/navigation';
import {
  CartSummary,
  EmptyState,
  ErrorState,
  GButton,
  GCard,
  GText,
  Header,
  OrderItemCard,
  OrderListSkeleton,
  OrderTimeline,
} from '@/src/components';

export default function OrderDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ id?: string }>();
  const orderId = typeof params.id === 'string' ? params.id : '';
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const reorderKeyRef = useRef<string | null>(null);
  const [reorderOrder, reorderState] = useReorderOrderMutation();
  const [loadInvoice, invoiceState] = useLazyGetOrderInvoiceQuery();

  const orderQuery = useGetOrderQuery(orderId, {
    skip: !isAuthenticated || !orderId,
    refetchOnFocus: true,
  });
  const order = orderQuery.data;
  const eligibilityQuery = useGetCancellationEligibilityQuery(orderId, {
    skip: !isAuthenticated || !orderId || order?.canCancel === false,
  });
  const reviewableQuery = useGetReviewableItemsQuery(orderId, {
    skip: !isAuthenticated || !orderId,
  });
  const riderQuery = useGetOrderRiderQuery(orderId, {
    skip: !isAuthenticated || !orderId || orderQuery.data?.callAvailable !== true,
  });

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ordersHref());
  }, [router]);

  const canCancel = eligibilityQuery.data?.allowed === true;
  const reviewable = reviewableQuery.data?.items ?? [];

  const onReorder = async () => {
    if (!order || order.canReorder !== true || reorderState.isLoading) {
      return;
    }
    if (!reorderKeyRef.current) {
      reorderKeyRef.current = createIdempotencyKey();
    }
    setActionMessage(null);
    try {
      const result = await reorderOrder({
        orderId: order.id,
        idempotencyKey: reorderKeyRef.current,
      }).unwrap();
      reorderKeyRef.current = null;
      if (!result.cartUpdated) {
        setActionMessage(result.message ?? 'These items could not be added to your cart.');
        return;
      }
      router.push('/(tabs)/cart');
    } catch (error) {
      setActionMessage(getErrorMessage(error));
    }
  };

  const onCall = async () => {
    const number = riderQuery.data?.callNumber;
    if (order?.callAvailable !== true || riderQuery.data?.callAllowed !== true || !number) {
      setActionMessage('Calling the rider is not available right now.');
      return;
    }
    try {
      await startPhoneCall(number);
    } catch {
      setActionMessage('Calling the rider is not available right now.');
    }
  };

  const onInvoice = async () => {
    if (!order || order.invoiceAvailable !== true || invoiceState.isFetching) {
      return;
    }
    setActionMessage(null);
    try {
      const invoice = await loadInvoice(order.id).unwrap();
      if (invoice.generating) {
        setActionMessage(invoice.message ?? 'The invoice is not available yet.');
        return;
      }
      if (!invoice.available || !invoice.url) {
        setActionMessage(invoice.message ?? 'The invoice is not available yet.');
        return;
      }
      await openInvoiceUrl(invoice.url);
    } catch (error) {
      setActionMessage(getErrorMessage(error, 'The invoice is not available yet.'));
    }
  };

  if (!orderId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Order" showBack onBackPress={goBack} />
        <EmptyState title="Order not found" description="This order is not available." />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Order" showBack onBackPress={goBack} />
        <EmptyState
          title="Sign in to see this order"
          actionLabel="Sign in with phone"
          onAction={() => {
            setAuthIntent({ returnTo: String(orderHref(orderId)) });
            router.push('/(auth)/phone');
          }}
        />
      </View>
    );
  }

  if (orderQuery.isError || (orderQuery.isSuccess && !order)) {
    const status =
      orderQuery.error && typeof orderQuery.error === 'object' && 'status' in orderQuery.error
        ? orderQuery.error.status
        : undefined;
    const notFound = isNotFoundError(orderQuery.error) || status === 403 || !order;
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Order" showBack onBackPress={goBack} />
        <ErrorState
          title={notFound ? 'Order not found' : 'Unable to load order'}
          message={notFound ? 'Order not found' : getErrorMessage(orderQuery.error)}
          onRetry={() => void orderQuery.refetch()}
        />
      </View>
    );
  }

  if (orderQuery.isLoading || !order) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Order" showBack onBackPress={goBack} />
        <OrderListSkeleton />
      </View>
    );
  }

  const location =
    order.fulfilment === 'PICKUP'
      ? [order.pickupName, order.pickupAddress].filter(Boolean).join('\n')
      : (order.addressSummary ?? order.locationLabel);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header
        title={order.orderNumber ? `Order #${order.orderNumber}` : 'Order'}
        showBack
        onBackPress={goBack}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={orderQuery.isFetching && !orderQuery.isLoading}
            onRefresh={() => void orderQuery.refetch()}
            tintColor={theme.colors.brand.primary}
            colors={[theme.colors.brand.primary]}
          />
        }
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing['3xl'],
          gap: theme.spacing.md,
        }}
      >
        <GCard style={{ gap: theme.spacing.xs }}>
          <GText variant="titleSm" accessibilityLabel={`Status ${order.statusLabel}`}>
            {order.statusLabel}
          </GText>
          {order.placedAtLabel ? (
            <GText variant="caption" color="secondary">
              {order.placedAtLabel}
            </GText>
          ) : null}
          {order.paymentStatus ? (
            <GText variant="caption" color="secondary">
              Payment {order.paymentStatus}
              {order.paymentMethod ? ` · ${order.paymentMethod}` : ''}
            </GText>
          ) : null}
        </GCard>

        <OrderTimeline events={order.timeline} />

        {order.items.map((item) => {
          const reviewableItem = reviewable.find((entry) => entry.orderItemId === item.id);
          return (
            <OrderItemCard
              key={item.id}
              item={item}
              onWriteReview={
                reviewableItem
                  ? () =>
                      router.push(
                        writeReviewHref(reviewableItem.orderItemId, reviewableItem.productId),
                      )
                  : undefined
              }
            />
          );
        })}

        <CartSummary totals={order.totals} />

        <GCard style={{ gap: theme.spacing.xs }}>
          <GText variant="label">{order.fulfilmentLabel ?? 'Fulfilment'}</GText>
          {location ? <GText variant="bodyMd">{location}</GText> : null}
          {order.fulfilment === 'PICKUP' && order.pickupInstructions ? (
            <GText variant="caption" color="secondary">
              {order.pickupInstructions}
            </GText>
          ) : null}
          {order.scheduleLabel ? (
            <GText variant="bodyMd" color="secondary">
              {order.scheduleLabel}
            </GText>
          ) : null}
        </GCard>

        {typeof order.refundPaise === 'number' ? (
          <GCard style={{ gap: theme.spacing.xs }}>
            <GText variant="label">Refund</GText>
            <GText variant="bodyMd">
              {formatPaise(order.refundPaise)}
              {order.refundStatus ? ` · ${order.refundStatus}` : ''}
            </GText>
          </GCard>
        ) : null}

        {actionMessage ? (
          <GText variant="bodySm" color="danger">
            {actionMessage}
          </GText>
        ) : null}

        {order.trackingAvailable === true ? (
          <GButton
            title="Track Order"
            fullWidth
            onPress={() => router.push(orderTrackingHref(order.id))}
            accessibilityLabel="Track Order"
          />
        ) : null}
        {order.chatAvailable === true ? (
          <GButton
            title="Chat with Rider"
            variant="secondary"
            fullWidth
            onPress={() => router.push(orderChatHref(order.id))}
            accessibilityLabel="Chat with Rider"
          />
        ) : null}
        {order.callAvailable === true ? (
          <GButton
            title="Call Rider"
            variant="secondary"
            fullWidth
            onPress={() => {
              void onCall();
            }}
            accessibilityLabel="Call Rider"
          />
        ) : null}
        {canCancel ? (
          <GButton
            title="Cancel Order"
            variant="danger"
            fullWidth
            onPress={() => router.push(orderCancelHref(order.id))}
            accessibilityLabel="Cancel Order"
          />
        ) : eligibilityQuery.data && eligibilityQuery.data.allowed === false ? (
          <GText variant="caption" color="secondary">
            {eligibilityQuery.data.message ?? 'Cancellation is no longer available.'}
          </GText>
        ) : null}
        {order.canReorder === true ? (
          <GButton
            title={reorderState.isLoading ? 'Adding to cart...' : 'Reorder'}
            fullWidth
            loading={reorderState.isLoading}
            onPress={() => {
              void onReorder();
            }}
            accessibilityLabel="Reorder"
          />
        ) : null}
        {order.invoiceAvailable === true ? (
          <GButton
            title="Download Invoice"
            variant="secondary"
            fullWidth
            loading={invoiceState.isFetching}
            onPress={() => {
              void onInvoice();
            }}
            accessibilityLabel="Download Invoice"
          />
        ) : null}
        {order.complaintAllowed === true ? (
          <GButton
            title="Complaint / Return"
            variant="tertiary"
            fullWidth
            onPress={() => router.push(orderComplaintHref(order.id))}
            accessibilityLabel="Complaint / Return"
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
