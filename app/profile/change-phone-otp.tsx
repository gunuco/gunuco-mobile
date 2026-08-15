import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAppDispatch } from '@/src/store/hooks';
import { setAuthenticated } from '@/src/store/slices/authSlice';
import { useRequestPhoneChangeMutation, useVerifyPhoneChangeMutation } from '@/src/store';
import { formatPhoneDisplay, getErrorMessage } from '@/src/utils';
import { changePhoneHref } from '@/src/utils/navigation';
import {
  clearPhoneChangeChallenge,
  getPhoneChangeChallenge,
  setPhoneChangeChallenge,
} from '@/src/services/phoneChangeChallenge';
import { GButton, GText, Header, OtpInput } from '@/src/components';

const DEFAULT_OTP_LENGTH = 6;

export default function ChangePhoneOtpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const stored = getPhoneChangeChallenge();
  const newPhone = stored?.newPhone ?? '';
  const otpLength =
    stored?.otpLength && stored.otpLength > 0 ? stored.otpLength : DEFAULT_OTP_LENGTH;
  const [challengeId, setChallengeId] = useState(stored?.challengeId ?? '');
  const [secondsLeft, setSecondsLeft] = useState(stored?.expiresIn ?? 60);
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [verifyChange, { isLoading: isVerifying, error: verifyError }] =
    useVerifyPhoneChangeMutation();
  const [requestChange, { isLoading: isResending, error: resendError }] =
    useRequestPhoneChangeMutation();

  useEffect(() => {
    if (!newPhone || !challengeId) {
      clearPhoneChangeChallenge();
      router.replace(changePhoneHref());
    }
  }, [newPhone, challengeId, router]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const onVerify = async () => {
    setLocalError(null);
    if (otp.length !== otpLength) {
      setLocalError(`Enter the ${otpLength}-digit OTP.`);
      return;
    }
    try {
      const customer = await verifyChange({ challengeId, otp }).unwrap();
      clearPhoneChangeChallenge();
      dispatch(
        setAuthenticated({
          customerId: customer.customerId,
          phone: customer.phone,
          name: customer.name ?? null,
        }),
      );
      router.replace('/(tabs)/profile');
    } catch (error) {
      setLocalError(getErrorMessage(error, 'That code could not be verified. Please try again.'));
    }
  };

  const onResend = async () => {
    if (!newPhone) {
      return;
    }
    setLocalError(null);
    try {
      const result = await requestChange({ newPhone }).unwrap();
      setPhoneChangeChallenge({
        newPhone,
        challengeId: result.challengeId,
        expiresIn: result.expiresIn ?? 60,
        otpLength: result.otpLength ?? otpLength,
      });
      setChallengeId(result.challengeId);
      setSecondsLeft(result.expiresIn ?? 60);
      setOtp('');
    } catch {
      // resendError rendered below
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header
        title="Verify new phone"
        showBack
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace(changePhoneHref());
        }}
      />
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
            Enter the OTP sent to {newPhone ? formatPhoneDisplay(newPhone) : 'your new number'}.
          </GText>
          <OtpInput
            length={otpLength}
            value={otp}
            onChange={setOtp}
            error={Boolean(localError || verifyError)}
            disabled={isVerifying}
          />
          {localError || verifyError || resendError ? (
            <GText variant="bodySm" color="danger">
              {localError ??
                getErrorMessage(
                  verifyError ?? resendError,
                  'Something went wrong. Please try again.',
                )}
            </GText>
          ) : null}
          <GButton
            title="Verify"
            fullWidth
            loading={isVerifying}
            onPress={() => {
              void onVerify();
            }}
            accessibilityLabel="Verify OTP"
          />
          <GButton
            title={secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend OTP'}
            variant="ghost"
            fullWidth
            disabled={secondsLeft > 0 || isResending || isVerifying}
            loading={isResending}
            onPress={() => {
              void onResend();
            }}
            accessibilityLabel="Resend OTP"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
