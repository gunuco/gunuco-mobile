import React, { memo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { ProductSummary } from '@/src/types';
import { GImage } from '../ui/GImage';
import { GText } from '../ui/GText';
import { GBadge } from '../ui/GBadge';
import { PriceDisplay } from './PriceDisplay';
import { RatingView } from './RatingView';
import { WishlistButton } from './WishlistButton';

export type ProductCardVariant = 'grid' | 'list' | 'compact';

export type ProductCardProps = {
  product: ProductSummary;
  variant?: ProductCardVariant;
  showRating?: boolean;
  showDiscount?: boolean;
  showAddButton?: boolean;
  showWishlist?: boolean;
  onPress?: () => void;
  onAddPress?: () => void;
  onNotifyPress?: () => void;
  wishlisted?: boolean;
  width?: number;
};

function ProductCardComponent({
  product,
  variant = 'grid',
  showRating = true,
  showDiscount = true,
  showAddButton = true,
  showWishlist = true,
  onPress,
  onAddPress,
  onNotifyPress,
  wishlisted,
  width,
}: ProductCardProps) {
  const theme = useTheme();
  const [imageWidth, setImageWidth] = useState(width ?? 0);
  const unavailable = product.isAvailable === false;
  const isList = variant === 'list';
  const resolvedImageWidth = isList
    ? theme.dimensions.productImage.thumb
    : variant === 'compact'
      ? 96
      : imageWidth || theme.dimensions.productImage.card;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.name}
      onPress={onPress}
      style={{
        flex: variant === 'grid' && !width ? 1 : undefined,
        width: width,
      }}
    >
      <View style={{ gap: theme.spacing.sm }}>
        <View
          onLayout={(event) => {
            if (!isList && variant !== 'compact') {
              const next = Math.round(event.nativeEvent.layout.width);
              if (next > 0 && next !== imageWidth) {
                setImageWidth(next);
              }
            }
          }}
          style={{
            width: isList ? resolvedImageWidth : '100%',
            aspectRatio: isList ? undefined : 1,
            borderRadius: theme.radius.xl,
            overflow: 'hidden',
            backgroundColor: theme.colors.bg.surfaceMuted,
          }}
        >
          <GImage
            uri={product.imageUrl}
            width={resolvedImageWidth}
            height={isList ? resolvedImageWidth : resolvedImageWidth}
            borderRadius={theme.radius.xl}
            accessibilityLabel={product.name}
          />
          {unavailable ? (
            <View style={{ position: 'absolute', top: theme.spacing.sm, left: theme.spacing.sm }}>
              <GBadge label="Sold out" />
            </View>
          ) : product.badgeLabel ? (
            <View style={{ position: 'absolute', top: theme.spacing.sm, left: theme.spacing.sm }}>
              <GBadge label={product.badgeLabel} variant={product.isPremium ? 'premium' : 'info'} />
            </View>
          ) : product.isPremium ? (
            <View style={{ position: 'absolute', top: theme.spacing.sm, left: theme.spacing.sm }}>
              <GBadge label="Premium" variant="premium" />
            </View>
          ) : null}
          {showWishlist ? (
            <WishlistButton
              productId={product.id}
              initialWishlisted={wishlisted ?? product.isWishlisted}
              overlay
              size="sm"
            />
          ) : null}
          {showAddButton ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                unavailable ? `Notify when ${product.name} is available` : `Add ${product.name}`
              }
              disabled={unavailable ? !onNotifyPress : !onAddPress}
              onPress={(event) => {
                event.stopPropagation?.();
                if (unavailable) {
                  onNotifyPress?.();
                  return;
                }
                onAddPress?.();
              }}
              style={{
                position: 'absolute',
                right: theme.spacing.sm,
                bottom: theme.spacing.sm,
                minHeight: 32,
                paddingHorizontal: theme.spacing.md,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.bg.surface,
                borderWidth: 1.5,
                borderColor: theme.colors.brand.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GText variant="label" color="brand">
                {unavailable ? 'Notify' : 'ADD'}
              </GText>
            </Pressable>
          ) : null}
        </View>

        <View style={{ gap: 4 }}>
          <PriceDisplay
            pricePaise={product.pricePaise}
            compareAtPricePaise={product.compareAtPricePaise}
            size="sm"
            pill
          />
          {showDiscount && product.discountLabel ? (
            <GText variant="caption" color="success">
              {product.discountLabel}
            </GText>
          ) : null}
          <GText variant="label" numberOfLines={2}>
            {product.name}
          </GText>
          {product.weightLabel ? (
            <GText variant="caption" color="secondary">
              {product.weightLabel}
            </GText>
          ) : null}
          {showRating && typeof product.ratingAverage === 'number' ? (
            <RatingView value={product.ratingAverage} count={product.ratingCount} compact />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardComponent);
