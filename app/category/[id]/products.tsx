import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/providers';
import { useCatalogSelection } from '@/src/hooks';
import { useGetCategoriesQuery, useGetCategoryProductsQuery } from '@/src/store';
import { findCategoryById } from '@/src/utils/categoryTree';
import { getErrorMessage } from '@/src/utils/errors';
import { productHref } from '@/src/utils/navigation';
import type { ProductSummary } from '@/src/types';
import {
  CatalogToolbar,
  FilterSheet,
  Header,
  ProductGridList,
  ProductListSkeleton,
  SortSheet,
} from '@/src/components';

export default function CategoryProductsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const categoryId = String(params.id ?? '');

  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    selection,
    page,
    setPage,
    setSort,
    applySelection,
    clearFilters,
    setFilterValue,
    setPriceRange,
    hasActiveFilters,
  } = useCatalogSelection();

  const categoriesQuery = useGetCategoriesQuery();
  const category = useMemo(
    () => findCategoryById(categoriesQuery.data?.categories, categoryId),
    [categoriesQuery.data?.categories, categoryId],
  );

  const queryArgs = useMemo(
    () => ({
      categoryId,
      page,
      sort: selection.sort,
      priceMin: selection.priceMin,
      priceMax: selection.priceMax,
      filters: selection.filters,
    }),
    [categoryId, page, selection],
  );

  const { data, error, isLoading, isFetching, isError, refetch } = useGetCategoryProductsQuery(
    queryArgs,
    { skip: !categoryId },
  );

  const products = data?.items ?? [];
  const sortOptions = data?.availableSorts?.length ? data.availableSorts : undefined;
  const filterGroups = data?.availableFilters ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (page !== 1) {
        setPage(1);
      }
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [page, refetch, setPage]);

  const onEndReached = useCallback(() => {
    if (!data?.hasMore || isFetching) {
      return;
    }
    setPage(page + 1);
  }, [data?.hasMore, isFetching, page, setPage]);

  const onProductPress = useCallback(
    (product: ProductSummary) => {
      router.push(productHref(product.id));
    },
    [router],
  );

  const title = data?.category?.name ?? category?.name ?? 'Products';
  const showInitialSkeleton = isLoading && !data;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header
        title={title}
        showBack
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/categories');
          }
        }}
      />

      <View style={{ paddingTop: theme.spacing.sm, gap: theme.spacing.sm, flex: 1 }}>
        <CatalogToolbar
          selection={selection}
          resultCount={data?.total}
          sortOptions={sortOptions}
          filterGroups={filterGroups}
          onOpenSort={() => setSortOpen(true)}
          onOpenFilter={() => setFilterOpen(true)}
          onClearFilters={clearFilters}
          onClearPrice={() => setPriceRange(undefined, undefined)}
          onClearFilterKey={(key) => setFilterValue(key, undefined)}
        />

        {showInitialSkeleton ? <ProductListSkeleton /> : null}

        {!showInitialSkeleton ? (
          <ProductGridList
            products={products}
            refreshing={refreshing}
            loadingMore={isFetching && page > 1}
            errorMessage={
              isError && products.length === 0
                ? getErrorMessage(error, 'Could not load products.')
                : null
            }
            emptyTitle={hasActiveFilters ? 'No matching products' : 'No products yet'}
            emptyDescription={
              hasActiveFilters
                ? 'Try clearing filters or choosing a different sort.'
                : 'Check back soon for new items in this category.'
            }
            onRefresh={() => {
              void onRefresh();
            }}
            onRetry={() => {
              void refetch();
            }}
            onEndReached={onEndReached}
            onProductPress={onProductPress}
          />
        ) : null}
      </View>

      <SortSheet
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        selection={selection}
        sortOptions={sortOptions}
        onApply={setSort}
      />

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        selection={selection}
        filterGroups={filterGroups}
        onApply={applySelection}
        onClear={clearFilters}
      />
    </View>
  );
}
