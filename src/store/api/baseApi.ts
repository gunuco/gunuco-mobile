import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from '@/src/utils/mutex';
import {
  isAnonymousAuthRequest,
  isAnonymousEndpointName,
  isPublicBrowseRequest,
} from '@/src/utils/requestAuth';
import { env } from '@/src/config';
import { secureStorage } from '@/src/services/secureStorage';
import { clearInMemoryCustomerState } from '@/src/services/clearCustomerState';
import { markSessionExpired, setUnauthenticated } from '../slices/authSlice';
import type { RefreshTokenResponse } from '@/src/types/auth';

const mutex = new Mutex();

/** Mobile-network friendly; surfaces as TIMEOUT_ERROR rather than hanging forever. */
const REQUEST_TIMEOUT_MS = 30_000;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  timeout: REQUEST_TIMEOUT_MS,
  prepareHeaders: async (headers, { endpoint }) => {
    headers.set('Accept', 'application/json');
    // Leave Content-Type unset so FormData can set a multipart boundary.

    if (isAnonymousEndpointName(endpoint)) {
      return headers;
    }

    const [accessToken, refreshToken] = await Promise.all([
      secureStorage.getAccessToken(),
      secureStorage.getRefreshToken(),
    ]);
    if (accessToken && refreshToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
});

async function persistTokens(tokens: RefreshTokenResponse): Promise<void> {
  await Promise.all([
    secureStorage.setAccessToken(tokens.accessToken),
    secureStorage.setRefreshToken(tokens.refreshToken),
  ]);
}

async function dropInvalidSession(
  api: Parameters<BaseQueryFn>[1],
  showExpiredModal: boolean,
): Promise<void> {
  clearInMemoryCustomerState();
  await secureStorage.clearAuthTokens();
  if (showExpiredModal) {
    api.dispatch(markSessionExpired());
  } else {
    api.dispatch(setUnauthenticated());
  }
  // reducerPath is 'api'. Must run on 401 expiry, not only explicit logout,
  // so Customer B never reads Customer A RTK cache.
  api.dispatch({ type: 'api/resetApiState' });
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (isAnonymousAuthRequest(args, api.endpoint)) {
    return rawBaseQuery(args, api, extraOptions);
  }

  await mutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  if (!result.error || result.error.status !== 401) {
    return result;
  }

  const publicBrowse = isPublicBrowseRequest(args);

  if (!mutex.isLocked()) {
    const release = await mutex.acquire();
    try {
      const refreshToken = await secureStorage.getRefreshToken();
      if (!refreshToken) {
        await dropInvalidSession(api, false);
        return publicBrowse ? rawBaseQuery(args, api, extraOptions) : result;
      }

      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/token/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const tokens = refreshResult.data as RefreshTokenResponse;
        await persistTokens(tokens);
        return rawBaseQuery(args, api, extraOptions);
      }

      await dropInvalidSession(api, !publicBrowse);
      return publicBrowse ? rawBaseQuery(args, api, extraOptions) : result;
    } finally {
      release();
    }
  }

  await mutex.waitForUnlock();
  const [accessToken, refreshToken] = await Promise.all([
    secureStorage.getAccessToken(),
    secureStorage.getRefreshToken(),
  ]);

  if (accessToken && refreshToken) {
    return rawBaseQuery(args, api, extraOptions);
  }

  if (publicBrowse) {
    return rawBaseQuery(args, api, extraOptions);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth',
    'Customer',
    'Home',
    'Category',
    'Product',
    'Cart',
    'Address',
    'Order',
    'Tracking',
    'RiderChat',
    'Payment',
    'Offer',
    'Wishlist',
    'Review',
    'Notification',
    'Support',
    'StoreCredit',
    'Config',
    'Legal',
  ],
  endpoints: () => ({}),
});
