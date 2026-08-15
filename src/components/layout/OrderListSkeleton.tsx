import React, { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { Skeleton } from '../ui/Skeleton';

function OrderListSkeletonComponent({ count = 4 }: { count?: number }) {
  const theme = useTheme();
  const items = Array.from({ length: count });

  return (
    <View style={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
      {items.map((_, index) => (
        <View key={`order-skel-${index}`} style={{ gap: theme.spacing.sm }}>
          <Skeleton width="40%" height={14} />
          <Skeleton width="100%" height={88} borderRadius={theme.radius.lg} />
        </View>
      ))}
    </View>
  );
}

export const OrderListSkeleton = memo(OrderListSkeletonComponent);
