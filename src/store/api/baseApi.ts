import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from '@/src/utils/mutex';
import { env } from '@/src/config';
import { secureStorage } from '@/src/services/secureStorage';
import { markSessionExpired } from '../slices/authSlice';
import type { RefreshTokenResponse } from '@/src/types/auth';

const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: async (headers) => {
    const token = await secureStorage.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

async function persistTokens(tokens: RefreshTokenResponse): Promise<void> {
  await Promise.all([
    secureStorage.setAccessToken(tokens.accessToken),
    secureStorage.setRefreshToken(tokens.refreshToken),
  ]);
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = await secureStorage.getRefreshToken();
        if (!refreshToken) {
          await secureStorage.clearAuthTokens();
          api.dispatch(markSessionExpired());
          return result;
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
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          await secureStorage.clearAuthTokens();
          api.dispatch(markSessionExpired());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
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
    'Payment',
    'Offer',
    'Wishlist',
    'Notification',
    'Support',
    'StoreCredit',
    'Config',
  ],
  endpoints: () => ({}),
});
