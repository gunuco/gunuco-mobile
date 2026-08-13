import React from 'react';
import { Pressable, View, TextInput, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/providers';
import { GIcon } from './GIcon';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
  editable?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search GUNUCO',
  onSubmit,
  onClear,
  editable = true,
  onPress,
  style,
}: SearchBarProps) {
  const theme = useTheme();

  const content = (
    <View
      style={[
        {
          minHeight: theme.dimensions.inputHeight,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.bg.surface,
          borderWidth: 1,
          borderColor: theme.colors.border.default,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        style,
      ]}
    >
      <GIcon name="search-outline" color={theme.colors.text.secondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.disabled}
        editable={editable && !onPress}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        accessibilityRole="search"
        style={[
          {
            flex: 1,
            color: theme.colors.text.primary,
            paddingVertical: theme.spacing.sm,
            ...theme.typography.bodyMd,
          },
        ]}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
        >
          <GIcon name="close-circle" color={theme.colors.text.disabled} />
        </Pressable>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}
