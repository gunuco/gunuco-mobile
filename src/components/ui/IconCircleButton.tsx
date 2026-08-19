import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GIcon, type GIconName } from './GIcon';

export type IconCircleButtonProps = {
  iconName: GIconName;
  accessibilityLabel: string;
  onPress?: () => void;
  overlay?: boolean;
};

export function IconCircleButton({
  iconName,
  accessibilityLabel,
  onPress,
  overlay = true,
}: IconCircleButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={6}
      style={{
        width: theme.dimensions.touchMin,
        height: theme.dimensions.touchMin,
        borderRadius: theme.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.bg.surface,
        ...(overlay ? theme.shadows.sm : null),
      }}
    >
      <View>
        <GIcon name={iconName} size="md" color={theme.colors.text.primary} />
      </View>
    </Pressable>
  );
}
