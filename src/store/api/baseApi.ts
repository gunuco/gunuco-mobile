import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { env } from '@/src/config';
import { secureStorage } from '@/src/services';

/**
 * RTK Query foundation.
 * Endpoint modules are injected later once API contracts are confirmed.
 * Do not invent production endpoints here.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: async (headers) => {
    const token = await secureStorage.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  // Refresh-token flow will be completed in Phase 2 (auth).
  // For now, preserve the hook point without inventing refresh endpoints.
  if (result.error && result.error.status === 401) {
    // Intentionally no token logging.
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
