import React, { memo, useCallback } from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '@/src/providers';
import type { ProductSummary } from '@/src/types';
import { ProductCard } from './ProductCard';
import { GLoader } from '../ui/GLoader';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';

export type ProductGridListProps = {
  products: ProductSummary[];
  loading?: boolean;
  refreshing?: boolean;
  loadingMore?: boolean;
  errorMessage?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  showWishlist?: boolean;
  showAddButton?: boolean;
  onRefresh?: () => void;
  onRetry?: () => void;
  onEndReached?: () => void;
  onProductPress?: (product: ProductSummary) => void;
  onAddPress?: (product: ProductSummary) => void;
  onNotifyPress?: (product: ProductSummary) => void;
  ListHeaderComponent?: React.ReactElement | null;
};

function ProductGridListComponent({
  products,
  loading,
  refreshing,
  loadingMore,
  errorMessage,
  emptyTitle = 'No products found',
  emptyDescription = 'Try a different filter or check back soon.',
  showWishlist = true,
  showAddButton = false,
  onRefresh,
  onRetry,
  onEndReached,
  onProductPress,
  onAddPress,
  onNotifyPress,
  ListHeaderComponent,
}: ProductGridListProps) {
  const theme = useTheme();

  const renderItem = useCallback(
    ({ item }: { item: ProductSummary }) => (
      <View style={{ flex: 1, padding: theme.spacing.sm }}>
        <ProductCard
          product={item}
          variant="grid"
          showWishlist={showWishlist}
          showAddButton={showAddButton}
          onPress={() => onProductPress?.(item)}
          onAddPress={() => onAddPress?.(item)}
          onNotifyPress={() => onNotifyPress?.(item)}
        />
      </View>
    ),
    [onAddPress, onNotifyPress, onProductPress, showAddButton, showWishlist, theme.spacing.sm],
  );

  if (errorMessage && products.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        {ListHeaderComponent}
        <ErrorState message={errorMessage} onRetry={onRetry} />
      </View>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        {ListHeaderComponent}
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          iconName="storefront-outline"
        />
      </View>
    );
  }

  return (
    <FlashList
      data={products}
      numColumns={2}
      style={{ flex: 1 }}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        loadingMore ? (
          <View style={{ paddingVertical: theme.spacing.lg }}>
            <GLoader />
          </View>
        ) : (
          <View style={{ height: theme.spacing['3xl'] }} />
        )
      }
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.sm,
        paddingTop: theme.spacing.sm,
      }}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.brand.primary}
            colors={[theme.colors.brand.primary]}
          />
        ) : undefined
      }
    />
  );
}

export const ProductGridList = memo(ProductGridListComponent);
