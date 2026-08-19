import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth, useProductConfiguration } from '@/src/hooks';
import {
  useAddCartItemMutation,
  useGetCategoryProductsQuery,
  useGetProductOptionsQuery,
  useGetProductQuery,
} from '@/src/store';
import { APP_NAME } from '@/src/constants';
import { getErrorMessage, isNotFoundError } from '@/src/utils/errors';
import {
  getAvailabilityMessage,
  getProductImages,
  getProductOffer,
  toCartOptions,
} from '@/src/utils/productDetail';
import { productHref, productReviewsHref } from '@/src/utils/navigation';
import type { ProductSummary } from '@/src/types';
import {
  AccordionSection,
  EmptyState,
  ErrorState,
  GBadge,
  GButton,
  GImage,
  GText,
  Header,
  IconCircleButton,
  PriceDisplay,
  ProductCarousel,
  ProductDetailSkeleton,
  ProductImageGallery,
  ProductOptionRenderer,
  QuantitySelector,
  RatingView,
  Skeleton,
  StickyCartBar,
  WishlistButton,
} from '@/src/components';

const DESCRIPTION_COLLAPSE_LENGTH = 220;

export default function ProductDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ id: string }>();
  const productId = typeof params.id === 'string' ? params.id : '';

  const scrollRef = useRef<ScrollView>(null);
  const optionsOffsetY = useRef(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [compactHeader, setCompactHeader] = useState(false);
  const [cartMessage, setCartMessage] = useState<{
    tone: 'success' | 'danger';
    text: string;
  } | null>(null);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  const productQuery = useGetProductQuery(productId, { skip: !productId });
  const product = productQuery.data;
  const productReady = Boolean(product?.id);
  const optionsQuery = useGetProductOptionsQuery(productId, {
    skip: !productId || !productReady,
  });
  const relatedQuery = useGetCategoryProductsQuery(
    { categoryId: product?.category?.id ?? '', page: 1 },
    { skip: !product?.category?.id },
  );
  const [addCartItem, addCartState] = useAddCartItemMutation();

  const optionsUnavailable = isNotFoundError(optionsQuery.error);
  const optionsFailed = optionsQuery.isError && !optionsUnavailable;
  const optionsResponse = optionsUnavailable ? { groups: [] } : optionsQuery.data;

  const configuration = useProductConfiguration(productId, product, optionsResponse);
  const optionsPending = optionsQuery.isLoading && !configuration.groups.length;

  const relatedProducts = useMemo(
    () => (relatedQuery.data?.items ?? []).filter((item) => item.id !== productId).slice(0, 8),
    [productId, relatedQuery.data?.items],
  );

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }, [router]);

  const continueShopping = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  const onShare = useCallback(async () => {
    if (!product) {
      return;
    }
    try {
      await Share.share({
        message: `Have a look at ${product.name} on ${APP_NAME}.`,
      });
    } catch {
      setCartMessage({ tone: 'danger', text: 'Unable to share this product right now.' });
    }
  }, [product]);

  const onAddToCart = useCallback(async () => {
    if (!product || addCartState.isLoading || optionsPending) {
      return;
    }

    setCartMessage(null);

    if (optionsFailed) {
      setCartMessage({
        tone: 'danger',
        text: 'Unable to load product options. Please try again.',
      });
      return;
    }

    if (configuration.highlightMissingRequired()) {
      scrollRef.current?.scrollTo({
        y: Math.max(0, optionsOffsetY.current - theme.spacing.lg),
        animated: true,
      });
      setCartMessage({
        tone: 'danger',
        text: 'Please select the required options before adding to cart.',
      });
      return;
    }

    if (!configuration.displayedPrice.isAvailable || product.isAvailable === false) {
      setCartMessage({
        tone: 'danger',
        text:
          getAvailabilityMessage(product, configuration.displayedPrice) ?? 'Currently unavailable',
      });
      return;
    }

    if (!isAuthenticated) {
      setCartMessage({
        tone: 'danger',
        text: 'Sign in to add items to your cart.',
      });
      router.push('/(auth)/phone');
      return;
    }

    try {
      await addCartItem({
        productId: product.id,
        quantity: configuration.quantity,
        options: toCartOptions(configuration.selection),
      }).unwrap();
      setCartMessage({ tone: 'success', text: 'Added to cart.' });
    } catch (error) {
      setCartMessage({
        tone: 'danger',
        text: getErrorMessage(error),
      });
    }
  }, [
    addCartItem,
    addCartState.isLoading,
    configuration,
    isAuthenticated,
    optionsFailed,
    optionsPending,
    product,
    router,
    theme.spacing.lg,
  ]);

  const onRelatedPress = useCallback(
    (item: ProductSummary) => {
      router.push(productHref(item.id));
    },
    [router],
  );

  if (!productId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Product" showBack onBackPress={goBack} />
        <EmptyState
          title="Product not found"
          description="This product link is missing or invalid."
          actionLabel="Continue shopping"
          onAction={continueShopping}
        />
      </View>
    );
  }

  if (productQuery.isLoading && !product) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <ProductDetailSkeleton />
      </View>
    );
  }

  if (productQuery.isError || !product?.id) {
    const notFound = isNotFoundError(productQuery.error) || !product?.id;
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Product" showBack onBackPress={goBack} />
        {notFound ? (
          <EmptyState
            title="Product not found"
            description="This product is unavailable or no longer listed."
            actionLabel="Continue shopping"
            onAction={continueShopping}
          />
        ) : (
          <>
            <ErrorState
              message={getErrorMessage(productQuery.error)}
              onRetry={() => {
                void productQuery.refetch();
              }}
            />
            <View style={{ paddingHorizontal: theme.spacing.lg }}>
              <GButton
                title="Continue shopping"
                variant="ghost"
                fullWidth
                onPress={continueShopping}
              />
            </View>
          </>
        )}
      </View>
    );
  }

  const images = getProductImages(product);
  const offer = getProductOffer(product);
  const availabilityMessage = getAvailabilityMessage(product, configuration.displayedPrice);
  const purchasable =
    configuration.displayedPrice.isAvailable && product.isAvailable !== false && !optionsFailed;
  const description = product.description?.trim() ?? '';
  const descriptionCollapsible = description.length > DESCRIPTION_COLLAPSE_LENGTH;
  const descriptionText =
    descriptionCollapsible && !descriptionExpanded
      ? `${description.slice(0, DESCRIPTION_COLLAPSE_LENGTH).trim()}…`
      : description;
  const infoSections =
    product.infoSections?.filter((section) => section.title && section.body) ?? [];
  const showRating = typeof product.ratingAverage === 'number';
  const atMaxQuantity =
    typeof product.quantityMax === 'number' && configuration.quantity >= configuration.maxQuantity;
  const adding = addCartState.isLoading;
  const ctaDisabled = adding || !purchasable || optionsPending;
  const showOptionsSection = optionsPending || optionsFailed || configuration.groups.length > 0;
  const statusMessage = wishlistError ?? cartMessage?.text ?? null;
  const statusTone = wishlistError ? 'danger' : (cartMessage?.tone ?? 'danger');

  const overlayControls = (
    <View
      pointerEvents="box-none"
      style={{
        flex: 1,
        paddingTop: insets.top + theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <IconCircleButton iconName="chevron-back" accessibilityLabel="Go back" onPress={goBack} />
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <IconCircleButton
          iconName="search-outline"
          accessibilityLabel="Search"
          onPress={() => router.push('/(tabs)/search')}
        />
        <IconCircleButton
          iconName="share-outline"
          accessibilityLabel="Share product"
          onPress={() => {
            void onShare();
          }}
        />
        <View
          style={{
            backgroundColor: theme.colors.bg.surface,
            borderRadius: theme.radius.pill,
            ...theme.shadows.sm,
          }}
        >
          <WishlistButton
            productId={product.id}
            initialWishlisted={product.isWishlisted}
            onError={setWishlistError}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      {compactHeader ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 4,
            paddingTop: insets.top,
            paddingHorizontal: theme.spacing.md,
            paddingBottom: theme.spacing.sm,
            backgroundColor: theme.colors.bg.surface,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            ...theme.shadows.sm,
          }}
        >
          <IconCircleButton
            iconName="chevron-back"
            accessibilityLabel="Go back"
            onPress={goBack}
            overlay={false}
          />
          <GImage
            uri={product.imageUrl}
            width={36}
            height={36}
            borderRadius={theme.radius.md}
            accessibilityLabel={product.name}
          />
          <View style={{ flex: 1 }}>
            <GText variant="label" numberOfLines={1}>
              {product.name}
            </GText>
            <PriceDisplay
              pricePaise={configuration.displayedPrice.pricePaise}
              compareAtPricePaise={configuration.displayedPrice.compareAtPricePaise}
              size="sm"
            />
          </View>
          <IconCircleButton
            iconName="search-outline"
            accessibilityLabel="Search"
            onPress={() => router.push('/(tabs)/search')}
            overlay={false}
          />
          <IconCircleButton
            iconName="share-outline"
            accessibilityLabel="Share product"
            onPress={() => {
              void onShare();
            }}
            overlay={false}
          />
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: theme.spacing['2xl'] }}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={(event) => {
          const next = event.nativeEvent.contentOffset.y > 240;
          if (next !== compactHeader) {
            setCompactHeader(next);
          }
        }}
      >
        <ProductImageGallery images={images} productName={product.name} overlay={overlayControls} />

        <View
          style={{
            marginTop: -theme.spacing.lg,
            backgroundColor: theme.colors.bg.canvas,
            borderTopLeftRadius: theme.radius['2xl'],
            borderTopRightRadius: theme.radius['2xl'],
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.xl,
            gap: theme.spacing.sm,
          }}
        >
          {product.availabilityLabel ? (
            <GText variant="caption" color="secondary">
              {product.availabilityLabel}
            </GText>
          ) : null}
          {product.category?.name ? (
            <GText variant="caption" color="secondary">
              {product.category.name}
            </GText>
          ) : null}
          <GText variant="titleMd">{product.name}</GText>
          {product.weightLabel ? (
            <GText variant="bodySm" color="secondary">
              Net quantity: {product.weightLabel}
            </GText>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See product reviews"
            onPress={() => router.push(productReviewsHref(product.id))}
            hitSlop={8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
          >
            {showRating ? (
              <RatingView
                value={product.ratingAverage ?? 0}
                count={product.ratingCount}
                size="md"
                compact
              />
            ) : null}
            <GText variant="label" color="brand">
              {showRating ? 'See reviews' : 'Reviews'}
            </GText>
          </Pressable>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: theme.spacing.sm,
            }}
          >
            <PriceDisplay
              pricePaise={configuration.displayedPrice.pricePaise}
              compareAtPricePaise={configuration.displayedPrice.compareAtPricePaise}
              size="lg"
              pill
            />
            {configuration.displayedPrice.discountLabel ? (
              <GBadge label={configuration.displayedPrice.discountLabel} variant="discount" />
            ) : null}
            {product.isPremium ? <GBadge label="GUNUCO PREMIUM" variant="premium" /> : null}
          </View>

          {offer ? (
            <View
              style={{
                backgroundColor: theme.colors.bg.surfaceMuted,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.md,
                gap: theme.spacing.xs,
              }}
            >
              <GText variant="label" color="brand">
                {offer.title}
              </GText>
              {offer.subtitle ? (
                <GText variant="bodySm" color="secondary">
                  {offer.subtitle}
                </GText>
              ) : null}
            </View>
          ) : null}

          {availabilityMessage ? (
            <GText variant="bodySm" color={purchasable ? 'secondary' : 'danger'}>
              {availabilityMessage}
            </GText>
          ) : null}

          <View
            style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.bg.surface,
                borderRadius: theme.radius.xl,
                padding: theme.spacing.md,
                gap: theme.spacing.xs,
              }}
            >
              <GText variant="label">Made to order</GText>
              <GText variant="caption" color="secondary">
                Fresh bake with your customisation.
              </GText>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.bg.surface,
                borderRadius: theme.radius.xl,
                padding: theme.spacing.md,
                gap: theme.spacing.xs,
              }}
            >
              <GText variant="label">GUNUCO bakery</GText>
              <GText variant="caption" color="secondary">
                HITEC City, Hyderabad
              </GText>
            </View>
          </View>
        </View>

        {showOptionsSection ? (
          <View
            onLayout={(event) => {
              optionsOffsetY.current = event.nativeEvent.layout.y;
            }}
            style={{ marginTop: theme.spacing.xl }}
          >
            {optionsPending ? (
              <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}>
                <Skeleton height={16} width="28%" />
                <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                  <Skeleton
                    height={theme.dimensions.touchMin}
                    width={88}
                    borderRadius={theme.radius.pill}
                  />
                  <Skeleton
                    height={theme.dimensions.touchMin}
                    width={72}
                    borderRadius={theme.radius.pill}
                  />
                </View>
              </View>
            ) : null}

            {optionsFailed ? (
              <View style={{ paddingHorizontal: theme.spacing.lg }}>
                <ErrorState
                  title="Unable to load options"
                  message={getErrorMessage(optionsQuery.error)}
                  onRetry={() => {
                    void optionsQuery.refetch();
                  }}
                />
              </View>
            ) : (
              <ProductOptionRenderer
                groups={configuration.groups}
                selection={configuration.selection}
                variants={configuration.variants}
                highlightedGroupId={configuration.validationGroupId}
                disabled={adding || !purchasable}
                onSelectValue={configuration.selectValue}
              />
            )}
          </View>
        ) : null}

        <View
          style={{
            marginHorizontal: theme.spacing.lg,
            marginTop: theme.spacing.xl,
            backgroundColor: theme.colors.bg.surface,
            borderRadius: theme.radius.xl,
            padding: theme.spacing.lg,
            gap: theme.spacing.sm,
          }}
        >
          <GText variant="titleSm">HOW MANY</GText>
          <QuantitySelector
            value={configuration.quantity}
            onChange={configuration.setQuantity}
            min={configuration.minQuantity}
            max={configuration.maxQuantity}
            disabled={!purchasable}
            loading={adding}
          />
          {atMaxQuantity ? (
            <GText variant="caption" color="secondary">
              Maximum quantity reached.
            </GText>
          ) : null}
        </View>

        {description ? (
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              marginTop: theme.spacing.xl,
              gap: theme.spacing.sm,
            }}
          >
            <GText variant="titleSm">Description</GText>
            <GText variant="bodyMd" color="secondary">
              {descriptionText}
            </GText>
            {descriptionCollapsible ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  descriptionExpanded ? 'Show less description' : 'Read more description'
                }
                onPress={() => setDescriptionExpanded((current) => !current)}
                hitSlop={8}
              >
                <GText variant="label" color="brand">
                  {descriptionExpanded ? 'Show less' : 'Read more'}
                </GText>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View
          style={{
            paddingHorizontal: theme.spacing.lg,
            marginTop: theme.spacing.xl,
            gap: theme.spacing.md,
          }}
        >
          {product.highlights?.length ? (
            <AccordionSection title="Highlights" rows={product.highlights} defaultOpen />
          ) : null}
          {infoSections.map((section) => (
            <AccordionSection
              key={section.id ?? section.title}
              title={section.title}
              body={section.body}
            />
          ))}
        </View>

        {relatedProducts.length ? (
          <View style={{ marginTop: theme.spacing['2xl'] }}>
            <ProductCarousel
              title="You might also like"
              products={relatedProducts}
              onProductPress={onRelatedPress}
              showAddButton={false}
              showWishlist={false}
            />
          </View>
        ) : null}

        {cartMessage?.tone === 'success' ? (
          <View style={{ paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.lg }}>
            <GButton
              title="View cart"
              variant="ghost"
              fullWidth
              onPress={() => router.push('/(tabs)/cart')}
            />
          </View>
        ) : null}
      </ScrollView>

      <StickyCartBar
        title="Add to Cart"
        loading={adding}
        disabled={ctaDisabled}
        onAddPress={() => {
          void onAddToCart();
        }}
        onCartPress={() => router.push('/(tabs)/cart')}
        message={statusMessage}
        messageTone={statusTone}
        accessibilityLabel={`Add ${product.name} to cart`}
        accessibilityHint={
          !purchasable
            ? 'This product cannot be purchased right now'
            : configuration.missingRequired.length
              ? 'Required options must be selected first'
              : undefined
        }
      />
    </View>
  );
}
