import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { ApiErrorBody } from '@/src/types/auth';

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!error) {
    return fallback;
  }

  if ('status' in error) {
    if (error.status === 'FETCH_ERROR') {
      return 'Unable to connect. Check your internet connection and try again.';
    }

    if (error.status === 'TIMEOUT_ERROR') {
      return 'Request timed out. Please try again.';
    }

    if (error.status === 429) {
      return 'Too many attempts. Please wait a moment and try again.';
    }

    if (typeof error.data === 'object' && error.data !== null) {
      const body = error.data as ApiErrorBody;
      if (typeof body.code === 'string') {
        const mapped = mapBusinessErrorCode(body.code);
        if (mapped) {
          return mapped;
        }
      }
      if (typeof body.message === 'string' && body.message.trim().length > 0) {
        return body.message;
      }
    }

    if (error.status === 401) {
      return 'Your session has expired. Please sign in again.';
    }

    if (error.status === 404) {
      return 'We could not find what you were looking for.';
    }

    if (typeof error.status === 'number' && error.status >= 500) {
      return 'Our servers are having trouble right now. Please try again.';
    }

    return fallback;
  }

  if (typeof error.message === 'string' && error.message.trim().length > 0) {
    return error.message;
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
    default:
      return undefined;
  }
}
