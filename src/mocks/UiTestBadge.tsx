import React from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { env } from '@/src/config';
import { useTheme } from '@/src/providers';
import { GText } from '@/src/components';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { uiTestHref } from '@/src/utils/navigation';
import { setUiTestScenario } from './scenarios';
import { applyUiTestScenarioSideEffects } from './session';

export function UiTestBadge() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const gate = useAppSelector((state) => state.appLifecycle.gate);

  if (!env.uiTestMode) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open UI Test Mode"
      onPress={() => {
        if (gate !== 'none') {
          setUiTestScenario('SUCCESS');
          void applyUiTestScenarioSideEffects(dispatch);
          return;
        }
        router.push(uiTestHref());
      }}
      style={{
        position: 'absolute',
        right: theme.spacing.md,
        bottom: insets.bottom + theme.spacing.xl,
        backgroundColor: theme.colors.brand.primary,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.pill,
        zIndex: 50,
      }}
    >
      <GText variant="caption" color="inverse">
        {gate === 'none' ? 'UI Test' : 'UI Test · reset'}
      </GText>
    </Pressable>
  );
}
