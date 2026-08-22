import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/providers';
import { store, useAddCartItemMutation, useGetHomeQuery } from '@/src/store';
import { getErrorMessage } from '@/src/utils/errors';
import { readCachedWishlistCartSources, resolveWishlistCartAdd } from '@/src/utils/wishlist';
import type { Address } from '@/src/types/address';
import type {
  CategorySummary,
  HomeBanner,
  HomeOffer,
  HomeProductSection,
  ProductSummary,
} from '@/src/types';
import { categoryHref, categoryProductsHref, productHref, searchHref } from '@/src/utils/navigation';
import {
  AddressSheet,
  CategorySection,
  EmptyState,
  ErrorState,
  GText,
  HomeBannerCarousel,
  HomeHeader,
  HomeProductGridSection,
  HomeSkeleton,
  OfferSection,
} from '@/src/components';

function hasHomeContent(
  data:
    | {
        banners?: unknown[];
        mainCategories?: unknown[];
        cakeCategories?: unknown[];
        subcategories?: unknown[];
        featuredProducts?: unknown[];
        bestSellers?: unknown[];
        offers?: unknown[];
        recommendedProducts?: unknown[];
        productSections?: unknown[];
      }
    | undefined,
): boolean {
  if (!data) {
    return false;
  }

  return Boolean(
    (data.banners?.length ?? 0) > 0 ||
      (data.mainCategories?.length ?? 0) > 0 ||
      (data.cakeCategories?.length ?? 0) > 0 ||
      (data.subcategories?.length ?? 0) > 0 ||
      (data.featuredProducts?.length ?? 0) > 0 ||
      (data.bestSellers?.length ?? 0) > 0 ||
      (data.offers?.length ?? 0) > 0 ||
      (data.recommendedProducts?.length ?? 0) > 0 ||
      (data.productSections?.length ?? 0) > 0,
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

  const productSections = useMemo((): HomeProductSection[] => {
    if (data?.productSections?.length) {
      return data.productSections;
    }
    return [
      {
        id: 'featured',
        title: 'Premium Cakes',
        products: data?.featuredProducts ?? [],
      },
      {
        id: 'best',
        title: 'Cool Cakes',
        products: data?.bestSellers ?? [],
      },
      {
        id: 'recommended',
        title: 'Cheese Cakes',
        products: data?.recommendedProducts ?? [],
      },
    ].filter((section) => section.products.length > 0);
  }, [data]);

  const cakeCategories = data?.cakeCategories?.length
    ? data.cakeCategories
    : (data?.mainCategories ?? []);

  const decoratorSection = productSections.find((section) =>
    section.title.toLowerCase().includes('decorator'),
  );
  const cakeProductSections = productSections.filter(
    (section) => section.id !== decoratorSection?.id,
  );
  const decoratorTop = decoratorSection?.products.slice(0, 6) ?? [];
  const decoratorBottom = decoratorSection?.products.slice(6, 12) ?? [];

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
      }
    },
    [router],
  );

  const onOfferPress = useCallback((_offer: HomeOffer) => {
    // Offer detail arrives in a later phase.
  }, []);

  const onLocationPress = useCallback(() => {
    setAddressSheetOpen(true);
  }, []);

  const onSeeAllCategory = useCallback(
    (categoryId?: string) => {
      if (categoryId) {
        router.push(categoryProductsHref(categoryId));
        return;
      }
      goCategories();
    },
    [goCategories, router],
  );

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
    const label = [address.street, address.area || address.city, address.pincode]
      .filter(Boolean)
      .join(', ');
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
            paddingTop: theme.spacing.md,
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

              <View style={{ gap: theme.spacing.md }}>
                <GText variant="titleSm" style={{ paddingHorizontal: theme.spacing.lg }}>
                  Premium Cakes
                </GText>
                <HomeBannerCarousel
                  banners={data?.banners ?? []}
                  loading={isFetching && !data?.banners}
                  onBannerPress={onBannerPress}
                />
              </View>

              <OfferSection offers={data?.offers ?? []} onOfferPress={onOfferPress} />

              <CategorySection
                title="Cakes"
                categories={cakeCategories}
                compact
                seeAllPosition="below"
                onCategoryPress={onCategoryPress}
                onSeeAllPress={goCategories}
              />

              <CategorySection
                title="Flavours"
                categories={data?.subcategories ?? []}
                compact
                seeAllPosition="below"
                onCategoryPress={onCategoryPress}
                onSeeAllPress={goCategories}
              />

              {cakeProductSections.map((section) => (
                <HomeProductGridSection
                  key={section.id}
                  title={section.title}
                  products={section.products}
                  onProductPress={onProductPress}
                  onAddPress={(product) => {
                    void onAddPress(product);
                  }}
                  onSeeAllPress={() => onSeeAllCategory(section.categoryId)}
                />
              ))}

              {decoratorTop.length > 0 ? (
                <HomeProductGridSection
                  title="Decorators"
                  products={decoratorTop}
                  maxItems={6}
                  onProductPress={onProductPress}
                  onAddPress={(product) => {
                    void onAddPress(product);
                  }}
                  onSeeAllPress={
                    decoratorBottom.length === 0
                      ? () => onSeeAllCategory(decoratorSection?.categoryId)
                      : undefined
                  }
                />
              ) : null}

              {(data?.offers?.length ?? 0) > 0 ? (
                <OfferSection
                  title="Offer banners"
                  offers={data?.offers ?? []}
                  onOfferPress={onOfferPress}
                />
              ) : null}

              {decoratorBottom.length > 0 ? (
                <HomeProductGridSection
                  products={decoratorBottom}
                  maxItems={6}
                  onProductPress={onProductPress}
                  onAddPress={(product) => {
                    void onAddPress(product);
                  }}
                  onSeeAllPress={() => onSeeAllCategory(decoratorSection?.categoryId)}
                />
              ) : null}
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
