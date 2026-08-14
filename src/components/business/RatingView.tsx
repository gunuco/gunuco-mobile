import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GIcon } from '../ui/GIcon';
import { GText } from '../ui/GText';

export type RatingViewProps = {
  value: number;
  count?: number | null;
  size?: 'sm' | 'md';
  mode?: 'display' | 'input';
  interactive?: boolean;
  onChange?: (value: number) => void;
  max?: number;
};

export function RatingView({
  value,
  count,
  size = 'sm',
  mode = 'display',
  interactive = false,
  onChange,
  max = 5,
}: RatingViewProps) {
  const theme = useTheme();
  const iconSize = size === 'md' ? 'md' : 'sm';
  const stars = Array.from({ length: max }, (_, index) => index + 1);
  const isInput = mode === 'input' || interactive;

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}
      accessibilityRole={isInput ? 'adjustable' : 'text'}
      accessibilityLabel={
        isInput
          ? `Rating ${value} of ${max}`
          : typeof count === 'number'
            ? `Rated ${value} out of ${max} from ${count} reviews`
            : `Rated ${value} out of ${max}`
      }
      accessibilityValue={isInput ? { min: 1, max, now: value } : undefined}
    >
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

          if (!isInput) {
            return <View key={star}>{icon}</View>;
          }

          return (
            <Pressable
              key={star}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${star} stars`}
              accessibilityState={{ selected: star === value }}
              onPress={() => onChange?.(star)}
              hitSlop={4}
              style={{
                minWidth: theme.dimensions.touchMin,
                minHeight: theme.dimensions.touchMin,
                alignItems: 'center',
                justifyContent: 'center',
              }}
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
