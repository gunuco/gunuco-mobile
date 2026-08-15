import React, { useCallback, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useGetSupportTicketsQuery } from '@/src/store';
import { setAuthIntent } from '@/src/services/authIntent';
import { getErrorMessage } from '@/src/utils/errors';
import { supportCreateHref, supportHref, supportTicketHref } from '@/src/utils/navigation';
import type { SupportTicketSummary } from '@/src/types/support';
import {
  EmptyState,
  ErrorState,
  GButton,
  Header,
  OrderListSkeleton,
  SupportTicketCard,
} from '@/src/components';

export default function SupportHubScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const query = useGetSupportTicketsQuery({ page }, { skip: !isAuthenticated });
  const refetch = query.refetch;

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/profile');
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        void refetch();
      }
    }, [isAuthenticated, refetch]),
  );

  const goCreate = () => {
    router.push(supportCreateHref());
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Support" showBack onBackPress={goBack} />
        <EmptyState
          title="Sign in for support"
          description="Support tickets are available after you sign in."
          actionLabel="Sign in with phone"
          onAction={() => {
            setAuthIntent({ returnTo: String(supportHref()) });
            router.push('/(auth)/phone');
          }}
        />
      </View>
    );
  }

  const items = query.data?.items ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header
        title="Support"
        showBack
        onBackPress={goBack}
        rightSlot={
          <GButton
            title="New"
            size="sm"
            variant="ghost"
            onPress={goCreate}
            accessibilityLabel="Create support ticket"
          />
        }
      />
      {query.isError && items.length === 0 ? (
        <ErrorState
          title="Unable to load tickets"
          message={getErrorMessage(query.error, 'Unable to load your support tickets.')}
          onRetry={() => void refetch()}
        />
      ) : query.isLoading && items.length === 0 ? (
        <OrderListSkeleton />
      ) : items.length === 0 && !query.isFetching ? (
        <EmptyState
          title="No support tickets yet"
          description="Create a ticket and GUNUCO support will reply here."
          actionLabel="Create Support Ticket"
          onAction={goCreate}
        />
      ) : (
        <FlashList
          data={items}
          keyExtractor={(item: SupportTicketSummary) => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md }}>
              <SupportTicketCard
                ticket={item}
                onPress={() => router.push(supportTicketHref(item.id))}
              />
            </View>
          )}
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
                void refetch();
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
