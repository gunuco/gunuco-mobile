import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  GButton,
  GCard,
  GInput,
  GText,
  Header,
  OtpInput,
  ProductCard,
  SearchBar,
} from '@/src/components';
import { useTheme } from '@/src/providers';
import { setThemePreference, useAppDispatch } from '@/src/store';

/** Phase 1 gallery retained for design-system validation (not a customer feature). */
export default function DesignSystemScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [otp, setOtp] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Design system" showBack onBackPress={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing['3xl'],
          gap: theme.spacing.lg,
        }}
      >
        <GCard style={{ gap: theme.spacing.sm }}>
          <GText variant="titleMd">Phase 1 components</GText>
          <GText variant="bodySm" color="secondary">
            Validation surface for tokens and shared UI.
          </GText>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
            <GButton
              title="Light"
              size="sm"
              variant="secondary"
              onPress={() => dispatch(setThemePreference('light'))}
            />
            <GButton
              title="Dark"
              size="sm"
              variant="secondary"
              onPress={() => dispatch(setThemePreference('dark'))}
            />
          </View>
        </GCard>
        <SearchBar value={query} onChangeText={setQuery} />
        <GInput label="Sample" placeholder="Input" />
        <OtpInput value={otp} onChange={setOtp} />
        <ProductCard
          product={{
            id: 'demo',
            name: 'Demo Cake',
            pricePaise: 50000,
            isAvailable: true,
          }}
        />
        <GButton title="Primary" fullWidth />
      </ScrollView>
    </View>
  );
}
