import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '@/src/providers';
import type { CategorySummary } from '@/src/types';
import { Section } from '../layout/Section';
import { Skeleton } from '../ui/Skeleton';
import { GText } from '../ui/GText';
import { CategoryCard } from './CategoryCard';

export type CategorySectionProps = {
  title: string;
  subtitle?: string;
  categories: CategorySummary[];
  loading?: boolean;
  compact?: boolean;
  seeAllPosition?: 'header' | 'below';
  onCategoryPress?: (category: CategorySummary) => void;
  onSeeAllPress?: () => void;
};

function CategorySectionComponent({
  title,
  subtitle,
  categories,
  loading,
  compact = false,
  seeAllPosition = 'header',
  onCategoryPress,
  onSeeAllPress,
}: CategorySectionProps) {
  const theme = useTheme();
  const cardWidth = compact
    ? Math.round(theme.dimensions.categoryCard.width * 0.72)
    : theme.dimensions.categoryCard.width;

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <Section
      title={title}
      subtitle={subtitle}
      actionLabel={seeAllPosition === 'header' && onSeeAllPress ? 'See all' : undefined}
      onActionPress={seeAllPosition === 'header' ? onSeeAllPress : undefined}
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
            width={cardWidth}
            height={theme.dimensions.categoryCard.skeletonHeight}
            borderRadius={theme.radius.lg}
          />
          <Skeleton
            width={cardWidth}
            height={theme.dimensions.categoryCard.skeletonHeight}
            borderRadius={theme.radius.lg}
          />
          <Skeleton
            width={cardWidth}
            height={theme.dimensions.categoryCard.skeletonHeight}
            borderRadius={theme.radius.lg}
          />
        </View>
      ) : (
        <View style={{ height: compact ? cardWidth + 56 : theme.dimensions.catalogRowHeight }}>
          <FlashList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
            ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                width={cardWidth}
                onPress={() => onCategoryPress?.(item)}
              />
            )}
          />
        </View>
      )}
      {seeAllPosition === 'below' && onSeeAllPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}
          onPress={onSeeAllPress}
          hitSlop={8}
          style={{ alignItems: 'center', paddingTop: theme.spacing.xs }}
        >
          <GText variant="label" color="brand">
            See all
          </GText>
        </Pressable>
      ) : null}
    </Section>
  );
}

export const CategorySection = memo(CategorySectionComponent);
