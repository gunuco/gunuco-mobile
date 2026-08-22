import { useTheme } from '@/src/providers';
import type { CategorySummary } from '@/src/types';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { GImage } from '../ui/GImage';
import { GText } from '../ui/GText';

export type CategoryCardProps = {
  category: CategorySummary;
  onPress?: () => void;
  width?: number;
  featured?: boolean;
};

function CategoryCardComponent({ category, onPress, width, featured = false }: CategoryCardProps) {
  const theme = useTheme();
  const cardWidth = width ?? theme.dimensions.categoryCard.width;
  const imageHeight = featured ? Math.round(cardWidth * 0.72) : Math.round(cardWidth * 0.92);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={category.name}
      onPress={onPress}
      style={{ width: cardWidth }}
    >
      <View
        style={{
          // backgroundColor: theme.colors.bg.surfaceMuted,
          borderRadius: theme.radius.xl,
          overflow: 'hidden',
          padding: theme.spacing.xs,
          gap: theme.spacing.sm,
        }}
      >
        <GImage
          uri={category.imageUrl}
          width={cardWidth - theme.spacing.xs * 2}
          height={imageHeight}
          borderRadius={theme.radius.lg}
          accessibilityLabel={category.name}
        />
        <GText variant="label" align="center" numberOfLines={2} style={{ paddingHorizontal: 4 }}>
          {category.name}
        </GText>
      </View>
    </Pressable>
  );
}

export const CategoryCard = memo(CategoryCardComponent);
