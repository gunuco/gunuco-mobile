import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from '../ui/GText';

export type SectionProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Section({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  children,
  style,
}: SectionProps) {
  const theme = useTheme();

  return (
    <View style={[{ gap: theme.spacing.md }, style]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        <View style={{ flex: 1, gap: theme.spacing.xxs }}>
          <GText variant="titleSm">{title}</GText>
          {subtitle ? (
            <GText variant="bodySm" color="secondary">
              {subtitle}
            </GText>
          ) : null}
        </View>
        {actionLabel && onActionPress ? (
          <Pressable accessibilityRole="button" onPress={onActionPress} hitSlop={8}>
            <GText variant="label" color="brand">
              {actionLabel}
            </GText>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}
