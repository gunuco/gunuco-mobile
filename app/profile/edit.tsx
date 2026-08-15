import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useGetMeQuery, useUpdateMeMutation } from '@/src/store';
import { useAppDispatch } from '@/src/store/hooks';
import { setAuthenticated } from '@/src/store/slices/authSlice';
import { getErrorMessage } from '@/src/utils/errors';
import { isPlausibleEmail } from '@/src/utils/customer';
import {
  EmptyState,
  ErrorState,
  GButton,
  GImage,
  GInput,
  GText,
  Header,
  OrderListSkeleton,
} from '@/src/components';

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { isAuthenticated, phone } = useAuth();
  const meQuery = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const [updateMe, updateState] = useUpdateMeMutation();
  const [draft, setDraft] = useState<{ name?: string; email?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const name = draft?.name ?? meQuery.data?.name ?? '';
  const email = draft?.email ?? meQuery.data?.email ?? '';

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/profile');
  };

  const emailError = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) {
      return undefined;
    }
    return isPlausibleEmail(trimmed) ? undefined : 'Enter a valid email address.';
  }, [email]);

  const onSave = async () => {
    if (!name.trim()) {
      setErrorMessage('Enter your name.');
      return;
    }
    if (emailError) {
      return;
    }
    setErrorMessage(null);
    try {
      const customer = await updateMe({
        name: name.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
      }).unwrap();
      dispatch(
        setAuthenticated({
          customerId: customer.customerId,
          phone: customer.phone,
          name: customer.name ?? null,
        }),
      );
      goBack();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Your profile could not be updated. Please try again.'),
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Edit profile" showBack onBackPress={goBack} />
        <EmptyState title="Sign in to edit your profile" />
      </View>
    );
  }

  if (meQuery.isError && !meQuery.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Edit profile" showBack onBackPress={goBack} />
        <ErrorState
          message={getErrorMessage(meQuery.error, 'Unable to load your profile.')}
          onRetry={() => void meQuery.refetch()}
        />
      </View>
    );
  }

  if (meQuery.isLoading && !meQuery.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Edit profile" showBack onBackPress={goBack} />
        <OrderListSkeleton count={3} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Edit profile" showBack onBackPress={goBack} />
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
          <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
            <GImage
              uri={meQuery.data?.profileImage}
              width={88}
              height={88}
              borderRadius={44}
              accessibilityLabel="Profile photo"
            />
            <GText variant="caption" color="secondary">
              Profile photo upload is not available yet.
            </GText>
          </View>
          <GInput
            label="Name"
            value={name}
            onChangeText={(text) => {
              setDraft((current) => ({ ...current, name: text }));
              setErrorMessage(null);
            }}
            accessibilityLabel="Name"
          />
          <GInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setDraft((current) => ({ ...current, email: text }));
              setErrorMessage(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            errorText={emailError}
            accessibilityLabel="Email"
          />
          {phone ? (
            <GText variant="caption" color="secondary">
              To change your phone number, use Change Phone from Profile.
            </GText>
          ) : null}
          {errorMessage ? (
            <GText variant="bodySm" color="danger">
              {errorMessage}
            </GText>
          ) : null}
          <GButton
            title="Save"
            fullWidth
            loading={updateState.isLoading}
            disabled={!name.trim() || Boolean(emailError)}
            onPress={() => {
              void onSave();
            }}
            accessibilityLabel="Save profile"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
