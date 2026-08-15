import { baseApi } from './baseApi';
import type { AppConfig } from '@/src/types/appConfig';
import { normalizeAppConfig } from '@/src/utils/appConfig';

/**
 * Remote app lifecycle config — GET app/config.
 * Short-lived: do not persist maintenance/force-update flags.
 * Environment API URL stays in EXPO_PUBLIC_* / src/config/env.ts.
 */
export const configApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAppConfig: build.query<AppConfig, void>({
      query: () => '/app/config',
      transformResponse: (response: unknown) => normalizeAppConfig(response),
      providesTags: ['Config'],
      keepUnusedDataFor: 30,
    }),
  }),
  overrideExisting: true,
});

export const { useGetAppConfigQuery, useLazyGetAppConfigQuery } = configApi;
