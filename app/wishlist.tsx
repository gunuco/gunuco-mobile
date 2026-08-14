import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { store, useAddCartItemMutation, useGetWishlistQuery } from '@/src/store';
import { setAuthIntent } from '@/src/services/authIntent';
import { getErrorMessage } from '@/src/utils/errors';
import { productHref } from '@/src/utils/navigation';
import { readCachedWishlistCartSources, resolveWishlistCartAdd } from '@/src/utils/wishlist';
import type { ProductSummary } from '@/src/types';
import {
  EmptyState,
  ErrorState,
  GText,
  Header,
  ProductGridList,
  ProductListSkeleton,
} from '@/src/components';

export default function WishlistScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    tone: 'success' | 'danger';
    text: string;
  } | null>(null);
  const [addCartItem, addCartState] = useAddCartItemMutation();
  const wishlistQuery = useGetWishlistQuery(undefined, { skip: !isAuthenticated });

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/profile');
  }, [router]);

  const onSignIn = useCallback(() => {
    setAuthIntent({ returnTo: '/wishlist' });
    router.push('/(auth)/phone');
  }, [router]);

  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    setRefreshing(true);
    try {
      await wishlistQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [isAuthenticated, wishlistQuery]);

  const onProductPress = useCallback(
    (product: ProductSummary) => {
      router.push(productHref(product.id));
    },
    [router],
  );

  const onAddPress = useCallback(
    async (product: ProductSummary) => {
      if (addCartState.isLoading || product.isAvailable === false) {
        return;
      }
      setActionMessage(null);

      const decision = resolveWishlistCartAdd({
        product,
        ...readCachedWishlistCartSources(store.getState(), product.id),
      });

      if (decision.action === 'configure') {
        router.push(productHref(product.id));
        return;
      }

      try {
        await addCartItem(decision.payload).unwrap();
        setActionMessage({ tone: 'success', text: 'Added to cart.' });
      } catch (error) {
        setActionMessage({
          tone: 'danger',
          text: getErrorMessage(error),
        });
      }
    },
    [addCartItem, addCartState.isLoading, router],
  );

  const products = wishlistQuery.data?.items ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Wishlist" showBack onBackPress={goBack} />

      {actionMessage ? (
        <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.sm }}>
          <GText variant="bodySm" color={actionMessage.tone === 'success' ? 'success' : 'danger'}>
            {actionMessage.text}
          </GText>
        </View>
      ) : null}

      {!isAuthenticated ? (
        <EmptyState
          title="Sign in to see your wishlist"
          description="Save products here to find them easily later."
          actionLabel="Sign in with phone"
          onAction={onSignIn}
        />
      ) : wishlistQuery.isLoading && !wishlistQuery.data ? (
        <ProductListSkeleton />
      ) : wishlistQuery.isError && products.length === 0 ? (
        <ErrorState
          message={getErrorMessage(wishlistQuery.error)}
          onRetry={() => {
            void wishlistQuery.refetch();
          }}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save products here to find them easily later."
          iconName="heart-outline"
          actionLabel="Continue shopping"
          onAction={() => router.replace('/(tabs)')}
        />
      ) : (
        <ProductGridList
          products={products}
          refreshing={refreshing}
          errorMessage={null}
          emptyTitle="Your wishlist is empty"
          emptyDescription="Save products here to find them easily later."
          showWishlist
          showAddButton
          onRefresh={() => {
            void onRefresh();
          }}
          onProductPress={onProductPress}
          onAddPress={(product) => {
            void onAddPress(product);
          }}
        />
      )}
    </View>
  );
}
