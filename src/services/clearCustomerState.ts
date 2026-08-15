import { clearPaymentSession } from '@/src/services/paymentSession';
import { clearOrderConfirmation } from '@/src/services/orderConfirmation';
import { clearRegisteredPushToken } from '@/src/services/pushTokenCache';
import { clearOtpChallenge } from '@/src/services/otpChallenge';
import { clearPhoneChangeChallenge } from '@/src/services/phoneChangeChallenge';
import { clearAuthIntent } from '@/src/services/authIntent';

/**
 * Customer-specific in-memory state that must not survive logout or 401 session drop.
 * Does not touch RTK Query (callers reset that separately).
 */
export function clearInMemoryCustomerState(): void {
  clearPaymentSession();
  clearOrderConfirmation();
  clearRegisteredPushToken();
  clearOtpChallenge();
  clearPhoneChangeChallenge();
  clearAuthIntent();
}
