import React from 'react';
import { View } from 'react-native';
import { GText } from '@/src/components/ui/GText';
import { useTheme } from '@/src/providers';

/** Lightweight placeholder until feature phases land. */
export function FeaturePlaceholder({ title, description }: { title: string; description: string }) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg.canvas,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
        gap: theme.spacing.sm,
      }}
    >
      <GText variant="titleMd" align="center">
        {title}
      </GText>
      <GText variant="bodyMd" color="secondary" align="center">
        {description}
      </GText>
    </View>
  );
}
