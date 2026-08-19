import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/providers';
import { useGetCategoriesQuery } from '@/src/store';
import { getErrorMessage } from '@/src/utils/errors';
import { categoryHref, categoryProductsHref } from '@/src/utils/navigation';
import { isCustomerVisibleCategory } from '@/src/utils/categoryTree';
import type { CategoryNode } from '@/src/types';
import {
  CategoryCard,
  EmptyState,
  ErrorState,
  GIcon,
  GText,
  Header,
  HeaderActions,
  Skeleton,
} from '@/src/components';

export default function CategoriesTabScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);

  const { data, error, isLoading, isError, isFetching, refetch } = useGetCategoriesQuery();

  const mainCategories = useMemo(
    () => (data?.categories ?? []).filter(isCustomerVisibleCategory),
    [data?.categories],
  );

  const columns = width >= 400 ? 4 : 3;
  const horizontalPad = theme.spacing.lg * 2;
  const gap = theme.spacing.sm;
  const tileWidth = Math.floor((width - horizontalPad - gap * (columns - 1)) / columns);
  const featuredWidth = tileWidth * 2 + gap;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const openCategory = useCallback(
    (category: CategoryNode) => {
      const activeChildren = (category.children ?? []).filter(isCustomerVisibleCategory);
      if (activeChildren.length > 0) {
        router.push(categoryHref(category.id));
        return;
      }
      router.push(categoryProductsHref(category.id));
    },
    [router],
  );

  const showSkeleton = isLoading && !data;
  const showError = isError && !data;
  const showEmpty = Boolean(data) && mainCategories.length === 0 && !isFetching;

  const headerRight = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Wishlist"
        onPress={() => router.push('/wishlist')}
        hitSlop={8}
        style={{
          width: theme.dimensions.touchMin,
          height: theme.dimensions.touchMin,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GIcon name="heart-outline" />
      </Pressable>
      <HeaderActions showSearch showCart />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="All Categories" titleAlign="center" bordered={false} rightSlot={headerRight} />

      {showSkeleton ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
        >
          <Skeleton width={featuredWidth} height={140} borderRadius={theme.radius.xl} />
          <Skeleton width={tileWidth} height={140} borderRadius={theme.radius.xl} />
          <Skeleton width={tileWidth} height={140} borderRadius={theme.radius.xl} />
        </View>
      ) : null}

      {showError ? (
        <ErrorState
          title="Could not load categories"
          message={getErrorMessage(error, 'Categories are unavailable right now.')}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!showSkeleton && !showError ? (
        <ScrollView
          contentContainerStyle={{
            paddingVertical: theme.spacing.md,
            paddingBottom: theme.spacing['3xl'],
            gap: theme.spacing['2xl'],
            flexGrow: 1,
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
          {showEmpty ? (
            <EmptyState
              title="No categories yet"
              description="Active categories will appear here when the catalogue is ready."
              iconName="grid-outline"
              actionLabel="Retry"
              onAction={() => {
                void refetch();
              }}
            />
          ) : (
            mainCategories.map((category) => {
              const children = (category.children ?? []).filter(isCustomerVisibleCategory);
              const tiles = children.length ? children : [category];
              return (
                <View key={category.id} style={{ gap: theme.spacing.md }}>
                  <GText variant="titleSm" style={{ paddingHorizontal: theme.spacing.lg }}>
                    {category.name}
                  </GText>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      paddingHorizontal: theme.spacing.lg,
                      gap,
                    }}
                  >
                    {tiles.map((tile, index) => {
                      const featured = index === 0 && tiles.length > 3;
                      return (
                        <CategoryCard
                          key={tile.id}
                          category={tile}
                          featured={featured}
                          width={featured ? featuredWidth : tileWidth}
                          onPress={() => openCategory(tile)}
                        />
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      ) : null}
    </View>
  );
}
