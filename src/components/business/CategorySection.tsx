import React, { memo } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '@/src/providers';
import type { CategorySummary } from '@/src/types';
import { Section } from '../layout/Section';
import { Skeleton } from '../ui/Skeleton';
import { CategoryCard } from './CategoryCard';

export type CategorySectionProps = {
  title: string;
  subtitle?: string;
  categories: CategorySummary[];
  loading?: boolean;
  onCategoryPress?: (category: CategorySummary) => void;
  onSeeAllPress?: () => void;
};

function CategorySectionComponent({
  title,
  subtitle,
  categories,
  loading,
  onCategoryPress,
  onSeeAllPress,
}: CategorySectionProps) {
  const theme = useTheme();

  if (!loading && categories.length === 0) {
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
          <Skeleton
            width={theme.dimensions.categoryCard.width}
            height={theme.dimensions.categoryCard.skeletonHeight}
            borderRadius={theme.radius.lg}
          />
          <Skeleton
            width={theme.dimensions.categoryCard.width}
            height={theme.dimensions.categoryCard.skeletonHeight}
            borderRadius={theme.radius.lg}
          />
          <Skeleton
            width={theme.dimensions.categoryCard.width}
            height={theme.dimensions.categoryCard.skeletonHeight}
            borderRadius={theme.radius.lg}
          />
        </View>
      ) : (
        <View style={{ height: theme.dimensions.catalogRowHeight }}>
          <FlashList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
            ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
            renderItem={({ item }) => (
              <CategoryCard category={item} onPress={() => onCategoryPress?.(item)} />
            )}
          />
        </View>
      )}
    </Section>
  );
}

export const CategorySection = memo(CategorySectionComponent);
