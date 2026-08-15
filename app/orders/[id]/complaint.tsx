import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useCreateComplaintMutation, useGetOrderQuery } from '@/src/store';
import { createIdempotencyKey } from '@/src/utils/idempotency';
import { getErrorMessage } from '@/src/utils/errors';
import { COMPLAINT_REASONS, type EvidencePhoto } from '@/src/types/complaint';
import { ordersHref, supportTicketHref } from '@/src/utils/navigation';
import {
  CancellationReasonSelector,
  EmptyState,
  GButton,
  GInput,
  GText,
  Header,
  ImageUploaderSlots,
} from '@/src/components';

export default function ComplaintScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const orderId = typeof params.id === 'string' ? params.id : '';
  const orderQuery = useGetOrderQuery(orderId, { skip: !orderId });
  const [reasonCode, setReasonCode] = useState<string | undefined>();
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState<EvidencePhoto[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const idempotencyRef = useRef<string | null>(null);
  const [createComplaint, createState] = useCreateComplaintMutation();

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ordersHref());
  }, [router]);

  const onSubmit = async () => {
    if (!orderId || !message.trim() || createState.isLoading) {
      return;
    }
    if (!idempotencyRef.current) {
      idempotencyRef.current = createIdempotencyKey();
    }
    setErrorMessage(null);
    try {
      const result = await createComplaint({
        orderId,
        reasonCode,
        message: message.trim(),
        idempotencyKey: idempotencyRef.current,
        photos,
      }).unwrap();
      if (!result.success) {
        setErrorMessage(result.message ?? 'This request could not be submitted.');
        return;
      }
      setTicketId(result.ticketId ?? null);
      setSuccess(true);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  if (!orderId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Complaint / Return" showBack onBackPress={goBack} />
        <EmptyState title="Order not found" />
      </View>
    );
  }

  if (orderQuery.data && orderQuery.data.complaintAllowed !== true) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Complaint / Return" showBack onBackPress={goBack} />
        <EmptyState
          title="This request is not available"
          description="Complaints and returns follow GUNUCO policy and are enabled by the server."
          actionLabel="Back to order"
          onAction={goBack}
        />
      </View>
    );
  }

  if (success) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Complaint / Return" showBack onBackPress={goBack} />
        <EmptyState
          title="Request submitted"
          description="GUNUCO will review this request. You can follow replies in Support."
          actionLabel={ticketId ? 'View ticket' : 'Back to order'}
          onAction={() => {
            if (ticketId) {
              router.replace(supportTicketHref(ticketId));
              return;
            }
            goBack();
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Complaint / Return" showBack onBackPress={goBack} />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing['3xl'],
          gap: theme.spacing.lg,
        }}
      >
        <GText variant="bodyMd" color="secondary">
          Tell us what went wrong. Eligibility is decided by GUNUCO, not a generic return window.
        </GText>
        <CancellationReasonSelector
          reasons={COMPLAINT_REASONS}
          value={reasonCode}
          onChange={setReasonCode}
        />
        <GInput
          label="Description"
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
          style={{ minHeight: 120, paddingVertical: theme.spacing.md }}
          accessibilityLabel="Complaint description"
        />
        <ImageUploaderSlots photos={photos} onChange={setPhotos} />
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
          accessibilityLabel="Submit complaint"
        />
      </ScrollView>
    </View>
  );
}
