import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/providers';
import { store, useAddCartItemMutation, useGetHomeQuery } from '@/src/store';
import { getErrorMessage } from '@/src/utils/errors';
import { readCachedWishlistCartSources, resolveWishlistCartAdd } from '@/src/utils/wishlist';
import type { Address } from '@/src/types/address';
import type { CategorySummary, HomeBanner, HomeOffer, ProductSummary } from '@/src/types';
import { categoryHref, productHref, searchHref } from '@/src/utils/navigation';
import {
  AddressSheet,
  CategorySection,
  EmptyState,
  ErrorState,
  GText,
  HomeBannerCarousel,
  HomeHeader,
  HomeSkeleton,
  OfferSection,
  ProductCarousel,
} from '@/src/components';

function hasHomeContent(
  data:
    | {
        banners?: unknown[];
        mainCategories?: unknown[];
        subcategories?: unknown[];
        featuredProducts?: unknown[];
        bestSellers?: unknown[];
        offers?: unknown[];
        recommendedProducts?: unknown[];
      }
    | undefined,
): boolean {
  if (!data) {
    return false;
  }

  return Boolean(
    (data.banners?.length ?? 0) > 0 ||
    (data.mainCategories?.length ?? 0) > 0 ||
    (data.subcategories?.length ?? 0) > 0 ||
    (data.featuredProducts?.length ?? 0) > 0 ||
    (data.bestSellers?.length ?? 0) > 0 ||
    (data.offers?.length ?? 0) > 0 ||
    (data.recommendedProducts?.length ?? 0) > 0,
  );
}

export default function HomeTabScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [locationOverride, setLocationOverride] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [addCartItem, addCartState] = useAddCartItemMutation();

  const { data, error, isLoading, isFetching, isError, refetch } = useGetHomeQuery();

  const locationLabel = useMemo(() => {
    if (locationOverride) {
      return locationOverride;
    }
    if (data?.deliveryContext?.label) {
      return data.deliveryContext.label;
    }
    return 'Select delivery location';
  }, [data?.deliveryContext?.label, locationOverride]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const goSearch = useCallback(() => {
    router.push(searchHref());
  }, [router]);

  const goCategories = useCallback(() => {
    router.push('/(tabs)/categories');
  }, [router]);

  const onCategoryPress = useCallback(
    (category: CategorySummary) => {
      router.push(categoryHref(category.id));
    },
    [router],
  );

  const onProductPress = useCallback(
    (product: ProductSummary) => {
      router.push(productHref(product.id));
    },
    [router],
  );

  const onBannerPress = useCallback(
    (banner: HomeBanner) => {
      if (banner.linkType === 'category' && banner.linkId) {
        router.push(categoryHref(banner.linkId));
        return;
      }
      if (banner.linkType === 'product' && banner.linkId) {
        router.push(productHref(banner.linkId));
        return;
      }
      // Offer / URL deep links arrive with their feature phases.
    },
    [router],
  );

  const onOfferPress = useCallback((_offer: HomeOffer) => {
    // Offer detail arrives in a later phase.
  }, []);

  const onLocationPress = useCallback(() => {
    setAddressSheetOpen(true);
  }, []);

  const onAddPress = useCallback(
    async (product: ProductSummary) => {
      if (addCartState.isLoading || product.isAvailable === false) {
        return;
      }
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
        setActionMessage('Added to cart.');
      } catch (error) {
        setActionMessage(getErrorMessage(error));
      }
    },
    [addCartItem, addCartState.isLoading, router],
  );

  const onAddressSelect = useCallback((address: Address) => {
    const label = [address.addressType, address.area || address.city].filter(Boolean).join(' · ');
    setLocationOverride(label || address.street);
    setAddressSheetOpen(false);
  }, []);

  const showInitialSkeleton = isLoading && !data;
  const showError = isError && !data;
  const showEmpty = Boolean(data) && !hasHomeContent(data) && !isFetching;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <HomeHeader
        locationLabel={locationLabel}
        onLocationPress={onLocationPress}
        onSearchPress={goSearch}
      />

      {showInitialSkeleton ? (
        <ScrollView
          contentContainerStyle={{ paddingTop: theme.spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          <HomeSkeleton />
        </ScrollView>
      ) : null}

      {showError ? (
        <ErrorState
          title="Could not load Home"
          message={getErrorMessage(error, 'Home feed is unavailable right now.')}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!showInitialSkeleton && !showError ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: theme.spacing.lg,
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
              title="Nothing to show yet"
              description="Check back soon for cakes, cookies, and offers from GUNUCO."
              iconName="storefront-outline"
              actionLabel="Retry"
              onAction={() => {
                void refetch();
              }}
            />
          ) : (
            <>
              {actionMessage ? (
                <View style={{ paddingHorizontal: theme.spacing.lg }}>
                  <GText variant="bodySm" color="success">
                    {actionMessage}
                  </GText>
                </View>
              ) : null}

              <HomeBannerCarousel
                banners={data?.banners ?? []}
                loading={isFetching && !data?.banners}
                onBannerPress={onBannerPress}
              />

              <CategorySection
                title="Shop by category"
                categories={data?.mainCategories ?? []}
                onCategoryPress={onCategoryPress}
                onSeeAllPress={goCategories}
              />

              <CategorySection
                title="Explore flavours"
                categories={data?.subcategories ?? []}
                onCategoryPress={onCategoryPress}
                onSeeAllPress={goCategories}
              />

              <OfferSection
                title="Offers for you"
                offers={data?.offers ?? []}
                onOfferPress={onOfferPress}
              />

              <ProductCarousel
                title="Featured"
                products={data?.featuredProducts ?? []}
                onProductPress={onProductPress}
                onAddPress={(product) => {
                  void onAddPress(product);
                }}
                showAddButton
              />

              <ProductCarousel
                title="Best sellers"
                products={data?.bestSellers ?? []}
                onProductPress={onProductPress}
                onAddPress={(product) => {
                  void onAddPress(product);
                }}
                showAddButton
              />

              <ProductCarousel
                title="Recommended"
                products={data?.recommendedProducts ?? []}
                onProductPress={onProductPress}
                onAddPress={(product) => {
                  void onAddPress(product);
                }}
                showAddButton
              />
            </>
          )}
        </ScrollView>
      ) : null}

      <AddressSheet
        visible={addressSheetOpen}
        onClose={() => setAddressSheetOpen(false)}
        onSelect={onAddressSelect}
      />
    </View>
  );
}
