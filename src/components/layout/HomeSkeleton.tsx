import React, { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { Skeleton } from '../ui/Skeleton';
import { Section } from './Section';

function HomeSkeletonComponent() {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing['2xl'], paddingBottom: theme.spacing['3xl'] }}>
      <View style={{ paddingHorizontal: theme.spacing.lg }}>
        <Skeleton height={140} borderRadius={theme.radius.xl} />
      </View>

      <Section title="Categories">
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
        >
          <Skeleton width={120} height={140} borderRadius={theme.radius.lg} />
          <Skeleton width={120} height={140} borderRadius={theme.radius.lg} />
          <Skeleton width={120} height={140} borderRadius={theme.radius.lg} />
        </View>
      </Section>

      <Section title="Featured">
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
        >
          <Skeleton width={160} height={240} borderRadius={theme.radius.lg} />
          <Skeleton width={160} height={240} borderRadius={theme.radius.lg} />
        </View>
      </Section>
    </View>
  );
}

export const HomeSkeleton = memo(HomeSkeletonComponent);
