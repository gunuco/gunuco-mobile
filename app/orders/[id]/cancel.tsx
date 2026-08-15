import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useCancelOrderMutation, useGetCancellationEligibilityQuery } from '@/src/store';
import { createIdempotencyKey } from '@/src/utils/idempotency';
import { formatPaise } from '@/src/utils/money';
import { getErrorMessage } from '@/src/utils/errors';
import { CANCELLATION_REASONS } from '@/src/types/order';
import { ordersHref } from '@/src/utils/navigation';
import {
  CancellationReasonSelector,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  GButton,
  GCard,
  GInput,
  GText,
  Header,
} from '@/src/components';

export default function CancelOrderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const orderId = typeof params.id === 'string' ? params.id : '';
  const [reasonCode, setReasonCode] = useState<string | undefined>();
  const [otherText, setOtherText] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const idempotencyRef = useRef<string | null>(null);
  const [cancelOrder, cancelState] = useCancelOrderMutation();
  const eligibilityQuery = useGetCancellationEligibilityQuery(orderId, { skip: !orderId });

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ordersHref());
  }, [router]);

  const onConfirm = async () => {
    if (!orderId || !reasonCode || cancelState.isLoading) {
      return;
    }
    if (!idempotencyRef.current) {
      idempotencyRef.current = createIdempotencyKey();
    }
    setErrorMessage(null);
    try {
      const result = await cancelOrder({
        orderId,
        reasonCode,
        otherText: reasonCode === 'OTHER' ? otherText.trim() || undefined : undefined,
        idempotencyKey: idempotencyRef.current,
      }).unwrap();
      if (!result.success) {
        setConfirmOpen(false);
        setErrorMessage(result.message ?? 'This order could not be cancelled.');
        return;
      }
      setConfirmOpen(false);
      goBack();
    } catch (error) {
      setConfirmOpen(false);
      setErrorMessage(getErrorMessage(error));
    }
  };

  const refundLabel =
    typeof eligibilityQuery.data?.refundPaise === 'number'
      ? `Estimated refund: ${formatPaise(eligibilityQuery.data.refundPaise)}`
      : undefined;
  const selected = CANCELLATION_REASONS.find((item) => item.code === reasonCode);

  if (!orderId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Cancel order" showBack onBackPress={goBack} />
        <EmptyState title="Order not found" />
      </View>
    );
  }

  if (eligibilityQuery.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Cancel order" showBack onBackPress={goBack} />
        <ErrorState
          message={getErrorMessage(eligibilityQuery.error)}
          onRetry={() => void eligibilityQuery.refetch()}
        />
      </View>
    );
  }

  if (eligibilityQuery.isLoading || !eligibilityQuery.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Cancel order" showBack onBackPress={goBack} />
        <GText variant="bodyMd" color="secondary" style={{ padding: theme.spacing.lg }}>
          Checking whether this order can be cancelled.
        </GText>
      </View>
    );
  }

  if (!eligibilityQuery.data.allowed) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Cancel order" showBack onBackPress={goBack} />
        <EmptyState
          title="Cancellation is no longer available"
          description={eligibilityQuery.data.message ?? undefined}
          actionLabel="Back to order"
          onAction={goBack}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Cancel order" showBack onBackPress={goBack} />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing['3xl'],
          gap: theme.spacing.lg,
        }}
      >
        <GText variant="bodyMd" color="secondary">
          Why are you cancelling?
        </GText>
        <CancellationReasonSelector
          reasons={CANCELLATION_REASONS}
          value={reasonCode}
          onChange={setReasonCode}
        />
        {reasonCode === 'OTHER' ? (
          <GInput
            label="Tell us more"
            value={otherText}
            onChangeText={setOtherText}
            multiline
            accessibilityLabel="Other cancellation reason"
          />
        ) : null}
        {eligibilityQuery.data.policyLabel ? (
          <GText variant="caption" color="secondary">
            {eligibilityQuery.data.policyLabel}
          </GText>
        ) : null}
        {eligibilityQuery.data.deadlineLabel ? (
          <GText variant="caption" color="secondary">
            {eligibilityQuery.data.deadlineLabel}
          </GText>
        ) : null}
        {refundLabel ? (
          <GCard>
            <GText variant="label">{refundLabel}</GText>
          </GCard>
        ) : null}
        {eligibilityQuery.data.message ? (
          <GText variant="bodySm" color="secondary">
            {eligibilityQuery.data.message}
          </GText>
        ) : null}
        {errorMessage ? (
          <GText variant="bodySm" color="danger">
            {errorMessage}
          </GText>
        ) : null}
        <GButton
          title="Cancel Order"
          variant="danger"
          fullWidth
          disabled={!reasonCode}
          onPress={() => setConfirmOpen(true)}
          accessibilityLabel="Cancel Order"
        />
      </ScrollView>
      <ConfirmDialog
        visible={confirmOpen}
        title="Cancel this order?"
        message={[selected?.label, refundLabel].filter(Boolean).join('\n')}
        confirmLabel="Cancel Order"
        cancelLabel="Keep order"
        destructive
        loading={cancelState.isLoading}
        onConfirm={() => {
          void onConfirm();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </View>
  );
}
