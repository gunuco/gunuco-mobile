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
      if (typeof body.message === 'string' && body.message.trim().length > 0) {
        return body.message;
      }
    }

    if (error.status === 401) {
      return 'Your session has expired. Please sign in again.';
    }

    return fallback;
  }

  if (typeof error.message === 'string' && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
