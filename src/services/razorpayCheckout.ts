import RazorpayCheckout from 'react-native-razorpay';

export type RazorpayOpenOptions = {
  keyId: string;
  amountPaise: number;
  currency: string;
  razorpayOrderId: string;
  name?: string;
  contact?: string;
  email?: string;
  themeColor?: string;
};

export type RazorpaySuccessFields = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

export type RazorpayAttemptResult =
  | { kind: 'success'; fields: RazorpaySuccessFields }
  | { kind: 'cancelled' }
  | { kind: 'failed'; message: string }
  | { kind: 'unknown'; message: string }
  | { kind: 'unavailable'; message: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function classifyRazorpayError(error: unknown): RazorpayAttemptResult {
  const rec = asRecord(error);
  const code = rec?.code;
  if (code === 0 || code === '0') {
    return { kind: 'cancelled' };
  }
  if (code === 2 || code === '2') {
    return {
      kind: 'failed',
      message: 'We could not reach Razorpay. Please try again.',
    };
  }
  return { kind: 'failed', message: 'Payment failed. Please try again.' };
}

/**
 * Opens Razorpay's hosted checkout. Never logs credentials, signatures, or raw payloads.
 */
export async function openRazorpayCheckout(
  options: RazorpayOpenOptions,
): Promise<RazorpayAttemptResult> {
  try {
    const data = await RazorpayCheckout.open({
      key: options.keyId,
      amount: options.amountPaise,
      currency: options.currency,
      order_id: options.razorpayOrderId,
      name: 'GUNUCO',
      description: 'GUNUCO order',
      prefill: {
        name: options.name,
        contact: options.contact,
        email: options.email,
      },
      theme: options.themeColor ? { color: options.themeColor } : undefined,
    });
    const paymentId = asString(data.razorpay_payment_id);
    if (!paymentId) {
      return {
        kind: 'unknown',
        message: 'Payment status could not be confirmed.',
      };
    }
    return {
      kind: 'success',
      fields: {
        razorpay_payment_id: paymentId,
        razorpay_order_id: asString(data.razorpay_order_id),
        razorpay_signature: asString(data.razorpay_signature),
      },
    };
  } catch (error) {
    if (!error) {
      return { kind: 'cancelled' };
    }
    const rec = asRecord(error);
    if (!rec) {
      return {
        kind: 'unavailable',
        message:
          'Payment requires a development or production build. Expo Go cannot open Razorpay.',
      };
    }
    return classifyRazorpayError(error);
  }
}
