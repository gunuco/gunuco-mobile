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
    default:
      return undefined;
  }
}

export function isNotFoundError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'status' in error && error.status === 404);
}
