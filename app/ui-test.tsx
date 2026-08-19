import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { env } from '@/src/config';
import { useTheme } from '@/src/providers';
import { useAppDispatch } from '@/src/store/hooks';
import { EmptyState, GButton, GText, Header, RadioRow, SettingSection } from '@/src/components';
import {
  UI_TEST_CUSTOMERS,
  UI_TEST_OTP,
  getCurrentCustomerId,
  getUiTestControls,
  setUiTestNetwork,
  setUiTestScenario,
  subscribeUiTestControls,
  type UiTestCustomerId,
  type UiTestNetwork,
  type UiTestScenario,
} from '@/src/mocks';
import {
  applyUiTestCustomer,
  applyUiTestScenarioSideEffects,
  signOutUiTestCustomer,
} from '@/src/mocks/session';

const SCENARIOS: { id: UiTestScenario; label: string }[] = [
  { id: 'SUCCESS', label: 'Success' },
  { id: 'LOADING', label: 'Loading (slow)' },
  { id: 'EMPTY', label: 'Empty states' },
  { id: 'NETWORK_ERROR', label: 'Network error' },
  { id: 'TIMEOUT', label: 'Timeout' },
  { id: 'UNAUTHORIZED', label: '401 Unauthorized' },
  { id: 'FORBIDDEN', label: '403 Forbidden' },
  { id: 'NOT_FOUND', label: '404 Not found' },
  { id: 'VALIDATION_ERROR', label: '422 Validation' },
  { id: 'SERVER_ERROR', label: '500 Server error' },
  { id: 'SERVICEABILITY_FAILED', label: 'Not serviceable' },
  { id: 'COUPON_FAILED', label: 'Coupon failed' },
  { id: 'PAYMENT_SUCCESS', label: 'Payment success' },
  { id: 'PAYMENT_CANCELLED', label: 'Payment cancelled' },
  { id: 'PAYMENT_FAILED', label: 'Payment failed' },
  { id: 'PAYMENT_UNKNOWN', label: 'Payment unknown' },
  { id: 'PAYMENT_VERIFICATION_FAILED', label: 'Payment verify failed' },
  { id: 'MAINTENANCE', label: 'Maintenance gate' },
  { id: 'FORCE_UPDATE', label: 'Force update gate' },
];

const NETWORKS: { id: UiTestNetwork; label: string }[] = [
  { id: 'ONLINE', label: 'Online' },
  { id: 'SLOW', label: 'Slow' },
  { id: 'OFFLINE', label: 'Offline' },
];

export default function UiTestScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [controls, setControls] = useState(getUiTestControls());
  const [customerId, setCustomerId] = useState(getCurrentCustomerId());
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeUiTestControls(() => setControls(getUiTestControls())), []);

  if (!env.uiTestMode) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="UI Test" showBack onBackPress={() => router.back()} />
        <EmptyState title="Not available" description="UI Test Mode is off in this build." />
      </View>
    );
  }

  const onScenario = (scenario: UiTestScenario) => {
    setUiTestScenario(scenario);
    setBusy(true);
    void applyUiTestScenarioSideEffects(dispatch).finally(() => setBusy(false));
  };

  const onNetwork = (network: UiTestNetwork) => {
    setUiTestNetwork(network);
    setBusy(true);
    void applyUiTestScenarioSideEffects(dispatch).finally(() => setBusy(false));
  };

  const onCustomer = (id: UiTestCustomerId) => {
    setBusy(true);
    void applyUiTestCustomer(dispatch, id)
      .then(() => setCustomerId(id))
      .finally(() => setBusy(false));
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="UI Test Mode" showBack onBackPress={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing['3xl'],
          gap: theme.spacing.lg,
        }}
      >
        <GText variant="bodyMd" color="secondary">
          Temporary mock transport. OTP is {UI_TEST_OTP}. This screen is hidden when
          EXPO_PUBLIC_UI_TEST_MODE is false.
        </GText>

        <SettingSection title="UI Test Customer">
          {(Object.keys(UI_TEST_CUSTOMERS) as UiTestCustomerId[]).map((id) => (
            <RadioRow
              key={id}
              label={UI_TEST_CUSTOMERS[id].name}
              selected={customerId === id}
              onPress={() => onCustomer(id)}
              accessibilityLabel={UI_TEST_CUSTOMERS[id].name}
            />
          ))}
          <GButton
            title="Sign out test session"
            variant="secondary"
            onPress={() => {
              setBusy(true);
              void signOutUiTestCustomer(dispatch)
                .then(() => setCustomerId(null))
                .finally(() => setBusy(false));
            }}
            loading={busy}
            accessibilityLabel="Sign out test session"
          />
        </SettingSection>

        <SettingSection title="Network">
          {NETWORKS.map((item) => (
            <RadioRow
              key={item.id}
              label={item.label}
              selected={controls.network === item.id}
              onPress={() => onNetwork(item.id)}
              accessibilityLabel={item.label}
            />
          ))}
        </SettingSection>

        <SettingSection title="Scenario">
          {SCENARIOS.map((item) => (
            <RadioRow
              key={item.id}
              label={item.label}
              selected={controls.scenario === item.id}
              onPress={() => onScenario(item.id)}
              accessibilityLabel={item.label}
            />
          ))}
        </SettingSection>
      </ScrollView>
    </View>
  );
}
