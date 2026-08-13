import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GButton, GText, Header, OtpInput } from '@/src/components';
import { useAuth } from '@/src/hooks';
import { useRequestOtpMutation, useVerifyOtpMutation } from '@/src/store';
import { useTheme } from '@/src/providers';
import { formatPhoneDisplay, getErrorMessage } from '@/src/utils';

const OTP_LENGTH = 6;

export default function OtpAuthScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { completeLogin } = useAuth();
  const params = useLocalSearchParams<{
    phone?: string;
    challengeId?: string;
    expiresIn?: string;
  }>();

  const phone = typeof params.phone === 'string' ? params.phone : '';
  const [challengeId, setChallengeId] = useState(
    typeof params.challengeId === 'string' ? params.challengeId : '',
  );
  const initialExpiry = Number(params.expiresIn ?? 60);
  const [secondsLeft, setSecondsLeft] = useState(
    Number.isFinite(initialExpiry) && initialExpiry > 0 ? initialExpiry : 60,
  );
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const [verifyOtp, { isLoading: isVerifying, error: verifyError }] = useVerifyOtpMutation();
  const [requestOtp, { isLoading: isResending, error: resendError }] = useRequestOtpMutation();

  useEffect(() => {
    if (!phone || !challengeId) {
      router.replace('/(auth)/phone');
    }
  }, [phone, challengeId]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const canResend = secondsLeft === 0 && !isResending && !isVerifying;

  const onVerify = async () => {
    setLocalError(null);
    if (otp.length !== OTP_LENGTH) {
      setLocalError(`Enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }

    try {
      const result = await verifyOtp({
        phone,
        challengeId,
        otp,
      }).unwrap();
      await completeLogin(result);
      router.replace('/(tabs)');
    } catch {
      // surfaced via verifyError
    }
  };

  const onResend = async () => {
    if (!canResend) {
      return;
    }
    setLocalError(null);
    setOtp('');
    try {
      const result = await requestOtp({ phone }).unwrap();
      setChallengeId(result.challengeId);
      setSecondsLeft(result.expiresIn > 0 ? result.expiresIn : 60);
    } catch {
      // surfaced via resendError
    }
  };

  const errorMessage = useMemo(() => {
    if (localError) return localError;
    if (verifyError)
      return getErrorMessage(verifyError, 'Invalid or expired OTP. Please try again.');
    if (resendError) return getErrorMessage(resendError, 'Unable to resend OTP. Please try again.');
    return null;
  }, [localError, verifyError, resendError]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Verify OTP" showBack onBackPress={() => router.back()} />
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
          <View style={{ gap: theme.spacing.sm }}>
            <GText variant="titleLg">Enter OTP</GText>
            <GText variant="bodyMd" color="secondary">
              We sent a {OTP_LENGTH}-digit code to {formatPhoneDisplay(phone)}.
            </GText>
          </View>

          <OtpInput
            value={otp}
            onChange={(next) => {
              setOtp(next);
              setLocalError(null);
            }}
            length={OTP_LENGTH}
            error={Boolean(errorMessage)}
            disabled={isVerifying}
          />

          {errorMessage ? (
            <GText variant="bodySm" color="danger">
              {errorMessage}
            </GText>
          ) : null}

          <GButton
            title="Verify & continue"
            fullWidth
            loading={isVerifying}
            disabled={isVerifying || otp.length !== OTP_LENGTH}
            onPress={onVerify}
          />

          <GButton
            title={canResend ? 'Resend OTP' : `Resend OTP in ${secondsLeft}s`}
            variant="ghost"
            fullWidth
            loading={isResending}
            disabled={!canResend}
            onPress={onResend}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
