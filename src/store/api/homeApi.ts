import { baseApi } from './baseApi';
import type { HomeResponse } from '@/src/types/home';

/**
 * Aggregated Home feed — logical path from docs/api-requirements.md:
 * GET customer/home
 */
export const homeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getHome: build.query<HomeResponse, void>({
      query: () => '/customer/home',
      providesTags: ['Home'],
    }),
  }),
  overrideExisting: true,
});

export const { useGetHomeQuery, useLazyGetHomeQuery } = homeApi;
