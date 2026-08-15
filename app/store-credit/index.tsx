import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useGetStoreCreditQuery } from '@/src/store';
import { setAuthIntent } from '@/src/services/authIntent';
import { formatPaise } from '@/src/utils/money';
import { getErrorMessage } from '@/src/utils/errors';
import { storeCreditHref } from '@/src/utils/navigation';
import { EmptyState, ErrorState, GCard, GText, Header, OrderListSkeleton } from '@/src/components';

export default function StoreCreditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const query = useGetStoreCreditQuery(undefined, { skip: !isAuthenticated });
  const refetch = query.refetch;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/profile');
  };

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        void refetch();
      }
    }, [isAuthenticated, refetch]),
  );

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Store Credit" showBack onBackPress={goBack} />
        <EmptyState
          title="Sign in to see store credit"
          actionLabel="Sign in with phone"
          onAction={() => {
            setAuthIntent({ returnTo: String(storeCreditHref()) });
            router.push('/(auth)/phone');
          }}
        />
      </View>
    );
  }

  if (query.isError && !query.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Store Credit" showBack onBackPress={goBack} />
        <ErrorState
          message={getErrorMessage(query.error, 'Unable to load store credit.')}
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  if (query.isLoading && !query.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Store Credit" showBack onBackPress={goBack} />
        <OrderListSkeleton count={3} />
      </View>
    );
  }

  const history = query.data?.history ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Store Credit" showBack onBackPress={goBack} />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing['3xl'],
          gap: theme.spacing.md,
        }}
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching}
            onRefresh={() => void refetch()}
            tintColor={theme.colors.brand.primary}
            colors={[theme.colors.brand.primary]}
          />
        }
      >
        <GCard style={{ gap: theme.spacing.sm }}>
          <GText variant="caption" color="secondary">
            Available balance
          </GText>
          <GText variant="titleLg">{formatPaise(query.data?.balancePaise ?? 0)}</GText>
          <GText variant="caption" color="secondary">
            Store credit is applied at checkout when available.
          </GText>
        </GCard>
        {history.length === 0 ? (
          <EmptyState title="No ledger entries yet" />
        ) : (
          history.map((entry, index) => (
            <GCard key={entry.id ?? `credit-${index}`} style={{ gap: theme.spacing.xs }}>
              <GText variant="bodyMd">{entry.label ?? 'Store credit'}</GText>
              {typeof entry.amountPaise === 'number' ? (
                <GText variant="label">{formatPaise(entry.amountPaise)}</GText>
              ) : null}
              {entry.createdAtLabel ? (
                <GText variant="caption" color="secondary">
                  {entry.createdAtLabel}
                </GText>
              ) : null}
            </GCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}
