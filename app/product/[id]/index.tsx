import React, { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth, useProductConfiguration } from '@/src/hooks';
import { useAddCartItemMutation, useGetProductOptionsQuery, useGetProductQuery } from '@/src/store';
import { getErrorMessage, isNotFoundError } from '@/src/utils/errors';
import {
  getAvailabilityMessage,
  getProductImages,
  getProductOffer,
  toCartOptions,
} from '@/src/utils/productDetail';
import { productReviewsHref } from '@/src/utils/navigation';
import {
  EmptyState,
  ErrorState,
  GBadge,
  GButton,
  GDivider,
  GText,
  Header,
  PriceDisplay,
  ProductDetailSkeleton,
  ProductImageGallery,
  ProductOptionRenderer,
  QuantitySelector,
  RatingView,
  Skeleton,
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
  const [addCartItem, addCartState] = useAddCartItemMutation();

  const optionsUnavailable = isNotFoundError(optionsQuery.error);
  const optionsFailed = optionsQuery.isError && !optionsUnavailable;
  const optionsResponse = optionsUnavailable ? { groups: [] } : optionsQuery.data;

  const configuration = useProductConfiguration(productId, product, optionsResponse);
  const optionsPending = optionsQuery.isLoading && !configuration.groups.length;

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
        <Header
          title="Product"
          showBack
          onBackPress={goBack}
          rightSlot={<WishlistButton productId={productId} onError={setWishlistError} />}
        />
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header
        title={product.name}
        showBack
        onBackPress={goBack}
        rightSlot={
          <WishlistButton
            productId={product.id}
            initialWishlisted={product.isWishlisted}
            onError={setWishlistError}
          />
        }
      />

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <ProductImageGallery images={images} productName={product.name} />

        <View
          style={{
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            gap: theme.spacing.sm,
          }}
        >
          {product.isPremium ? <GBadge label="GUNUCO PREMIUM" variant="premium" /> : null}
          {product.category?.name ? (
            <GText variant="caption" color="secondary">
              {product.category.name}
            </GText>
          ) : null}
          <GText variant="titleMd">{product.name}</GText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See product reviews"
            onPress={() => router.push(productReviewsHref(product.id))}
            hitSlop={8}
            style={{ gap: theme.spacing.xs }}
          >
            {showRating ? (
              <RatingView
                value={product.ratingAverage ?? 0}
                count={product.ratingCount}
                size="md"
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
            />
            {configuration.displayedPrice.discountLabel ? (
              <GBadge label={configuration.displayedPrice.discountLabel} variant="discount" />
            ) : null}
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
            paddingHorizontal: theme.spacing.lg,
            marginTop: theme.spacing.xl,
            gap: theme.spacing.sm,
          }}
        >
          <GText variant="label">Quantity</GText>
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
            <GText variant="label">Description</GText>
            <GText variant="bodyMd">{descriptionText}</GText>
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

        {infoSections.length ? (
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              marginTop: theme.spacing.xl,
              gap: theme.spacing.md,
            }}
          >
            <GText variant="label">Product information</GText>
            {infoSections.map((section, index) => (
              <View
                key={section.id ?? `${section.title}-${index}`}
                style={{ gap: theme.spacing.xs }}
              >
                {index > 0 ? <GDivider /> : null}
                <GText variant="label">{section.title}</GText>
                <GText variant="bodyMd" color="secondary">
                  {section.body}
                </GText>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.default,
          backgroundColor: theme.colors.bg.surface,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.md,
          gap: theme.spacing.sm,
          ...theme.shadows.sm,
        }}
      >
        <PriceDisplay
          pricePaise={configuration.displayedPrice.pricePaise}
          compareAtPricePaise={configuration.displayedPrice.compareAtPricePaise}
          size="md"
        />
        {wishlistError ? (
          <GText variant="bodySm" color="danger">
            {wishlistError}
          </GText>
        ) : null}
        {cartMessage ? (
          <GText variant="bodySm" color={cartMessage.tone === 'success' ? 'success' : 'danger'}>
            {cartMessage.text}
          </GText>
        ) : null}
        <GButton
          title="Add to Cart"
          size="lg"
          fullWidth
          loading={adding}
          disabled={ctaDisabled}
          onPress={() => {
            void onAddToCart();
          }}
          accessibilityLabel={`Add ${product.name} to cart`}
          accessibilityHint={
            !purchasable
              ? 'This product cannot be purchased right now'
              : configuration.missingRequired.length
                ? 'Required options must be selected first'
                : undefined
          }
        />
        {cartMessage?.tone === 'success' ? (
          <GButton
            title="View cart"
            variant="ghost"
            fullWidth
            onPress={() => router.push('/(tabs)/cart')}
          />
        ) : null}
      </View>
    </View>
  );
}
