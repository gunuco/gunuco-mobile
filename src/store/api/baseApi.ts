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
import { markSessionExpired, setUnauthenticated } from '../slices/authSlice';
import type { RefreshTokenResponse } from '@/src/types/auth';

const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
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
  await secureStorage.clearAuthTokens();
  if (showExpiredModal) {
    api.dispatch(markSessionExpired());
  } else {
    api.dispatch(setUnauthenticated());
  }
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
