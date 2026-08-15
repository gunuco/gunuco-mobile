import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { APP_NAME } from '@/src/constants';
import { GText } from '../ui/GText';
import { GButton } from '../ui/GButton';

export type ForceUpdateScreenProps = {
  onUpdate?: () => void;
  storeAvailable: boolean;
};

export function ForceUpdateScreen({ onUpdate, storeAvailable }: ForceUpdateScreenProps) {
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
        Update {APP_NAME}
      </GText>
      <GText variant="bodyMd" color="secondary" align="center">
        A new version is required to continue. Please update the app.
      </GText>
      {storeAvailable && onUpdate ? (
        <GButton title="Update App" onPress={onUpdate} accessibilityLabel="Update App" />
      ) : (
        <GText variant="caption" color="secondary" align="center">
          The store link is not available yet. Please update GUNUCO from your app store.
        </GText>
      )}
    </View>
  );
}
