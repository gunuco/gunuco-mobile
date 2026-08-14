import React, { memo } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '@/src/providers';
import type { ProductSummary } from '@/src/types';
import { Section } from '../layout/Section';
import { Skeleton } from '../ui/Skeleton';
import { ProductCard } from './ProductCard';

export type ProductCarouselProps = {
  title: string;
  subtitle?: string;
  products: ProductSummary[];
  loading?: boolean;
  onProductPress?: (product: ProductSummary) => void;
  onAddPress?: (product: ProductSummary) => void;
  onSeeAllPress?: () => void;
  showWishlist?: boolean;
  showAddButton?: boolean;
};

function ProductCarouselComponent({
  title,
  subtitle,
  products,
  loading,
  onProductPress,
  onAddPress,
  onSeeAllPress,
  showWishlist = true,
  showAddButton = false,
}: ProductCarouselProps) {
  const theme = useTheme();
  const cardWidth = theme.dimensions.productImage.card + theme.spacing.md * 2;

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <Section
      title={title}
      subtitle={subtitle}
      actionLabel={onSeeAllPress ? 'See all' : undefined}
      onActionPress={onSeeAllPress}
    >
      {loading ? (
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
        >
          <Skeleton width={cardWidth} height={260} borderRadius={theme.radius.lg} />
          <Skeleton width={cardWidth} height={260} borderRadius={theme.radius.lg} />
        </View>
      ) : (
        <View style={{ minHeight: theme.dimensions.productCarouselMinHeight }}>
          <FlashList
            data={products}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
            ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
            renderItem={({ item }) => (
              <View style={{ width: cardWidth }}>
                <ProductCard
                  product={item}
                  variant="grid"
                  showWishlist={showWishlist}
                  showAddButton={showAddButton}
                  onPress={() => onProductPress?.(item)}
                  onAddPress={() => onAddPress?.(item)}
                />
              </View>
            )}
          />
        </View>
      )}
    </Section>
  );
}

export const ProductCarousel = memo(ProductCarouselComponent);
