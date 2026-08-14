import React, { memo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useTheme } from '@/src/providers';
import { Skeleton } from '../ui/Skeleton';

function ProductDetailSkeletonComponent() {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Skeleton width={width} height={theme.dimensions.productImage.hero} borderRadius={0} />

      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
        <Skeleton height={28} width="80%" borderRadius={theme.radius.md} />
        <Skeleton height={16} width="40%" borderRadius={theme.radius.md} />
        <Skeleton height={24} width="50%" borderRadius={theme.radius.md} />
        <Skeleton height={18} width="30%" borderRadius={theme.radius.md} />
      </View>

      <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm }}>
        <Skeleton height={16} width="24%" borderRadius={theme.radius.md} />
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
          <Skeleton
            height={theme.dimensions.touchMin}
            width={96}
            borderRadius={theme.radius.pill}
          />
        </View>
      </View>

      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
        <Skeleton height={16} width="28%" borderRadius={theme.radius.md} />
        <Skeleton height={theme.dimensions.touchMin} width={140} borderRadius={theme.radius.lg} />
      </View>

      <View
        style={{
          marginTop: 'auto',
          padding: theme.spacing.lg,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.default,
        }}
      >
        <Skeleton height={theme.dimensions.buttonHeight.lg} borderRadius={theme.radius.lg} />
      </View>
    </View>
  );
}

export const ProductDetailSkeleton = memo(ProductDetailSkeletonComponent);
