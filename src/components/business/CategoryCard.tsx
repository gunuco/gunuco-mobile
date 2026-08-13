import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '@/src/providers';
import type { CategorySummary } from '@/src/types';
import { GCard } from '../ui/GCard';
import { GImage } from '../ui/GImage';
import { GText } from '../ui/GText';

export type CategoryCardProps = {
  category: CategorySummary;
  onPress?: () => void;
};

function CategoryCardComponent({ category, onPress }: CategoryCardProps) {
  const theme = useTheme();

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={category.name} onPress={onPress}>
      <GCard style={{ width: 120, alignItems: 'center', gap: theme.spacing.sm }}>
        <GImage
          uri={category.imageUrl}
          width={72}
          height={72}
          borderRadius={theme.radius.md}
          accessibilityLabel={category.name}
        />
        <GText variant="label" align="center" numberOfLines={2}>
          {category.name}
        </GText>
        {typeof category.productCount === 'number' ? (
          <GText variant="caption" color="secondary">
            {category.productCount} items
          </GText>
        ) : null}
      </GCard>
    </Pressable>
  );
}

export const CategoryCard = memo(CategoryCardComponent);
