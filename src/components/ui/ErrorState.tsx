import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from './GText';
import { GButton } from './GButton';
import { GIcon } from './GIcon';

export type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
  onRetry,
  retryLabel = 'Retry',
}: ErrorStateProps) {
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
      <GIcon name="alert-circle-outline" size="lg" color={theme.colors.semantic.danger} />
      <GText variant="titleSm" align="center">
        {title}
      </GText>
      <GText variant="bodyMd" color="secondary" align="center">
        {message}
      </GText>
      {onRetry ? (
        <GButton
          title={retryLabel}
          variant="secondary"
          onPress={onRetry}
          style={{ marginTop: theme.spacing.sm }}
        />
      ) : null}
    </View>
  );
}
