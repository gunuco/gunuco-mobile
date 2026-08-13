import React from 'react';
import { View } from 'react-native';
import { GLoader } from '@/src/components/ui/GLoader';
import { GText } from '@/src/components/ui/GText';
import { useTheme } from '@/src/providers';
import { APP_NAME } from '@/src/constants';

export function BootstrapScreen() {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.bg.canvas,
        gap: theme.spacing.md,
        padding: theme.spacing.lg,
      }}
    >
      <GText variant="display">{APP_NAME}</GText>
      <GText variant="bodyMd" color="secondary">
        Restoring your session…
      </GText>
      <GLoader size="large" />
    </View>
  );
}
