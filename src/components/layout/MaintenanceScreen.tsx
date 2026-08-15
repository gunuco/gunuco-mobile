import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { APP_NAME } from '@/src/constants';
import { GText } from '../ui/GText';
import { GButton } from '../ui/GButton';

export type MaintenanceScreenProps = {
  message?: string | null;
  onRetry: () => void;
  retrying?: boolean;
};

export function MaintenanceScreen({ message, onRetry, retrying }: MaintenanceScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg.canvas,
        paddingTop: insets.top + theme.spacing['3xl'],
        paddingBottom: insets.bottom + theme.spacing['3xl'],
        paddingHorizontal: theme.spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.md,
      }}
    >
      <GText variant="titleLg" align="center">
        {APP_NAME} is temporarily unavailable.
      </GText>
      <GText variant="bodyMd" color="secondary" align="center">
        {message?.trim() || 'Please try again later.'}
      </GText>
      <GButton
        title="Check again"
        variant="secondary"
        onPress={onRetry}
        loading={retrying}
        accessibilityLabel="Check again"
      />
    </View>
  );
}
