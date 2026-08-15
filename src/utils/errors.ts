import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { ApiErrorBody } from '@/src/types/auth';

const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

export function getErrorMessage(error: unknown, fallback = GENERIC_MESSAGE): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  if (!('status' in error)) {
    return fallback;
  }

  const queryError = error as FetchBaseQueryError;

  if (queryError.status === 'FETCH_ERROR') {
    return 'Unable to connect. Check your internet connection and try again.';
  }

  if (queryError.status === 'TIMEOUT_ERROR') {
    return 'Request timed out. Please try again.';
  }

  if (queryError.status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  if (typeof queryError.data === 'object' && queryError.data !== null) {
    const body = queryError.data as ApiErrorBody;
    if (typeof body.code === 'string') {
      const mapped = mapBusinessErrorCode(body.code);
      if (mapped) {
        return mapped;
      }
    }
  }

  if (queryError.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (queryError.status === 404) {
    return 'We could not find what you were looking for.';
  }

  if (typeof queryError.status === 'number' && queryError.status >= 500) {
    return 'Our servers are having trouble right now. Please try again.';
  }

  return fallback;
}

function mapBusinessErrorCode(code: string): string | undefined {
  switch (code) {
    case 'CATEGORY_UNAVAILABLE':
    case 'CATEGORY_INACTIVE':
    case 'CATEGORY_NOT_FOUND':
      return 'This category is not available right now.';
    case 'PRODUCT_UNAVAILABLE':
    case 'PRODUCT_INACTIVE':
    case 'PRODUCT_NOT_FOUND':
      return 'This product is not available right now.';
    case 'SEARCH_INVALID':
      return 'Please enter a valid search.';
    case 'OPTION_UNAVAILABLE':
    case 'OPTION_INVALID':
    case 'VARIANT_UNAVAILABLE':
      return 'That option is no longer available. Please choose another.';
    case 'OPTION_REQUIRED':
      return 'Please select the required options before adding to cart.';
    case 'QUANTITY_UNAVAILABLE':
    case 'QUANTITY_EXCEEDED':
      return 'That quantity is not available for this product.';
    case 'PRICE_CHANGED':
    case 'CART_PRICE_CHANGED':
      return 'The price has changed. Please review and try again.';
    case 'CART_UNAVAILABLE':
    case 'CART_ITEM_UNAVAILABLE':
      return 'This item could not be added to your cart right now.';
    case 'CART_INVALID':
      return 'Please review your cart before continuing.';
    case 'QUANTITY_LIMIT':
      return 'That quantity is not available for this product.';
    case 'INVALID_OPTIONS':
      return 'That option is no longer available. Please choose another.';
    case 'COUPON_INVALID':
    case 'COUPON_NOT_FOUND':
      return 'This coupon code is not valid.';
    case 'COUPON_EXPIRED':
      return 'This coupon has expired.';
    case 'COUPON_MIN_ORDER':
    case 'COUPON_MINIMUM':
      return 'This coupon needs a higher cart total.';
    case 'COUPON_NOT_ELIGIBLE':
    case 'COUPON_INELIGIBLE':
    case 'COUPON_NOT_APPLICABLE':
      return 'This coupon cannot be used on these items.';
    case 'COUPON_ALREADY_APPLIED':
      return 'This coupon is already applied.';
    case 'COUPON_STACKING':
    case 'COUPON_STACKING_CONFLICT':
      return 'This coupon cannot be combined with your current offers.';
    case 'SERVICEABILITY_FAILED':
      return 'These items cannot be fulfilled together right now.';
    case 'NOT_SERVICEABLE':
    case 'LOCATION_NOT_SERVICEABLE':
      return 'Delivery is not available to this location.';
    case 'SLOT_UNAVAILABLE':
    case 'SLOT_INVALID':
      return 'That time slot is no longer available. Please choose another.';
    case 'CHECKOUT_EXPIRED':
    case 'CHECKOUT_INVALID':
      return 'Please review your checkout details and try again.';
    case 'PAYMENT_FAILED':
      return 'Payment failed. Please try again.';
    case 'PAYMENT_CANCELLED':
      return 'Payment was cancelled.';
    case 'PAYMENT_VERIFICATION_FAILED':
      return 'Payment could not be confirmed.';
    case 'PAYMENT_ALREADY_PROCESSED':
      return 'This payment was already processed.';
    case 'PAYMENT_TIMEOUT':
      return 'Payment status could not be confirmed.';
    case 'STORE_CREDIT_INSUFFICIENT':
      return 'There is not enough store credit to apply.';
    case 'STORE_CREDIT_INVALID':
      return 'Store credit could not be applied.';
    case 'ADDRESS_INVALID':
    case 'ADDRESS_NOT_FOUND':
      return 'Please choose a valid delivery address.';
    case 'WISHLIST_UNAVAILABLE':
    case 'WISHLIST_ITEM_UNAVAILABLE':
      return 'Unable to update your wishlist right now.';
    case 'WISHLIST_NOT_FOUND':
      return 'That wishlist item is no longer available.';
    case 'REVIEW_NOT_ELIGIBLE':
    case 'REVIEW_INELIGIBLE':
    case 'NOT_ELIGIBLE_TO_REVIEW':
      return 'This item cannot be reviewed yet.';
    case 'ALREADY_REVIEWED':
    case 'REVIEW_EXISTS':
      return 'You have already reviewed this item.';
    case 'REVIEW_INVALID':
    case 'REVIEW_TEXT_INVALID':
      return 'Please check your rating and review, then try again.';
    case 'ORDER_NOT_FOUND':
      return 'Order not found';
    case 'CANCELLATION_NOT_ALLOWED':
    case 'CANCEL_NOT_ALLOWED':
      return 'This order can no longer be cancelled.';
    case 'REORDER_FAILED':
    case 'REORDER_UNAVAILABLE':
      return 'These items could not be added to your cart.';
    case 'INVOICE_UNAVAILABLE':
    case 'INVOICE_GENERATING':
      return 'The invoice is not available yet.';
    case 'TRACKING_UNAVAILABLE':
      return 'Live location is temporarily unavailable.';
    case 'CHAT_UNAVAILABLE':
      return 'Chat with the rider is not available right now.';
    case 'CALL_UNAVAILABLE':
      return 'Calling the rider is not available right now.';
    case 'COMPLAINT_NOT_ALLOWED':
      return 'A complaint cannot be submitted for this order.';
    case 'TICKET_NOT_FOUND':
    case 'SUPPORT_TICKET_NOT_FOUND':
      return 'Ticket not found';
    case 'TICKET_CLOSED':
    case 'REPLY_NOT_ALLOWED':
      return 'Replies are not available on this ticket.';
    case 'NOTIFICATION_NOT_FOUND':
      return 'That notification is no longer available.';
    case 'PHONE_CHANGE_INVALID':
    case 'PHONE_IN_USE':
    case 'PHONE_CHANGE_FAILED':
      return 'This phone number could not be updated. Please try again.';
    case 'OTP_INVALID':
      return 'That code is not valid. Please try again.';
    case 'OTP_EXPIRED':
      return 'That code has expired. Please request a new one.';
    case 'PROFILE_UPDATE_INVALID':
    case 'PROFILE_UPDATE_FAILED':
      return 'Your profile could not be updated. Please try again.';
    default:
      return undefined;
  }
}

export function isNotFoundError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'status' in error && error.status === 404);
}

export function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('status' in error)) {
    return undefined;
  }
  const queryError = error as FetchBaseQueryError;
  if (typeof queryError.data === 'object' && queryError.data !== null) {
    const body = queryError.data as ApiErrorBody;
    return typeof body.code === 'string' ? body.code : undefined;
  }
  return undefined;
}

export function isNetworkQueryError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('status' in error)) {
    return false;
  }
  const status = (error as FetchBaseQueryError).status;
  return status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR';
}
