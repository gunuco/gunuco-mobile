import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
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
  GIcon,
  GImage,
  GModal,
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
  const [refundModalOpen, setRefundModalOpen] = useState(false);

  const refundSteps = useMemo(() => {
    const initiatedLabel = 'Refund initiated by GUNUCO';
    const processedLabel = 'Refund has been processed by your bank/ payment partner';
    const completedLabel = 'Refund completed';
    const completed =
      order?.refundStatus === 'processed' || order?.refundStatus === 'completed';

    return [
      { key: 'initiated', label: initiatedLabel, done: completed },
      { key: 'processed', label: processedLabel, done: completed },
      { key: 'completed', label: completedLabel, done: completed },
    ];
  }, [order?.refundStatus]);

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

  const isDelivered = order.presentationStatus === 'DELIVERED';
  const isCancelled = order.presentationStatus === 'CANCELLED';

  const subtotalPaise = order.totals.subtotalPaise ?? 0;
  const discountPaise = order.totals.discountPaise ?? 0;
  const storeCreditPaise = order.totals.storeCreditPaise ?? 0;
  const taxPaise = order.totals.taxPaise ?? 0;
  const deliveryFeePaise = order.totals.deliveryFeePaise ?? 0;

  const oldItemTotalPaise = subtotalPaise;
  const newItemTotalPaise = Math.max(0, subtotalPaise - discountPaise - storeCreditPaise);

  const oldTotalPaise = subtotalPaise + taxPaise + deliveryFeePaise;
  const newTotalPaise = order.totals.totalPaise ?? oldTotalPaise;

  const invoiceButtonLabel =
    order.refundPaise != null ? 'Download Invoice / Credit Note' : 'Download Invoice';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header
        title={order.orderNumber ? `Order #${order.orderNumber}` : 'Order'}
        showBack
        onBackPress={goBack}
        rightSlot={
          order.chatAvailable === true ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Get Help"
              onPress={() => router.push(orderChatHref(order.id))}
              hitSlop={8}
              style={{
                backgroundColor: theme.colors.bg.surfaceMuted,
                borderRadius: theme.radius.xl,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.xs,
              }}
            >
              <GIcon name="chatbubbles-outline" size="sm" color={theme.colors.brand.primary} />
              <GText variant="caption" color="brand">
                Get Help
              </GText>
            </Pressable>
          ) : undefined
        }
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
        {isDelivered || isCancelled ? (
          <>
            <View style={{ gap: theme.spacing.md }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: theme.radius.lg,
                    backgroundColor: isDelivered
                      ? theme.colors.semantic.success
                      : theme.colors.semantic.danger,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GIcon
                    name={isDelivered ? 'checkmark-circle' : 'close-circle'}
                    size="md"
                    color={theme.colors.text.inverse}
                  />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <GText variant="titleSm">{isDelivered ? 'Delivered' : 'Cancelled'}</GText>
                  <GText variant="caption" color="secondary">
                    {order.items.length} items in order
                  </GText>
                </View>
              </View>

              {isCancelled ? (
                <GText variant="bodySm" color="danger">
                  Unfortunately, your order could not be completed. If any amount was debited, it
                  will be refunded within 5–7 business days. Please try placing the order again!
                </GText>
              ) : null}
            </View>

            <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
              {order.items.map((item) => {
                const secondary = [
                  item.optionsSummary?.trim() ? item.optionsSummary.trim() : undefined,
                  `${item.quantity} unit`,
                ]
                  .filter(Boolean)
                  .join(' · ');
                const linePrice = item.lineTotalPaise ?? item.unitPricePaise;

                return (
                  <View
                    key={item.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: theme.spacing.md,
                      paddingVertical: theme.spacing.md,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border.default,
                    }}
                  >
                    <GImage
                      uri={item.imageUrl ?? null}
                      width={theme.dimensions.productImage.thumb}
                      height={theme.dimensions.productImage.thumb}
                      borderRadius={theme.radius.lg}
                      accessibilityLabel={item.name}
                    />
                    <View style={{ flex: 1, gap: 2 }}>
                      <GText variant="bodyMd" numberOfLines={2}>
                        {item.name}
                      </GText>
                      {secondary ? (
                        <GText variant="caption" color="secondary">
                          {secondary}
                        </GText>
                      ) : null}
                    </View>

                    {typeof linePrice === 'number' ? (
                      <GText variant="priceMd">{formatPaise(linePrice)}</GText>
                    ) : null}
                  </View>
                );
              })}
            </View>

            <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
              <GText variant="titleSm">Bill Summary</GText>

              <View style={{ gap: theme.spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <GText variant="bodyMd" color="secondary">
                    Item Total
                  </GText>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    {oldItemTotalPaise !== newItemTotalPaise ? (
                      <>
                        <GText
                          variant="caption"
                          color="secondary"
                          style={{ textDecorationLine: 'line-through' }}
                        >
                          {formatPaise(oldItemTotalPaise)}
                        </GText>
                        <GText variant="priceMd">{formatPaise(newItemTotalPaise)}</GText>
                      </>
                    ) : (
                      <GText variant="priceMd">{formatPaise(newItemTotalPaise)}</GText>
                    )}
                  </View>
                </View>

                {storeCreditPaise > 0 ? (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <GText variant="bodySm" color="success">
                      Store Credit Applied
                    </GText>
                    <GText variant="bodySm" color="success">
                      {formatPaise(storeCreditPaise)}
                    </GText>
                  </View>
                ) : null}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <GText variant="bodyMd" color="secondary">
                    Total Bill
                  </GText>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    {oldTotalPaise !== newTotalPaise ? (
                      <>
                        <GText
                          variant="caption"
                          color="secondary"
                          style={{ textDecorationLine: 'line-through' }}
                        >
                          {formatPaise(oldTotalPaise)}
                        </GText>
                        <GText variant="titleSm">{formatPaise(newTotalPaise)}</GText>
                      </>
                    ) : (
                      <GText variant="titleSm">{formatPaise(newTotalPaise)}</GText>
                    )}
                  </View>
                </View>
              </View>

              {order.invoiceAvailable === true ? (
                <GButton
                  title={invoiceButtonLabel}
                  variant="secondary"
                  loading={invoiceState.isFetching}
                  onPress={() => {
                    void onInvoice();
                  }}
                  accessibilityLabel={invoiceButtonLabel}
                />
              ) : null}
            </View>

            <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
              <GText variant="titleSm">Order Details</GText>

              <View style={{ gap: theme.spacing.xs }}>
                <GText variant="caption" color="secondary">
                  Order ID
                </GText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                  <GText variant="bodyMd">#{order.orderNumber ?? order.id}</GText>
                  <GIcon name="document-text-outline" size="sm" color={theme.colors.text.secondary} />
                </View>
              </View>

              {location ? (
                <View style={{ gap: theme.spacing.xs }}>
                  <GText variant="caption" color="secondary">
                    Delivery Address
                  </GText>
                  <GText variant="bodyMd">{location}</GText>
                </View>
              ) : null}

              {order.placedAtLabel ? (
                <View style={{ gap: theme.spacing.xs }}>
                  <GText variant="caption" color="secondary">
                    Order Placed at
                  </GText>
                  <GText variant="bodyMd">{order.placedAtLabel}</GText>
                </View>
              ) : null}

              {isDelivered ? (
                (() => {
                  const arrived =
                    order.timeline.find((e) => e.presentationStatus === 'DELIVERED' && e.atLabel)?.atLabel ??
                    order.placedAtLabel ??
                    undefined;
                  if (!arrived) {
                    return null;
                  }
                  return (
                    <View style={{ gap: theme.spacing.xs }}>
                      <GText variant="caption" color="secondary">
                        Order Arrived at
                      </GText>
                      <GText variant="bodyMd">{arrived}</GText>
                    </View>
                  );
                })()
              ) : null}
            </View>

            {isDelivered && typeof order.refundPaise === 'number' ? (
              <View style={{ marginTop: theme.spacing.md }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open refund status"
                  onPress={() => setRefundModalOpen(true)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <GCard style={{ gap: theme.spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <GText variant="titleSm">Refund Status</GText>
                      <GIcon name="chevron-forward" size="sm" color={theme.colors.text.secondary} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md, alignItems: 'center' }}>
                      <View style={{ gap: theme.spacing.xs }}>
                        <GText variant="caption" color="secondary">
                          Amount:
                        </GText>
                        <GText variant="titleSm" color="success">
                          {formatPaise(order.refundPaise)}
                        </GText>
                      </View>
                      <View
                        style={{
                          backgroundColor: theme.colors.bg.surfaceMuted,
                          borderRadius: theme.radius.pill,
                          paddingHorizontal: theme.spacing.sm,
                          paddingVertical: 4,
                        }}
                      >
                        <GText variant="caption" color="success">
                          {order.refundStatus === 'processed' ? 'COMPLETED' : 'IN PROGRESS'}
                        </GText>
                      </View>
                    </View>
                    <GText variant="caption" color="secondary">
                      To: UPI
                    </GText>
                    <GText variant="caption" color="secondary">
                      Initiated on: {order.placedAtLabel ?? '—'}
                    </GText>
                  </GCard>
                </Pressable>
              </View>
            ) : null}

            <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Need help with this order"
                onPress={() => router.push(orderChatHref(order.id))}
                style={({ pressed }) => ({
                  backgroundColor: theme.colors.bg.surfaceMuted,
                  borderRadius: theme.radius.xl,
                  padding: theme.spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: theme.radius.lg,
                    backgroundColor: theme.colors.brand.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GIcon name="chatbubbles-outline" size="sm" color={theme.colors.text.inverse} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <GText variant="label">Need help with this order?</GText>
                  <GText variant="caption" color="secondary">
                    Find your issue or reach out via chat
                  </GText>
                </View>
                <GIcon name="chevron-forward" size="sm" color={theme.colors.text.secondary} />
              </Pressable>
            </View>

            {order.canReorder === true ? (
              <GButton
                title={reorderState.isLoading ? 'Adding to cart...' : 'Order Again'}
                fullWidth
                loading={reorderState.isLoading}
                onPress={() => {
                  void onReorder();
                }}
                accessibilityLabel="Order Again"
              />
            ) : null}
          </>
        ) : (
          <>
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
                            writeReviewHref(
                              reviewableItem.orderItemId,
                              reviewableItem.productId,
                            ),
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
          </>
        )}
      </ScrollView>

      <GModal
        visible={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Refund Status"
      >
        <View style={{ gap: theme.spacing.md }}>
          <View style={{ gap: theme.spacing.xs }}>
            <GText variant="caption" color="secondary">
              Total Refund
            </GText>
            <GText variant="titleMd" color="success">
              {typeof order.refundPaise === 'number' ? formatPaise(order.refundPaise) : '—'}
            </GText>
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            {refundSteps.map((step) => (
              <View key={step.key} style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-start' }}>
                <GIcon
                  name={step.done ? 'checkmark-circle' : 'ellipse-outline'}
                  size="md"
                  color={step.done ? theme.colors.semantic.success : theme.colors.text.disabled}
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <GText variant="label">{step.label}</GText>
                  <GText variant="caption" color="secondary">
                    {step.done ? `Completed on ${order.placedAtLabel ?? '—'}` : 'Pending'}
                  </GText>
                </View>
              </View>
            ))}
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <GText variant="caption" color="secondary">
              Refund Reference Number (RRN)
            </GText>
            <View
              style={{
                borderRadius: theme.radius.lg,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.bg.surfaceMuted,
                gap: theme.spacing.sm,
              }}
            >
              <GText variant="bodyMd" style={{ fontWeight: '700' }}>
                416261396865
              </GText>
            </View>
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <GText variant="bodySm" color="secondary">
              What is RRN/ARN?
            </GText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <GIcon name="alert-circle-outline" size="sm" color={theme.colors.text.secondary} />
            <GText variant="bodySm" color="secondary">
              Facing issues with your refund
            </GText>
          </View>
        </View>
      </GModal>
    </View>
  );
}
