import React from 'react';
import { Modal, Pressable, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { GText } from './GText';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Lightweight bottom sheet foundation using RN Modal.
 * Can be upgraded to @gorhom/bottom-sheet later if gesture complexity requires it.
 */
export function BottomSheet({ visible, onClose, title, children, contentStyle }: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay.scrim }]}
          onPress={onClose}
          accessibilityLabel="Dismiss sheet"
        />
        <View
          style={[
            {
              backgroundColor: theme.colors.bg.surface,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.md,
              paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
              gap: theme.spacing.md,
              ...theme.shadows.md,
            },
            contentStyle,
          ]}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.border.default,
            }}
          />
          {title ? <GText variant="titleSm">{title}</GText> : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}
