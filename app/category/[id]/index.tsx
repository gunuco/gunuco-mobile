import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/providers';
import { useGetCategoriesQuery } from '@/src/store';
import { findCategoryById } from '@/src/utils/categoryTree';
import { getErrorMessage } from '@/src/utils/errors';
import { categoryProductsHref } from '@/src/utils/navigation';
import type { CategoryNode } from '@/src/types';
import { CategoryCard, ErrorState, GImage, GText, Header, Skeleton } from '@/src/components';

export default function CategoryDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const categoryId = String(params.id ?? '');
  const [refreshing, setRefreshing] = useState(false);

  const { data, error, isLoading, isError, isFetching, refetch } = useGetCategoriesQuery();

  const category = useMemo(
    () => findCategoryById(data?.categories, categoryId),
    [data?.categories, categoryId],
  );

  const subcategories = useMemo(
    () => (category?.children ?? []).filter((child) => child.isActive !== false),
    [category?.children],
  );

  useEffect(() => {
    if (!category || isLoading || isFetching) {
      return;
    }
    if (subcategories.length === 0) {
      router.replace(categoryProductsHref(category.id));
    }
  }, [category, isFetching, isLoading, router, subcategories.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const openSubcategory = useCallback(
    (sub: CategoryNode) => {
      router.push(categoryProductsHref(sub.id));
    },
    [router],
  );

  const showSkeleton = (isLoading && !data) || (Boolean(category) && subcategories.length === 0);
  const showError = isError && !data;
  const unavailable = Boolean(data) && !category;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header
        title={category?.name ?? 'Category'}
        showBack
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/categories');
          }
        }}
      />

      {showSkeleton ? (
        <View style={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
          <Skeleton height={140} borderRadius={theme.radius.xl} />
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Skeleton width={120} height={140} borderRadius={theme.radius.lg} />
            <Skeleton width={120} height={140} borderRadius={theme.radius.lg} />
          </View>
        </View>
      ) : null}

      {showError ? (
        <ErrorState
          title="Could not load category"
          message={getErrorMessage(error, 'This category is unavailable right now.')}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {unavailable ? (
        <ErrorState
          title="Category unavailable"
          message="This category is not available right now."
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!showSkeleton && !showError && category && subcategories.length > 0 ? (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: theme.spacing['3xl'],
            gap: theme.spacing['2xl'],
          }}
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
        >
          <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.md }}>
            {category.imageUrl ? (
              <GImage
                uri={category.imageUrl}
                height={160}
                borderRadius={theme.radius.xl}
                accessibilityLabel={category.name}
              />
            ) : null}
            <GText variant="titleMd">{category.name}</GText>
            {typeof category.productCount === 'number' ? (
              <GText variant="bodySm" color="secondary">
                {category.productCount} products
              </GText>
            ) : (
              <GText variant="bodySm" color="secondary">
                Choose a subcategory to browse products
              </GText>
            )}
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingHorizontal: theme.spacing.lg,
              gap: theme.spacing.md,
            }}
          >
            {subcategories.map((sub) => (
              <CategoryCard key={sub.id} category={sub} onPress={() => openSubcategory(sub)} />
            ))}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}
