import type { FetchArgs } from '@reduxjs/toolkit/query';

const ANONYMOUS_ENDPOINTS = new Set(['requestOtp', 'verifyOtp', 'refreshToken']);

function requestUrl(args: string | FetchArgs): string {
  const raw = typeof args === 'string' ? args : args.url;
  return raw.split('?')[0] ?? raw;
}

function requestMethod(args: string | FetchArgs): string {
  if (typeof args === 'string') {
    return 'GET';
  }
  return (args.method ?? 'GET').toUpperCase();
}

/** OTP + refresh must never trigger session-expired handling. */
export function isAnonymousAuthRequest(args: string | FetchArgs, endpoint?: string): boolean {
  if (endpoint && ANONYMOUS_ENDPOINTS.has(endpoint)) {
    return true;
  }
  const url = requestUrl(args);
  return (
    url.startsWith('/auth/otp/') ||
    url.startsWith('/auth/token/refresh') ||
    url === '/auth/token/refresh'
  );
}

/**
 * Customer-visible catalogue GETs. A 401 here must not become a
 * session-expired wall — retry as guest after clearing invalid tokens.
 */
export function isPublicBrowseRequest(args: string | FetchArgs): boolean {
  if (requestMethod(args) !== 'GET') {
    return false;
  }
  const url = requestUrl(args);
  return (
    url === '/customer/home' ||
    url.startsWith('/categories') ||
    url.startsWith('/products/search') ||
    /^\/products\/[^/]+$/.test(url)
  );
}

export function isAnonymousEndpointName(endpoint: string | undefined): boolean {
  return Boolean(endpoint && ANONYMOUS_ENDPOINTS.has(endpoint));
}
