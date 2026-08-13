import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/providers';
import { useGetCategoriesQuery } from '@/src/store';
import { getErrorMessage } from '@/src/utils/errors';
import { categoryHref, categoryProductsHref } from '@/src/utils/navigation';
import type { CategoryNode } from '@/src/types';
import { CategoryCard, EmptyState, ErrorState, Header, Section, Skeleton } from '@/src/components';

export default function CategoriesTabScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data, error, isLoading, isError, isFetching, refetch } = useGetCategoriesQuery();

  const mainCategories = useMemo(
    () => (data?.categories ?? []).filter((category) => category.isActive !== false),
    [data?.categories],
  );

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
      const activeChildren = (category.children ?? []).filter((child) => child.isActive !== false);
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Categories" />

      {showSkeleton ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
        >
          <Skeleton width={120} height={140} borderRadius={theme.radius.lg} />
          <Skeleton width={120} height={140} borderRadius={theme.radius.lg} />
          <Skeleton width={120} height={140} borderRadius={theme.radius.lg} />
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
            paddingVertical: theme.spacing.lg,
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
            <Section title="Shop by category" subtitle="Only active categories are shown">
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  paddingHorizontal: theme.spacing.lg,
                  gap: theme.spacing.md,
                }}
              >
                {mainCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onPress={() => openCategory(category)}
                  />
                ))}
              </View>
            </Section>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
}
