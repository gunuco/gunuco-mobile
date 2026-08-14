import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GButton, GInput, GText, Header } from '@/src/components';
import { useRequestOtpMutation } from '@/src/store';
import { setOtpChallenge, clearOtpChallenge } from '@/src/services/otpChallenge';
import { useTheme } from '@/src/providers';
import { getErrorMessage, isValidIndianMobile, toE164India } from '@/src/utils';

export default function PhoneAuthScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [requestOtp, { isLoading, error }] = useRequestOtpMutation();

  const onContinue = async () => {
    setLocalError(null);
    if (!isValidIndianMobile(phone)) {
      setLocalError('Enter a valid 10-digit mobile number.');
      return;
    }

    const e164 = toE164India(phone);
    try {
      const result = await requestOtp({ phone: e164 }).unwrap();
      setOtpChallenge({
        phone: e164,
        challengeId: result.challengeId,
        expiresIn: result.expiresIn ?? 60,
      });
      router.push('/(auth)/otp');
    } catch {
      // RTK error surfaced below via `error`
    }
  };

  const apiError = error ? getErrorMessage(error) : null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Sign in" showBack onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={theme.spacing.md}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing['3xl'],
            gap: theme.spacing.lg,
          }}
        >
          <View style={{ gap: theme.spacing.sm }}>
            <GText variant="titleLg">Welcome to GUNUCO</GText>
            <GText variant="bodyMd" color="secondary">
              Enter your mobile number. We’ll send a one-time password to sign you in or create your
              account.
            </GText>
          </View>

          <GInput
            label="Mobile number"
            value={phone}
            onChangeText={(text) => {
              setPhone(text.replace(/[^\d]/g, '').slice(0, 10));
              setLocalError(null);
            }}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            placeholder="10-digit mobile number"
            maxLength={10}
            errorText={localError ?? undefined}
            helperText="+91 India"
            accessibilityLabel="Mobile number"
          />

          {apiError ? (
            <GText variant="bodySm" color="danger">
              {apiError}
            </GText>
          ) : null}

          <GButton
            title="Send OTP"
            fullWidth
            loading={isLoading}
            disabled={isLoading || phone.length < 10}
            onPress={onContinue}
          />

          <GButton
            title="Continue as guest"
            variant="ghost"
            fullWidth
            onPress={() => {
              clearOtpChallenge();
              router.replace('/(tabs)');
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
