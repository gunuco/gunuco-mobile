import React, { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { Skeleton } from '../ui/Skeleton';

function ProductListSkeletonComponent({ count = 6 }: { count?: number }) {
  const theme = useTheme();
  const items = Array.from({ length: count });

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.md,
      }}
    >
      {items.map((_, index) => (
        <Skeleton
          key={`product-skel-${index}`}
          width="47%"
          height={220}
          borderRadius={theme.radius.lg}
        />
      ))}
    </View>
  );
}

export const ProductListSkeleton = memo(ProductListSkeletonComponent);
