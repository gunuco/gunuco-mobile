import React, { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useCreateSupportTicketMutation } from '@/src/store';
import { createIdempotencyKey } from '@/src/utils/idempotency';
import { getErrorMessage } from '@/src/utils/errors';
import { supportHref, supportTicketHref } from '@/src/utils/navigation';
import type { EvidencePhoto } from '@/src/types/complaint';
import { EmptyState, GButton, GInput, GText, Header, ImageUploaderSlots } from '@/src/components';
import { setAuthIntent } from '@/src/services/authIntent';

export default function CreateSupportTicketScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const initialOrderId = typeof params.orderId === 'string' ? params.orderId : '';
  const [orderId, setOrderId] = useState(initialOrderId);
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState<EvidencePhoto[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const idempotencyRef = useRef<string | null>(null);
  const [createTicket, createState] = useCreateSupportTicketMutation();

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(supportHref());
  }, [router]);

  const onSubmit = async () => {
    if (!message.trim() || createState.isLoading) {
      return;
    }
    if (!idempotencyRef.current) {
      idempotencyRef.current = createIdempotencyKey();
    }
    setErrorMessage(null);
    try {
      const result = await createTicket({
        message: message.trim(),
        idempotencyKey: idempotencyRef.current,
        photos,
        ...(orderId.trim() ? { orderId: orderId.trim() } : {}),
      }).unwrap();
      if (!result.success || !result.ticketId) {
        setErrorMessage(result.message ?? 'We couldn’t create your support ticket.');
        return;
      }
      idempotencyRef.current = null;
      router.replace(supportTicketHref(result.ticketId));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'We couldn’t create your support ticket.'));
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Create ticket" showBack onBackPress={goBack} />
        <EmptyState
          title="Sign in for support"
          actionLabel="Sign in with phone"
          onAction={() => {
            setAuthIntent({ returnTo: '/support/create' });
            router.push('/(auth)/phone');
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Create ticket" showBack onBackPress={goBack} />
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
            Tell us how we can help. You can optionally link an order and attach up to 3 photos.
          </GText>
          <GInput
            label="Order ID (optional)"
            value={orderId}
            onChangeText={setOrderId}
            placeholder="If this is about an order"
            accessibilityLabel="Order ID optional"
          />
          <GInput
            label="Message"
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              setErrorMessage(null);
            }}
            multiline
            textAlignVertical="top"
            style={{ minHeight: 140, paddingVertical: theme.spacing.md }}
            accessibilityLabel="Support message"
          />
          <ImageUploaderSlots
            photos={photos}
            onChange={setPhotos}
            label="Photos (optional)"
            helperText="Up to 3 JPG, PNG, or WEBP photos. File size is checked by the server."
          />
          {errorMessage ? (
            <GText variant="bodySm" color="danger">
              {errorMessage}
            </GText>
          ) : null}
          <GButton
            title="Submit"
            fullWidth
            loading={createState.isLoading}
            disabled={!message.trim()}
            onPress={() => {
              void onSubmit();
            }}
            accessibilityLabel="Submit support ticket"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
