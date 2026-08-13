import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { ProductSummary } from '@/src/types';
import { GCard } from '../ui/GCard';
import { GImage } from '../ui/GImage';
import { GText } from '../ui/GText';
import { GBadge } from '../ui/GBadge';
import { GButton } from '../ui/GButton';
import { GIcon } from '../ui/GIcon';
import { PriceDisplay } from './PriceDisplay';
import { RatingView } from './RatingView';

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
  onWishlistPress?: () => void;
  wishlisted?: boolean;
};

export function ProductCard({
  product,
  variant = 'grid',
  showRating = true,
  showDiscount = true,
  showAddButton = true,
  showWishlist = true,
  onPress,
  onAddPress,
  onWishlistPress,
  wishlisted = false,
}: ProductCardProps) {
  const theme = useTheme();
  const imageSize =
    variant === 'list'
      ? theme.dimensions.productImage.thumb
      : variant === 'compact'
        ? 96
        : theme.dimensions.productImage.card;
  const unavailable = product.isAvailable === false;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.name}
      onPress={onPress}
      style={{ flex: variant === 'grid' ? 1 : undefined }}
    >
      <GCard
        padded={variant !== 'list'}
        style={{
          opacity: unavailable ? 0.55 : 1,
          flexDirection: variant === 'list' ? 'row' : 'column',
          gap: theme.spacing.sm,
        }}
      >
        <View>
          <GImage
            uri={product.imageUrl}
            width={imageSize}
            height={imageSize}
            accessibilityLabel={product.name}
          />
          {showWishlist ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onPress={onWishlistPress}
              hitSlop={8}
              style={{
                position: 'absolute',
                top: theme.spacing.xs,
                right: theme.spacing.xs,
                backgroundColor: theme.colors.bg.surface,
                borderRadius: theme.radius.pill,
                padding: theme.spacing.xs,
              }}
            >
              <GIcon
                name={wishlisted ? 'heart' : 'heart-outline'}
                color={wishlisted ? theme.colors.semantic.danger : theme.colors.text.secondary}
                size="sm"
              />
            </Pressable>
          ) : null}
        </View>

        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          {product.isPremium ? <GBadge label="GUNUCO PREMIUM" variant="premium" /> : null}
          <GText variant="label" numberOfLines={2}>
            {product.name}
          </GText>
          {showRating && typeof product.ratingAverage === 'number' ? (
            <RatingView value={product.ratingAverage} count={product.ratingCount} />
          ) : null}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: theme.spacing.sm,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <PriceDisplay
                pricePaise={product.pricePaise}
                compareAtPricePaise={product.compareAtPricePaise}
                size="sm"
              />
              {showDiscount && product.discountLabel ? (
                <GBadge label={product.discountLabel} variant="discount" />
              ) : null}
            </View>
            {showAddButton ? (
              <GButton
                title="Add"
                size="sm"
                disabled={unavailable}
                onPress={onAddPress}
                accessibilityLabel={`Add ${product.name}`}
              />
            ) : null}
          </View>
          {unavailable ? (
            <GText variant="caption" color="danger">
              Currently unavailable
            </GText>
          ) : null}
        </View>
      </GCard>
    </Pressable>
  );
}
