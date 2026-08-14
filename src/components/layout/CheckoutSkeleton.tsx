import React, { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { Skeleton } from '../ui/Skeleton';

function CheckoutSkeletonComponent() {
  const theme = useTheme();

  return (
    <View style={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
      <Skeleton width="100%" height={48} borderRadius={theme.radius.lg} />
      <Skeleton width="100%" height={120} borderRadius={theme.radius.lg} />
      <Skeleton width="100%" height={88} borderRadius={theme.radius.lg} />
      <Skeleton width="100%" height={160} borderRadius={theme.radius.lg} />
      <Skeleton width="100%" height={120} borderRadius={theme.radius.lg} />
    </View>
  );
}

export const CheckoutSkeleton = memo(CheckoutSkeletonComponent);
