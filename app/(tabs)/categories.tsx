import {
  EmptyState,
  ErrorState,
  GButton,
  GIcon,
  GImage,
  GLoader,
  GText,
  Header,
  HeaderActions,
  PriceDisplay,
  Skeleton,
  WishlistButton,
} from '@/src/components';
import { useTheme } from '@/src/providers';
import { useGetCategoriesQuery, useGetCategoryProductsQuery } from '@/src/store';
import type { CategoryNode, ProductSummary } from '@/src/types';
import { isCustomerVisibleCategory } from '@/src/utils/categoryTree';
import { getErrorMessage } from '@/src/utils/errors';
import { categoryHref, categoryProductsHref } from '@/src/utils/navigation';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

export default function CategoriesTabScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data, error, isLoading, isError, isFetching, refetch } = useGetCategoriesQuery();

  const mainCategories = useMemo(
    () => (data?.categories ?? []).filter(isCustomerVisibleCategory),
    [data?.categories],
  );

  const selectedCategory = useMemo(() => {
    if (!mainCategories.length) {
      return null;
    }
    const selected =
      mainCategories.find((item) => item.id === selectedCategoryId) ?? mainCategories[0];
    return selected;
  }, [mainCategories, selectedCategoryId]);

  const selectedQuery = useGetCategoryProductsQuery(
    {
      categoryId: selectedCategory?.id ?? '',
      page: 1,
      sort: undefined,
      priceMin: undefined,
      priceMax: undefined,
      filters: {},
    },
    { skip: !selectedCategory?.id },
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), selectedQuery.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, selectedQuery]);

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
  const productLoading = selectedQuery.isLoading && !selectedQuery.data;
  const products = selectedQuery.data?.items ?? [];

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
      <Header title="All Categories" titleAlign="left" bordered={false} rightSlot={headerRight} />

      {showSkeleton ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View
            style={{
              flex: 1,
              gap: theme.spacing.sm,
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.xs,
              borderRightWidth: 1,
              borderRightColor: theme.colors.border.default,
            }}
          >
            <Skeleton width="100%" height={72} borderRadius={theme.radius.lg} />
            <Skeleton width="100%" height={72} borderRadius={theme.radius.lg} />
            <Skeleton width="100%" height={72} borderRadius={theme.radius.lg} />
          </View>
          <View
            style={{
              flex: 4,
              gap: theme.spacing.md,
              paddingHorizontal: theme.spacing.md,
              paddingTop: theme.spacing.sm,
            }}
          >
            <Skeleton width="100%" height={180} borderRadius={theme.radius.xl} />
            <Skeleton width="100%" height={180} borderRadius={theme.radius.xl} />
          </View>
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
        <View style={{ flex: 1 }}>
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
            <View style={{ width: '100%', flexDirection: 'row' }}>
              <ScrollView
                style={{
                  width: '25%',
                  // flex: 0.5,
                  borderRightWidth: 1,
                  borderRightColor: theme.colors.border.default,
                }}
                contentContainerStyle={{
                  paddingVertical: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.sm,
                  gap: theme.spacing.sm,
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
                {mainCategories.map((category) => {
                  const selected = category.id === selectedCategory?.id;
                  return (
                    <Pressable
                      key={category.id}
                      accessibilityRole="button"
                      accessibilityLabel={category.name}
                      onPress={() => setSelectedCategoryId(category.id)}
                      style={{
                        borderRadius: theme.radius['2xl'],
                        padding: theme.spacing.md,
                        alignItems: 'center',
                        backgroundColor: selected
                          ? theme.colors.bg.surfaceMuted
                          : theme.colors.bg.surface,
                        borderWidth: selected ? 1 : 0,
                        borderColor: theme.colors.brand.primary,
                        gap: theme.spacing.xs,
                      }}
                    >
                      <GImage
                        uri={category.imageUrl}
                        width={56}
                        height={56}
                        borderRadius={theme.radius['2xl']}
                        accessibilityLabel={category.name}
                      />
                      <GText variant="caption" numberOfLines={2} align="center">
                        {category.name}
                      </GText>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <ScrollView
                style={{ width: '75%' }}
                contentContainerStyle={{
                  paddingHorizontal: theme.spacing.md,
                  paddingTop: theme.spacing.sm,
                  paddingBottom: theme.spacing['3xl'],
                  gap: theme.spacing.md,
                }}
              >
                <View style={{ gap: theme.spacing.xs }}>
                  <GText variant="titleSm">{selectedCategory?.name ?? 'Products'}</GText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open selected category page"
                    onPress={() => {
                      if (selectedCategory) {
                        openCategory(selectedCategory);
                      }
                    }}
                  >
                    <GText variant="caption" color="brand">
                      View all
                    </GText>
                  </Pressable>
                </View>

                {productLoading ? (
                  <View style={{ paddingVertical: theme.spacing.xl }}>
                    <GLoader />
                  </View>
                ) : selectedQuery.isError ? (
                  <ErrorState
                    title="Could not load products"
                    message={getErrorMessage(
                      selectedQuery.error,
                      'Products are unavailable right now.',
                    )}
                    onRetry={() => {
                      void selectedQuery.refetch();
                    }}
                  />
                ) : products.length === 0 ? (
                  <EmptyState
                    title="No products in this category"
                    description="Try another category from the left panel."
                    iconName="storefront-outline"
                  />
                ) : (
                  products.map((product: ProductSummary) => (
                    <Pressable
                      key={product.id}
                      accessibilityRole="button"
                      accessibilityLabel={product.name}
                      onPress={() => router.push(`/product/${product.id}`)}
                      style={{
                        // borderWidth: 1,
                        // borderColor: theme.colors.border.default,
                        // borderRadius: theme.radius.lg,
                        padding: theme.spacing.sm,
                        gap: theme.spacing.sm,
                        // backgroundColor: theme.colors.bg.surface,
                      }}
                    >
                      <View
                        style={{
                          width: '100%',
                          aspectRatio: 1.45,
                          borderRadius: theme.radius.lg,
                          overflow: 'hidden',
                          backgroundColor: theme.colors.bg.surfaceMuted,
                        }}
                      >
                        <GImage
                          uri={product.imageUrl}
                          width={300}
                          height={220}
                          borderRadius={theme.radius.lg}
                          accessibilityLabel={product.name}
                        />
                        <WishlistButton
                          productId={product.id}
                          initialWishlisted={product.isWishlisted}
                          overlay
                          size="sm"
                        />
                        <View
                          style={{
                            position: 'absolute',
                            right: theme.spacing.sm,
                            bottom: theme.spacing.sm,
                          }}
                        >
                          <GButton
                            title="Add"
                            size="sm"
                            onPress={() => router.push(`/product/${product.id}`)}
                            accessibilityLabel={`Add ${product.name}`}
                          />
                        </View>
                      </View>
                      <View style={{ gap: 2 }}>
                        <GText variant="label" numberOfLines={2}>
                          {product.name}
                        </GText>
                        {product.weightLabel ? (
                          <GText variant="caption" color="secondary">
                            {product.weightLabel}
                          </GText>
                        ) : null}
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <PriceDisplay
                            pricePaise={product.pricePaise}
                            compareAtPricePaise={product.compareAtPricePaise}
                            size="sm"
                          />
                          {typeof product.ratingAverage === 'number' ? (
                            <GText variant="caption" color="secondary">
                              {product.ratingAverage.toFixed(1)} ★
                            </GText>
                          ) : null}
                        </View>
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}
