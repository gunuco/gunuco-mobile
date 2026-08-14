import { baseApi } from './baseApi';
import type { StoreCredit } from '@/src/types/storeCredit';
import { normalizeStoreCredit } from '@/src/utils/storeCredit';

/**
 * Store Credit ledger — logical path: GET store-credit
 * Apply/remove mutations live on cartApi (cart-scoped).
 */
export const storeCreditApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStoreCredit: build.query<StoreCredit, void>({
      query: () => '/store-credit',
      transformResponse: (response: unknown) => normalizeStoreCredit(response),
      providesTags: ['StoreCredit'],
    }),
  }),
  overrideExisting: true,
});

export const { useGetStoreCreditQuery } = storeCreditApi;
