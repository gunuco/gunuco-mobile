import React, { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { Skeleton } from '../ui/Skeleton';

function CartSkeletonComponent({ count = 3 }: { count?: number }) {
  const theme = useTheme();
  const items = Array.from({ length: count });

  return (
    <View style={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
      {items.map((_, index) => (
        <View key={`cart-skel-${index}`} style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <Skeleton
            width={theme.dimensions.productImage.thumb}
            height={theme.dimensions.productImage.thumb}
            borderRadius={theme.radius.lg}
          />
          <View style={{ flex: 1, gap: theme.spacing.sm }}>
            <Skeleton width="80%" height={16} />
            <Skeleton width="50%" height={12} />
            <Skeleton width="40%" height={14} />
          </View>
        </View>
      ))}
      <Skeleton width="100%" height={88} borderRadius={theme.radius.lg} />
      <Skeleton width="100%" height={120} borderRadius={theme.radius.lg} />
    </View>
  );
}

export const CartSkeleton = memo(CartSkeletonComponent);
