import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTheme } from '@/src/providers';
import type { IconSize } from '@/src/design-system';

export type GIconName = ComponentProps<typeof Ionicons>['name'];

export type GIconProps = {
  name: GIconName;
  size?: IconSize | number;
  color?: string;
  accessibilityLabel?: string;
};

export function GIcon({ name, size = 'md', color, accessibilityLabel }: GIconProps) {
  const theme = useTheme();
  const resolvedSize = typeof size === 'number' ? size : theme.dimensions.icon[size];

  return (
    <Ionicons
      name={name}
      size={resolvedSize}
      color={color ?? theme.colors.text.primary}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
