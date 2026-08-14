import React, { useCallback, useRef, useState } from 'react';
import { BackHandler, ScrollView, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import {
  useConfirmRazorpayPaymentMutation,
  useGetCartQuery,
  useGetMeQuery,
  useInitiateRazorpayPaymentMutation,
} from '@/src/store';
import { env } from '@/src/config';
import { clearPaymentSession, peekPaymentSession } from '@/src/services/paymentSession';
import { setOrderConfirmation } from '@/src/services/orderConfirmation';
import { openRazorpayCheckout, type RazorpaySuccessFields } from '@/src/services/razorpayCheckout';
import { getErrorCode, getErrorMessage, isNetworkQueryError } from '@/src/utils/errors';
import { createIdempotencyKey } from '@/src/utils/idempotency';
import { checkoutHref, orderConfirmationHref } from '@/src/utils/navigation';
import { hasCompleteRazorpayPrep } from '@/src/utils/payment';
import { isValidIndianMobile, normalizeIndianPhone } from '@/src/utils/phone';
import type { PaymentUiState, RazorpayCheckoutData } from '@/src/types/payment';
import {
  EmptyState,
  ErrorState,
  GButton,
  GText,
  Header,
  PaymentStatusCard,
  PaymentSummary,
} from '@/src/components';

const RETRYABLE: PaymentUiState[] = ['IDLE', 'FAILED', 'CANCELLED'];

export default function PaymentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, name, phone } = useAuth();
  const params = useLocalSearchParams<{ checkoutId?: string }>();
  const session = peekPaymentSession();
  const checkoutId =
    (typeof params.checkoutId === 'string' ? params.checkoutId : undefined) ?? session?.checkoutId;

  const [uiState, setUiState] = useState<PaymentUiState>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [amountMismatch, setAmountMismatch] = useState(false);
  const [checkoutExpired, setCheckoutExpired] = useState(false);
  const [hasPendingConfirm, setHasPendingConfirm] = useState(false);
  const initiateKeyRef = useRef<string | null>(null);
  const confirmKeyRef = useRef<string | null>(null);
  const pendingFieldsRef = useRef<RazorpaySuccessFields | null>(null);

  const cartQuery = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const meQuery = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const [initiatePayment] = useInitiateRazorpayPaymentMutation();
  const [confirmPayment] = useConfirmRazorpayPaymentMutation();

  const displayAmountPaise = session?.amountPaise ?? cartQuery.data?.totals.totalPaise;
  const busy = uiState === 'PREPARING' || uiState === 'RAZORPAY_OPEN' || uiState === 'VERIFYING';

  const goCheckout = useCallback(() => {
    router.replace(checkoutHref());
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (busy) {
          return true;
        }
        goCheckout();
        return true;
      });
      return () => sub.remove();
    }, [busy, goCheckout]),
  );

  const verifyWithBackend = useCallback(
    async (fields: RazorpaySuccessFields, id: string) => {
      setUiState('VERIFYING');
      setStatusMessage(null);
      if (!confirmKeyRef.current) {
        confirmKeyRef.current = createIdempotencyKey();
      }
      try {
        const result = await confirmPayment({
          checkoutId: id,
          idempotencyKey: confirmKeyRef.current,
          razorpay_payment_id: fields.razorpay_payment_id,
          razorpay_order_id: fields.razorpay_order_id,
          razorpay_signature: fields.razorpay_signature,
        }).unwrap();
        if (result.verified) {
          clearPaymentSession();
          setHasPendingConfirm(false);
          setOrderConfirmation({
            orderNumber: result.orderNumber,
            orderId: result.orderId,
            totalPaise: result.totalPaise ?? displayAmountPaise,
            fulfilment: result.fulfilment ?? session?.fulfilment,
            locationLabel: result.locationLabel ?? session?.locationLabel,
            scheduleLabel: result.scheduleLabel ?? session?.scheduleLabel,
            paymentStatus: result.paymentStatus ?? undefined,
            message: result.message,
          });
          setUiState('CONFIRMED');
          router.replace(orderConfirmationHref());
          return;
        }
        setUiState('UNKNOWN');
        setStatusMessage(result.message ?? 'Payment could not be confirmed.');
      } catch (error) {
        const code = getErrorCode(error);
        if (
          isNetworkQueryError(error) ||
          code === 'PAYMENT_ALREADY_PROCESSED' ||
          code === 'PAYMENT_VERIFICATION_FAILED'
        ) {
          setUiState('UNKNOWN');
          setStatusMessage(
            code === 'PAYMENT_ALREADY_PROCESSED'
              ? getErrorMessage(error)
              : isNetworkQueryError(error)
                ? "We couldn't confirm your payment yet. Please check your payment status or try again."
                : getErrorMessage(error, 'Payment could not be confirmed.'),
          );
          return;
        }
        setUiState('UNKNOWN');
        setStatusMessage(getErrorMessage(error, 'Payment could not be confirmed.'));
      }
    },
    [
      confirmPayment,
      displayAmountPaise,
      router,
      session?.fulfilment,
      session?.locationLabel,
      session?.scheduleLabel,
    ],
  );

  const onPay = useCallback(async () => {
    if (!RETRYABLE.includes(uiState) || busy || !checkoutId || amountMismatch || checkoutExpired) {
      return;
    }
    setAmountMismatch(false);
    setStatusMessage(null);
    setUiState('PREPARING');

    try {
      let prep: RazorpayCheckoutData;
      const sessionPrep: RazorpayCheckoutData = {
        checkoutId,
        razorpayOrderId: session?.checkoutId === checkoutId ? session.razorpayOrderId : undefined,
        keyId: session?.checkoutId === checkoutId ? session.keyId : undefined,
        amountPaise: session?.checkoutId === checkoutId ? session.amountPaise : undefined,
        currency: session?.checkoutId === checkoutId ? session.currency : undefined,
      };
      if (
        hasCompleteRazorpayPrep(sessionPrep) ||
        (Boolean(sessionPrep.razorpayOrderId) && typeof sessionPrep.amountPaise === 'number')
      ) {
        prep = {
          ...sessionPrep,
          keyId: sessionPrep.keyId ?? (env.razorpayKeyId || undefined),
        };
      } else {
        if (!initiateKeyRef.current) {
          initiateKeyRef.current = createIdempotencyKey();
        }
        prep = await initiatePayment({
          checkoutId,
          idempotencyKey: initiateKeyRef.current,
        }).unwrap();
        if (!prep.keyId) {
          prep = { ...prep, keyId: env.razorpayKeyId || undefined };
        }
      }

      if (typeof prep.amountPaise === 'number' && typeof displayAmountPaise === 'number') {
        if (prep.amountPaise !== displayAmountPaise) {
          setAmountMismatch(true);
          setUiState('IDLE');
          return;
        }
      }

      const keyId = prep.keyId ?? env.razorpayKeyId;
      if (!prep.razorpayOrderId || !keyId || typeof prep.amountPaise !== 'number') {
        setUiState('FAILED');
        setStatusMessage('Payment could not be prepared. Please return to checkout.');
        return;
      }
      if (prep.currency && prep.currency !== 'INR') {
        setUiState('FAILED');
        setStatusMessage('This currency is not supported for payment.');
        return;
      }

      const contact =
        phone && isValidIndianMobile(phone) ? normalizeIndianPhone(phone) : (phone ?? undefined);
      const email = meQuery.data?.email ?? undefined;

      setUiState('RAZORPAY_OPEN');
      const attempt = await openRazorpayCheckout({
        keyId,
        amountPaise: prep.amountPaise,
        currency: prep.currency ?? 'INR',
        razorpayOrderId: prep.razorpayOrderId,
        name: name ?? undefined,
        contact,
        email: email ?? undefined,
        themeColor: theme.colors.brand.primary,
      });

      if (attempt.kind === 'cancelled') {
        setUiState('CANCELLED');
        setStatusMessage('You closed the payment window.');
        return;
      }
      if (attempt.kind === 'unavailable') {
        setUiState('FAILED');
        setStatusMessage(attempt.message);
        return;
      }
      if (attempt.kind === 'failed') {
        setUiState('FAILED');
        setStatusMessage(attempt.message);
        return;
      }
      if (attempt.kind === 'unknown') {
        setUiState('UNKNOWN');
        setStatusMessage(attempt.message);
        return;
      }

      pendingFieldsRef.current = attempt.fields;
      setHasPendingConfirm(true);
      confirmKeyRef.current = createIdempotencyKey();
      await verifyWithBackend(attempt.fields, checkoutId);
    } catch (error) {
      const code = getErrorCode(error);
      if (code === 'CHECKOUT_EXPIRED') {
        setCheckoutExpired(true);
        setUiState('FAILED');
        setStatusMessage('This checkout has expired. Please review your order.');
        return;
      }
      if (isNetworkQueryError(error)) {
        setUiState('FAILED');
        setStatusMessage(getErrorMessage(error));
        return;
      }
      setUiState('FAILED');
      setStatusMessage(getErrorMessage(error));
    }
  }, [
    amountMismatch,
    busy,
    checkoutExpired,
    checkoutId,
    displayAmountPaise,
    initiatePayment,
    meQuery.data,
    name,
    phone,
    session,
    theme.colors.brand.primary,
    uiState,
    verifyWithBackend,
  ]);

  const onConfirmPending = useCallback(() => {
    const fields = pendingFieldsRef.current;
    if (!fields || !checkoutId || uiState !== 'UNKNOWN') {
      return;
    }
    void verifyWithBackend(fields, checkoutId);
  }, [checkoutId, uiState, verifyWithBackend]);

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Payment" showBack onBackPress={goCheckout} />
        <EmptyState
          title="Sign in to pay"
          description="Payment requires a GUNUCO account."
          actionLabel="Back to checkout"
          onAction={goCheckout}
        />
      </View>
    );
  }

  if (!checkoutId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Payment" showBack onBackPress={goCheckout} />
        <EmptyState
          title="Checkout required"
          description="Start from checkout to pay for your order."
          actionLabel="Back to checkout"
          onAction={goCheckout}
        />
      </View>
    );
  }

  if (amountMismatch) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Payment" showBack onBackPress={goCheckout} />
        <ErrorState
          title="Your total has changed"
          message="Your total has changed. Please review your order."
          retryLabel="Review order"
          onRetry={goCheckout}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Payment" showBack={!busy} onBackPress={goCheckout} />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + 120,
          gap: theme.spacing.md,
        }}
      >
        <PaymentSummary
          amountPaise={displayAmountPaise}
          fulfilment={session?.fulfilment}
          locationLabel={session?.locationLabel}
          scheduleLabel={session?.scheduleLabel}
        />
        <PaymentStatusCard
          state={uiState}
          message={statusMessage}
          allowRetry={!checkoutExpired}
          onRetry={() => {
            void onPay();
          }}
          onConfirmPending={hasPendingConfirm ? onConfirmPending : undefined}
          onBackToCheckout={goCheckout}
        />
        {uiState === 'IDLE' ? (
          <GText variant="caption" color="secondary">
            You will complete UPI, card, or net banking in Razorpay. GUNUCO confirms the order after
            payment is verified.
          </GText>
        ) : null}
      </ScrollView>
      {uiState === 'IDLE' ? (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.default,
            backgroundColor: theme.colors.bg.surface,
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: insets.bottom + theme.spacing.md,
          }}
        >
          <GButton
            title="Pay Now"
            size="lg"
            fullWidth
            disabled={busy || !checkoutId}
            loading={busy}
            onPress={() => {
              void onPay();
            }}
            accessibilityLabel="Pay Now"
          />
        </View>
      ) : null}
    </View>
  );
}
