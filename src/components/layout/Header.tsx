import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { GText } from '../ui/GText';
import { GIcon } from '../ui/GIcon';

export type HeaderProps = {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightSlot?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleAlign?: 'left' | 'center';
  bordered?: boolean;
  transparent?: boolean;
};

export function Header({
  title,
  showBack,
  onBackPress,
  rightSlot,
  style,
  titleAlign = 'left',
  bordered = true,
  transparent = false,
}: HeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          paddingTop: insets.top + theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          minHeight: theme.dimensions.headerHeight + insets.top,
          backgroundColor: transparent ? 'transparent' : theme.colors.bg.canvas,
          borderBottomWidth: bordered ? 1 : 0,
          borderBottomColor: theme.colors.border.default,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        style,
      ]}
    >
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBackPress}
          hitSlop={8}
          style={{
            width: theme.dimensions.touchMin,
            height: theme.dimensions.touchMin,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GIcon name="chevron-back" />
        </Pressable>
      ) : null}
      <GText variant="titleMd" style={{ flex: 1, textAlign: titleAlign }} numberOfLines={1}>
        {title}
      </GText>
      {rightSlot}
    </View>
  );
}
