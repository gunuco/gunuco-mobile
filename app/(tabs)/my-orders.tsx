import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useGetCartQuery, useGetOrdersQuery, useReorderOrderMutation } from '@/src/store';
import { setAuthIntent } from '@/src/services/authIntent';
import { createIdempotencyKey } from '@/src/utils/idempotency';
import { getErrorMessage } from '@/src/utils/errors';
import { cartHref, orderChatHref, orderHref } from '@/src/utils/navigation';
import { getCartBadgeCount } from '@/src/utils/cart';
import type { OrderListItem } from '@/src/types/order';
import {
  EmptyState,
  ErrorState,
  Header,
  GBadge,
  GIcon,
  GText,
  OrderListSkeleton,
  OrderCard,
} from '@/src/components';

function mergeAndSortOrders(past: OrderListItem[], cancelled: OrderListItem[]): OrderListItem[] {
  const merged = [...past, ...cancelled];
  merged.sort((a, b) => {
    const at = a.placedAt ? new Date(a.placedAt).getTime() : 0;
    const bt = b.placedAt ? new Date(b.placedAt).getTime() : 0;
    return bt - at;
  });
  return merged;
}

export default function MyOrdersTabScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  const [reorderId, setReorderId] = useState<string | null>(null);
  const reorderKeyRef = useRef<string | null>(null);
  const [reorderOrder] = useReorderOrderMutation();

  const [pastPage, setPastPage] = useState(1);
  const [cancelledPage, setCancelledPage] = useState(1);

  const pastQuery = useGetOrdersQuery({ statusGroup: 'past', page: pastPage }, { skip: !isAuthenticated });
  const cancelledQuery = useGetOrdersQuery(
    { statusGroup: 'cancelled', page: cancelledPage },
    { skip: !isAuthenticated },
  );

  const cartQuery = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const cartBadge = getCartBadgeCount(cartQuery.data);
  const listBottomPadding = insets.bottom + theme.spacing['3xl'] + (cartBadge > 0 ? 96 : 0);

  const items = useMemo(() => {
    const past = pastQuery.data?.items ?? [];
    const cancelled = cancelledQuery.data?.items ?? [];
    return mergeAndSortOrders(past, cancelled);
  }, [cancelledQuery.data?.items, pastQuery.data?.items]);

  const canLoadMore = (pastQuery.data?.hasMore ?? false) || (cancelledQuery.data?.hasMore ?? false);

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }, [router]);

  const onReorder = useCallback(
    async (order: OrderListItem) => {
      if (reorderId || order.canReorder !== true) {
        return;
      }
      if (!reorderKeyRef.current) {
        reorderKeyRef.current = createIdempotencyKey();
      }
      setReorderId(order.id);
      try {
        const result = await reorderOrder({
          orderId: order.id,
          idempotencyKey: reorderKeyRef.current,
        }).unwrap();
        reorderKeyRef.current = null;
        if (!result.cartUpdated) {
          return;
        }
        router.push(cartHref());
      } catch {
        // Keep UI minimal; existing flows already show errors globally.
      } finally {
        setReorderId(null);
      }
    },
    [reorderId, reorderOrder, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: OrderListItem }) => (
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md }}>
        <OrderCard
          order={item}
          group={item.statusGroup ?? 'past'}
          onPress={() => router.push(orderHref(item.id))}
          onTrack={item.trackingAvailable === true ? () => router.push(orderChatHref(item.id)) : undefined}
          onReorder={item.canReorder === true ? () => void onReorder(item) : undefined}
          reorderLoading={reorderId === item.id}
        />
      </View>
    ),
    [onReorder, reorderId, router, theme.spacing.lg, theme.spacing.md],
  );

  const showLoading = (pastQuery.isLoading && !pastQuery.data) || (cancelledQuery.isLoading && !cancelledQuery.data);

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Your Orders" showBack onBackPress={goBack} bordered={false} />
        <EmptyState
          title="Sign in to see orders"
          description="Orders are available after you sign in."
          actionLabel="Sign in with phone"
          onAction={() => {
            setAuthIntent({ returnTo: '/(tabs)/my-orders' });
            router.push('/(auth)/phone');
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Your Orders" showBack onBackPress={goBack} bordered={false} />

      {pastQuery.isError && (pastQuery.data?.items?.length ?? 0) === 0 ? (
        <View style={{ flex: 1, paddingTop: theme.spacing.lg }}>
          <ErrorState message={getErrorMessage(pastQuery.error)} onRetry={() => void pastQuery.refetch()} />
        </View>
      ) : null}
      {cancelledQuery.isError && (cancelledQuery.data?.items?.length ?? 0) === 0 ? (
        <View style={{ flex: 1, paddingTop: theme.spacing.lg }}>
          <ErrorState
            message={getErrorMessage(cancelledQuery.error)}
            onRetry={() => void cancelledQuery.refetch()}
          />
        </View>
      ) : null}

      {showLoading ? (
        <View style={{ flex: 1 }}>
          <OrderListSkeleton />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Your delivered and cancelled orders will appear here."
          iconName="receipt-outline"
        />
      ) : (
        <FlashList
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: listBottomPadding }}
          onEndReached={() => {
            if (!canLoadMore) {
              return;
            }
            if (pastQuery.data?.hasMore) {
              setPastPage((p) => p + 1);
              return;
            }
            if (cancelledQuery.data?.hasMore) {
              setCancelledPage((p) => p + 1);
            }
          }}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={pastQuery.isFetching || cancelledQuery.isFetching}
              tintColor={theme.colors.brand.primary}
              colors={[theme.colors.brand.primary]}
              onRefresh={() => {
                setPastPage(1);
                setCancelledPage(1);
                void pastQuery.refetch();
                void cancelledQuery.refetch();
              }}
            />
          }
        />
      )}

      {cartBadge > 0 ? (
        <View
          style={{
            position: 'absolute',
            left: theme.spacing.lg,
            right: theme.spacing.lg,
            bottom: insets.bottom,
            backgroundColor: theme.colors.bg.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.default,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderRadius: theme.radius.xl,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
            ...theme.shadows.md,
          }}
        >
          <View style={{ flex: 1 }}>
            <GText variant="bodySm" color="secondary">
              Unlock extra ₹50 OFF
            </GText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Cart, ${cartBadge} items`}
            onPress={() => router.push(cartHref())}
            style={{
              width: theme.dimensions.buttonHeight.lg,
              height: theme.dimensions.buttonHeight.lg,
              borderRadius: theme.radius.xl,
              borderWidth: 1,
              borderColor: theme.colors.border.default,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.bg.surfaceMuted,
            }}
          >
            <GIcon name="cart-outline" size="md" />
            <View style={{ position: 'absolute', top: 4, right: 4 }}>
              <GBadge label={String(cartBadge)} variant="danger" />
            </View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
