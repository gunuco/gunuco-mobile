import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useGetOrdersQuery, useReorderOrderMutation } from '@/src/store';
import { setAuthIntent } from '@/src/services/authIntent';
import { createIdempotencyKey } from '@/src/utils/idempotency';
import { getErrorMessage } from '@/src/utils/errors';
import {
  cartHref,
  orderHref,
  orderTrackingHref,
  ordersHref,
  reorderHref,
} from '@/src/utils/navigation';
import type { OrderListItem, OrderStatusGroup } from '@/src/types/order';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { GSegmentedControl } from '../ui/GSegmentedControl';
import { GText } from '../ui/GText';
import { Header } from '../layout/Header';
import { HeaderActions } from '../layout/HeaderActions';
import { OrderListSkeleton } from '../layout/OrderListSkeleton';
import { OrderCard } from './OrderCard';

const DEFAULT_TABS: { value: OrderStatusGroup; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
];

const EMPTY: Record<OrderStatusGroup, { title: string; description: string }> = {
  active: {
    title: 'No active orders',
    description: 'Orders being prepared or delivered will appear here.',
  },
  past: { title: 'No past orders', description: 'Completed orders will appear here.' },
  cancelled: { title: 'No cancelled orders', description: 'Cancelled orders will appear here.' },
};

export type OrdersListViewProps = {
  title: string;
  showBack?: boolean;
  showHeaderActions?: boolean;
  defaultGroup?: OrderStatusGroup;
  groups?: OrderStatusGroup[];
  emptyPast?: { title: string; description: string };
  authReturnTo?: string;
};

export function OrdersListView({
  title,
  showBack = false,
  showHeaderActions = false,
  defaultGroup = 'active',
  groups,
  emptyPast,
  authReturnTo,
}: OrdersListViewProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const visibleGroups = groups ?? DEFAULT_TABS.map((tab) => tab.value);
  const tabs = DEFAULT_TABS.filter((tab) => visibleGroups.includes(tab.value));
  const [group, setGroup] = useState<OrderStatusGroup>(defaultGroup);
  const [page, setPage] = useState(1);
  const [reorderId, setReorderId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const reorderKeyRef = useRef<string | null>(null);
  const [reorderOrder] = useReorderOrderMutation();

  const query = useGetOrdersQuery({ statusGroup: group, page }, { skip: !isAuthenticated });

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }, [router]);

  const onChangeGroup = (next: OrderStatusGroup) => {
    setGroup(next);
    setPage(1);
    setActionMessage(null);
  };

  const onReorder = useCallback(
    async (order: OrderListItem) => {
      if (reorderId || order.canReorder !== true) {
        return;
      }
      if (!reorderKeyRef.current) {
        reorderKeyRef.current = createIdempotencyKey();
      }
      setReorderId(order.id);
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
        router.push(cartHref());
      } catch (error) {
        setActionMessage(getErrorMessage(error));
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
          group={group}
          onPress={() => router.push(orderHref(item.id))}
          onTrack={
            item.trackingAvailable === true
              ? () => router.push(orderTrackingHref(item.id))
              : undefined
          }
          onReorder={item.canReorder === true ? () => void onReorder(item) : undefined}
          reorderLoading={reorderId === item.id}
        />
      </View>
    ),
    [group, onReorder, reorderId, router, theme.spacing.lg, theme.spacing.md],
  );

  const emptyCopy = group === 'past' && emptyPast ? emptyPast : EMPTY[group];
  const items = query.data?.items ?? [];
  const showTabs = tabs.length > 1;
  const header = useMemo(
    () => (
      <View
        style={{
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.sm,
          gap: theme.spacing.md,
        }}
      >
        {showTabs ? (
          <GSegmentedControl
            options={tabs}
            value={group}
            onChange={onChangeGroup}
            accessibilityLabel="Order status"
          />
        ) : null}
        {actionMessage ? (
          <GText variant="bodySm" color="danger">
            {actionMessage}
          </GText>
        ) : null}
      </View>
    ),
    [actionMessage, group, showTabs, tabs, theme.spacing.lg, theme.spacing.md, theme.spacing.sm],
  );

  const screenHeader = (
    <Header
      title={title}
      showBack={showBack}
      onBackPress={showBack ? goBack : undefined}
      bordered={false}
      rightSlot={showHeaderActions ? <HeaderActions showCart showSearch /> : undefined}
    />
  );

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        {screenHeader}
        <EmptyState
          title="Sign in to see orders"
          description="Orders are available after you sign in."
          actionLabel="Sign in with phone"
          onAction={() => {
            setAuthIntent({
              returnTo:
                authReturnTo ??
                (defaultGroup === 'past' ? String(reorderHref()) : String(ordersHref())),
            });
            router.push('/(auth)/phone');
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      {screenHeader}
      {query.isError && items.length === 0 ? (
        <View style={{ flex: 1 }}>
          {header}
          <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
        </View>
      ) : query.isLoading && items.length === 0 ? (
        <View style={{ flex: 1 }}>
          {header}
          <OrderListSkeleton />
        </View>
      ) : items.length === 0 && !query.isFetching ? (
        <View style={{ flex: 1 }}>
          {header}
          <EmptyState
            title={emptyCopy.title}
            description={emptyCopy.description}
            iconName="receipt-outline"
          />
        </View>
      ) : (
        <FlashList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={header}
          onEndReached={() => {
            if (query.data?.hasMore && !query.isFetching) {
              setPage((current) => current + 1);
            }
          }}
          onEndReachedThreshold={0.4}
          contentContainerStyle={{ paddingBottom: insets.bottom + theme.spacing['3xl'] }}
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching && page === 1 && items.length > 0}
              onRefresh={() => {
                setPage(1);
                void query.refetch();
              }}
              tintColor={theme.colors.brand.primary}
              colors={[theme.colors.brand.primary]}
            />
          }
        />
      )}
    </View>
  );
}
