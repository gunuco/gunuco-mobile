import React, { useCallback, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '@/src/providers';
import { useGetProductQuery, useGetProductReviewsQuery } from '@/src/store';
import { getErrorMessage } from '@/src/utils/errors';
import type { ProductReview } from '@/src/types/review';
import {
  EmptyState,
  ErrorState,
  GLoader,
  GText,
  Header,
  RatingView,
  ReviewCard,
} from '@/src/components';

export default function ProductReviewsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const productId = typeof params.id === 'string' ? params.id : '';
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const productQuery = useGetProductQuery(productId, { skip: !productId });
  const reviewsQuery = useGetProductReviewsQuery({ productId, page }, { skip: !productId });

  const reviews = reviewsQuery.data?.items ?? [];
  const ratingAverage =
    reviewsQuery.data?.ratingAverage ?? productQuery.data?.ratingAverage ?? null;
  const ratingCount = reviewsQuery.data?.ratingCount ?? productQuery.data?.ratingCount ?? null;

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }, [router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (page !== 1) {
        setPage(1);
      }
      await reviewsQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [page, reviewsQuery]);

  const onEndReached = useCallback(() => {
    if (!reviewsQuery.data?.hasMore || reviewsQuery.isFetching) {
      return;
    }
    setPage(page + 1);
  }, [page, reviewsQuery.data?.hasMore, reviewsQuery.isFetching]);

  const renderItem = useCallback(
    ({ item }: { item: ProductReview }) => (
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md }}>
        <ReviewCard review={item} />
      </View>
    ),
    [theme.spacing.lg, theme.spacing.md],
  );

  const header = (
    <View
      style={{
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
        gap: theme.spacing.sm,
      }}
    >
      <GText variant="titleMd">{productQuery.data?.name ?? 'Reviews'}</GText>
      {typeof ratingAverage === 'number' ? (
        <RatingView value={ratingAverage} count={ratingCount} size="md" />
      ) : (
        <GText variant="bodySm" color="secondary">
          Reviews appear here after they are approved.
        </GText>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Reviews" showBack onBackPress={goBack} />

      {!productId ? (
        <EmptyState
          title="Product not found"
          description="This reviews link is missing a product."
          actionLabel="Go back"
          onAction={goBack}
        />
      ) : reviewsQuery.isLoading && !reviewsQuery.data ? (
        <View style={{ padding: theme.spacing.lg }}>
          {header}
          <GLoader />
        </View>
      ) : reviewsQuery.isError && reviews.length === 0 ? (
        <ErrorState
          message={getErrorMessage(reviewsQuery.error)}
          onRetry={() => {
            void reviewsQuery.refetch();
          }}
        />
      ) : (
        <FlashList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={header}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <EmptyState
              title="No reviews yet"
              description="Approved customer reviews will appear here."
            />
          }
          ListFooterComponent={
            reviewsQuery.isFetching && page > 1 ? (
              <View style={{ paddingVertical: theme.spacing.lg }}>
                <GLoader />
              </View>
            ) : (
              <View style={{ height: theme.spacing['3xl'] }} />
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                void onRefresh();
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
