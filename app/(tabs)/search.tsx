import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useCatalogSelection, useDebouncedValue } from '@/src/hooks';
import { useGetCategoriesQuery, useSearchProductsQuery } from '@/src/store';
import { flattenSubcategories } from '@/src/utils/categoryTree';
import { getErrorMessage } from '@/src/utils/errors';
import { productHref } from '@/src/utils/navigation';
import type { ProductSummary } from '@/src/types';
import {
  CatalogToolbar,
  EmptyState,
  FilterSheet,
  GIcon,
  ProductGridList,
  ProductListSkeleton,
  SearchBar,
  SortSheet,
} from '@/src/components';

const MIN_QUERY_LENGTH = 2;

export default function SearchTabScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 350);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPane, setFilterPane] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);

  const {
    selection,
    page,
    setPage,
    setSort,
    applySelection,
    clearFilters,
    setFilterValue,
    setSubcategory,
    setPriceRange,
    hasActiveFilters,
  } = useCatalogSelection();

  const categoriesQuery = useGetCategoriesQuery();
  const subcategories = useMemo(
    () => flattenSubcategories(categoriesQuery.data?.categories),
    [categoriesQuery.data?.categories],
  );

  const canSearch = debouncedQuery.length >= MIN_QUERY_LENGTH;

  const queryArgs = useMemo(
    () => ({
      q: debouncedQuery,
      page,
      sort: selection.sort,
      subcategory: selection.subcategory,
      priceMin: selection.priceMin,
      priceMax: selection.priceMax,
      filters: selection.filters,
    }),
    [debouncedQuery, page, selection],
  );

  const { data, error, isLoading, isFetching, isError, refetch } = useSearchProductsQuery(
    queryArgs,
    { skip: !canSearch },
  );

  const products = data?.items ?? [];
  const sortOptions = data?.availableSorts?.length ? data.availableSorts : undefined;
  const filterGroups = data?.availableFilters ?? [];
  const isTyping = query.trim() !== debouncedQuery;
  const showInitialSkeleton = canSearch && (isLoading || isTyping) && !data;

  const openFilters = useCallback((paneId?: string) => {
    setFilterPane(paneId);
    setFilterOpen(true);
  }, []);

  const onRefresh = useCallback(async () => {
    if (!canSearch) {
      return;
    }
    setRefreshing(true);
    try {
      if (page !== 1) {
        setPage(1);
      }
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [canSearch, page, refetch, setPage]);

  const onEndReached = useCallback(() => {
    if (!canSearch || !data?.hasMore || isFetching) {
      return;
    }
    setPage(page + 1);
  }, [canSearch, data?.hasMore, isFetching, page, setPage]);

  const onProductPress = useCallback(
    (product: ProductSummary) => {
      router.push(productHref(product.id));
    },
    [router],
  );

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }, [router]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          paddingTop: insets.top + theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.default,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={goBack}
          hitSlop={8}
          style={{
            width: theme.dimensions.touchMin,
            height: theme.dimensions.touchMin,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GIcon name="chevron-back" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setPage(1);
            }}
            placeholder="Search cakes, cookies & more"
            onClear={() => {
              setQuery('');
              setPage(1);
            }}
          />
        </View>
      </View>

      {!canSearch ? (
        <EmptyState
          title="Find your favourite treat"
          description="Try Chocolate Cake, Birthday Cake, Wedding Cake, Cookies, or GUNUCO Premium."
          iconName="search-outline"
        />
      ) : (
        <View style={{ flex: 1, paddingTop: theme.spacing.sm, gap: theme.spacing.sm }}>
          <CatalogToolbar
            selection={selection}
            resultCount={data?.total}
            sortOptions={sortOptions}
            filterGroups={filterGroups}
            subcategories={subcategories}
            onOpenSort={() => setSortOpen(true)}
            onOpenFilter={openFilters}
            onClearFilters={clearFilters}
            onClearSubcategory={() => setSubcategory(undefined)}
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
                  ? getErrorMessage(error, 'Search is unavailable right now.')
                  : null
              }
              emptyTitle="No results"
              emptyDescription={
                hasActiveFilters
                  ? 'Try adjusting filters or your search terms.'
                  : `No products matched "${debouncedQuery}".`
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
      )}

      <SortSheet
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        selection={selection}
        sortOptions={sortOptions}
        onApply={setSort}
      />

      <FilterSheet
        visible={filterOpen}
        onClose={() => {
          setFilterOpen(false);
          setFilterPane(undefined);
        }}
        selection={selection}
        filterGroups={filterGroups}
        subcategories={subcategories}
        showSubcategoryFilter
        resultCount={data?.total}
        initialPane={filterPane}
        onApply={applySelection}
        onClear={clearFilters}
      />
    </KeyboardAvoidingView>
  );
}
