import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from './GText';
import { GButton } from './GButton';
import { GIcon, type GIconName } from './GIcon';

export type EmptyStateProps = {
  title: string;
  description?: string;
  iconName?: GIconName;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  iconName = 'file-tray-outline',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing['2xl'],
        gap: theme.spacing.sm,
      }}
    >
      <GIcon name={iconName} size="lg" color={theme.colors.text.disabled} />
      <GText variant="titleSm" align="center">
        {title}
      </GText>
      {description ? (
        <GText variant="bodyMd" color="secondary" align="center">
          {description}
        </GText>
      ) : null}
      {actionLabel && onAction ? (
        <GButton title={actionLabel} onPress={onAction} style={{ marginTop: theme.spacing.sm }} />
      ) : null}
    </View>
  );
}
