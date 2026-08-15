import React, { useCallback, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from '@/src/store';
import { setAuthIntent } from '@/src/services/authIntent';
import { getErrorMessage } from '@/src/utils/errors';
import { notificationDestinationHref, notificationsHref } from '@/src/utils/navigation';
import type { CustomerNotification, PushPermissionState } from '@/src/types/notification';
import {
  EmptyState,
  ErrorState,
  Header,
  NotificationItem,
  NotificationPermissionCard,
  OrderListSkeleton,
} from '@/src/components';
import {
  getPushPermissionState,
  registerPushTokenIfAllowed,
  requestPushPermission,
} from '@/src/services/pushNotifications';

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [permission, setPermission] = useState<PushPermissionState | null>(null);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const query = useGetNotificationsQuery({ page }, { skip: !isAuthenticated });
  const refetch = query.refetch;
  const [markRead] = useMarkNotificationReadMutation();

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      void getPushPermissionState().then(setPermission);
      if (isAuthenticated) {
        void refetch();
      }
    }, [isAuthenticated, refetch]),
  );

  const onOpen = async (item: CustomerNotification) => {
    if (!item.read) {
      try {
        await markRead(item.id).unwrap();
      } catch {
        // Navigation still proceeds; read state retries on next refresh.
      }
    }
    if (item.deepLink) {
      router.push(notificationDestinationHref(item.deepLink));
    }
  };

  const onAllowNotifications = async () => {
    setPermissionLoading(true);
    try {
      const next = await requestPushPermission();
      setPermission(next);
      if (next === 'granted') {
        await registerPushTokenIfAllowed();
      }
    } finally {
      setPermissionLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Notifications" showBack onBackPress={goBack} />
        <EmptyState
          title="Sign in to see notifications"
          description="Your order and support updates appear here after you sign in."
          actionLabel="Sign in with phone"
          onAction={() => {
            setAuthIntent({ returnTo: String(notificationsHref()) });
            router.push('/(auth)/phone');
          }}
        />
      </View>
    );
  }

  const items = query.data?.items ?? [];
  const showPermissionCard = permission === 'not_requested';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Notifications" showBack onBackPress={goBack} />
      {query.isError && items.length === 0 ? (
        <ErrorState
          title="Unable to load notifications"
          message={getErrorMessage(query.error, 'Unable to load notifications.')}
          onRetry={() => void query.refetch()}
        />
      ) : query.isLoading && items.length === 0 ? (
        <OrderListSkeleton />
      ) : items.length === 0 && !query.isFetching ? (
        <View style={{ flex: 1, padding: theme.spacing.lg, gap: theme.spacing.md }}>
          {showPermissionCard ? (
            <NotificationPermissionCard
              onAllow={() => {
                void onAllowNotifications();
              }}
              loading={permissionLoading}
            />
          ) : null}
          <EmptyState
            title="No notifications yet"
            description="Order and support updates will appear here."
          />
        </View>
      ) : (
        <FlashList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md }}>
              <NotificationItem
                notification={item}
                onPress={() => {
                  void onOpen(item);
                }}
              />
            </View>
          )}
          ListHeaderComponent={
            showPermissionCard ? (
              <View style={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.sm }}>
                <NotificationPermissionCard
                  onAllow={() => {
                    void onAllowNotifications();
                  }}
                  loading={permissionLoading}
                />
              </View>
            ) : null
          }
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
