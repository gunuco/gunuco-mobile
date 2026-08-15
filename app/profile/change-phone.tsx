import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useRequestPhoneChangeMutation } from '@/src/store';
import { getErrorMessage, isValidIndianMobile, toE164India } from '@/src/utils';
import { changePhoneOtpHref } from '@/src/utils/navigation';
import { setPhoneChangeChallenge } from '@/src/services/phoneChangeChallenge';
import { EmptyState, GButton, GInput, GText, Header } from '@/src/components';

export default function ChangePhoneScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [requestChange, { isLoading, error }] = useRequestPhoneChangeMutation();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/profile');
  };

  const onContinue = async () => {
    setLocalError(null);
    if (!isValidIndianMobile(phone)) {
      setLocalError('Enter a valid 10-digit mobile number.');
      return;
    }
    const e164 = toE164India(phone);
    try {
      const result = await requestChange({ newPhone: e164 }).unwrap();
      setPhoneChangeChallenge({
        newPhone: e164,
        challengeId: result.challengeId,
        expiresIn: result.expiresIn ?? 60,
        otpLength: result.otpLength,
      });
      router.push(changePhoneOtpHref());
    } catch {
      // RTK error rendered below.
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Change phone" showBack onBackPress={goBack} />
        <EmptyState title="Sign in to change your phone number" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Change phone" showBack onBackPress={goBack} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing['3xl'],
            gap: theme.spacing.lg,
          }}
        >
          <GText variant="bodyMd" color="secondary">
            Enter the new mobile number. We’ll send an OTP to verify it.
          </GText>
          <GInput
            label="New mobile number"
            value={phone}
            onChangeText={(text) => {
              setPhone(text.replace(/[^\d]/g, '').slice(0, 10));
              setLocalError(null);
            }}
            keyboardType="phone-pad"
            placeholder="10-digit mobile number"
            maxLength={10}
            errorText={localError ?? undefined}
            helperText="+91 India"
            accessibilityLabel="New mobile number"
          />
          {error ? (
            <GText variant="bodySm" color="danger">
              {getErrorMessage(error, 'We couldn’t start the phone change. Please try again.')}
            </GText>
          ) : null}
          <GButton
            title="Send OTP"
            fullWidth
            loading={isLoading}
            onPress={() => {
              void onContinue();
            }}
            accessibilityLabel="Send OTP"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
