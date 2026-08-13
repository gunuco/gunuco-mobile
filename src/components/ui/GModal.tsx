import React from 'react';
import {
  Modal as RNModal,
  Pressable,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from '../ui/GText';
import { GIcon } from '../ui/GIcon';

export type GModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function GModal({ visible, onClose, title, children, contentStyle }: GModalProps) {
  const theme = useTheme();

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay.scrim,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.lg,
        }}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close modal"
        />
        <View
          style={[
            {
              width: '100%',
              maxWidth: 420,
              backgroundColor: theme.colors.bg.surface,
              borderRadius: theme.radius.xl,
              padding: theme.spacing.lg,
              gap: theme.spacing.md,
              ...theme.shadows.lg,
            },
            contentStyle,
          ]}
        >
          {title ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <GText variant="titleSm" style={{ flex: 1 }}>
                {title}
              </GText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={onClose}
                hitSlop={8}
              >
                <GIcon name="close" />
              </Pressable>
            </View>
          ) : null}
          {children}
        </View>
      </View>
    </RNModal>
  );
}
