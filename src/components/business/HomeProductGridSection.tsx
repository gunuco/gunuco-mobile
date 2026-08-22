import React, { memo, useMemo } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { ProductSummary } from '@/src/types';
import { GText } from '../ui/GText';
import { ProductCard } from './ProductCard';

export type HomeProductGridSectionProps = {
  title?: string;
  products: ProductSummary[];
  maxItems?: number;
  columns?: number;
  onProductPress?: (product: ProductSummary) => void;
  onAddPress?: (product: ProductSummary) => void;
  onSeeAllPress?: () => void;
};

function HomeProductGridSectionComponent({
  title,
  products,
  maxItems = 6,
  columns = 3,
  onProductPress,
  onAddPress,
  onSeeAllPress,
}: HomeProductGridSectionProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const visibleProducts = useMemo(() => products.slice(0, maxItems), [maxItems, products]);
  if (visibleProducts.length === 0) {
    return null;
  }

  const gap = theme.spacing.sm;
  const horizontalPad = theme.spacing.lg * 2;
  const cardWidth = Math.floor((width - horizontalPad - gap * (columns - 1)) / columns);

  return (
    <View style={{ gap: theme.spacing.md }}>
      {title ? (
        <GText variant="titleSm" style={{ paddingHorizontal: theme.spacing.lg }}>
          {title}
        </GText>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: theme.spacing.lg,
          gap,
        }}
      >
        {visibleProducts.map((product) => (
          <View key={product.id} style={{ width: cardWidth }}>
            <ProductCard
              product={product}
              variant="grid"
              width={cardWidth}
              layout="home"
              showWishlist
              showAddButton
              showDiscount={false}
              onPress={() => onProductPress?.(product)}
              onAddPress={() => onAddPress?.(product)}
            />
          </View>
        ))}
      </View>

      {onSeeAllPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title ? `See all ${title}` : 'See all'}
          onPress={onSeeAllPress}
          hitSlop={8}
          style={{ alignItems: 'center', paddingVertical: theme.spacing.xs }}
        >
          <GText variant="label" color="brand">
            See all
          </GText>
        </Pressable>
      ) : null}
    </View>
  );
}

export const HomeProductGridSection = memo(HomeProductGridSectionComponent);
