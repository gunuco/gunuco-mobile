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
  illustration?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  iconName = 'file-tray-outline',
  illustration,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing['2xl'],
        paddingVertical: theme.spacing['3xl'],
        maxWidth: 420,
        alignSelf: 'center',
        width: '100%',
        gap: theme.spacing.sm,
        flexGrow: 1,
      }}
    >
      {illustration ?? <GIcon name={iconName} size="lg" color={theme.colors.text.disabled} />}
      <GText variant="titleSm" align="center">
        {title}
      </GText>
      {description ? (
        <GText variant="bodyMd" color="secondary" align="center">
          {description}
        </GText>
      ) : null}
      {actionLabel && onAction ? (
        <GButton
          title={actionLabel}
          onPress={onAction}
          fullWidth
          style={{ marginTop: theme.spacing.sm, borderRadius: theme.radius.pill }}
        />
      ) : null}
    </View>
  );
}
