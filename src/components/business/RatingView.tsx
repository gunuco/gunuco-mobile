import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GIcon } from '../ui/GIcon';
import { GText } from '../ui/GText';

export type RatingViewProps = {
  value: number;
  count?: number | null;
  size?: 'sm' | 'md';
  interactive?: boolean;
  onChange?: (value: number) => void;
  max?: number;
};

export function RatingView({
  value,
  count,
  size = 'sm',
  interactive = false,
  onChange,
  max = 5,
}: RatingViewProps) {
  const theme = useTheme();
  const iconSize = size === 'md' ? 'md' : 'sm';
  const stars = Array.from({ length: max }, (_, index) => index + 1);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {stars.map((star) => {
          const filled = star <= Math.round(value);
          const icon = (
            <GIcon
              name={filled ? 'star' : 'star-outline'}
              size={iconSize}
              color={filled ? theme.colors.badge.premium : theme.colors.text.disabled}
            />
          );

          if (!interactive) {
            return <View key={star}>{icon}</View>;
          }

          return (
            <Pressable
              key={star}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${star} stars`}
              onPress={() => onChange?.(star)}
              hitSlop={4}
            >
              {icon}
            </Pressable>
          );
        })}
      </View>
      {typeof count === 'number' ? (
        <GText variant="caption" color="secondary">
          ({count})
        </GText>
      ) : null}
    </View>
  );
}
