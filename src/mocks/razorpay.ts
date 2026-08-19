import type { RazorpayAttemptResult, RazorpayOpenOptions } from '@/src/services/razorpayCheckout';
import { getUiTestScenario } from './scenarios';

/**
 * UI-test-only stand-in for the Razorpay hosted UI.
 * Production still uses the real SDK in razorpayCheckout.ts.
 */
export async function openUiTestRazorpayCheckout(
  options: RazorpayOpenOptions,
): Promise<RazorpayAttemptResult> {
  await new Promise((resolve) => {
    setTimeout(resolve, 400);
  });
  const scenario = getUiTestScenario();
  if (scenario === 'PAYMENT_CANCELLED') {
    return { kind: 'cancelled' };
  }
  if (scenario === 'PAYMENT_FAILED') {
    return { kind: 'failed', message: 'Payment failed. Please try again.' };
  }
  if (scenario === 'PAYMENT_UNKNOWN') {
    return { kind: 'unknown', message: 'Payment status could not be confirmed.' };
  }
  return {
    kind: 'success',
    fields: {
      razorpay_payment_id: `pay_ui_${Date.now()}`,
      razorpay_order_id: options.razorpayOrderId,
      razorpay_signature: 'ui-test-signature',
    },
  };
}
