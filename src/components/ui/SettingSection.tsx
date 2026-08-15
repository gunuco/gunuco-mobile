import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from './GText';
import { GCard } from './GCard';

export type SettingSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function SettingSection({ title, children }: SettingSectionProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <GText variant="label">{title}</GText>
      <GCard style={{ gap: theme.spacing.xs }}>{children}</GCard>
    </View>
  );
}
