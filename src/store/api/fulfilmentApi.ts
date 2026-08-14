import { baseApi } from './baseApi';
import type {
  FulfilmentSlotsResponse,
  FulfilmentType,
  PickupInfo,
  ServiceabilityResult,
} from '@/src/types/fulfilment';
import {
  normalizePickupInfo,
  normalizeServiceability,
  normalizeSlots,
} from '@/src/utils/fulfilment';

export type FulfilmentSlotsArgs = {
  date: string;
  fulfilmentType: FulfilmentType;
  /** Cache-only. Not sent — slot query params remain date + fulfilmentType. [CONFIRM] cart/location query shape. */
  addressId?: string;
  cartRevision?: string;
};

/**
 * Fulfilment — logical paths from docs/api-requirements.md:
 * POST fulfilment/serviceability
 * GET fulfilment/slots
 * GET fulfilment/pickup-info
 *
 * Production house is backend-assigned. Slots are never hard-coded.
 */
export const fulfilmentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    checkServiceability: build.mutation<ServiceabilityResult, { lat: number; lng: number }>({
      query: ({ lat, lng }) => ({
        url: '/fulfilment/serviceability',
        method: 'POST',
        body: { lat, lng },
      }),
      transformResponse: (response: unknown) => normalizeServiceability(response),
    }),
    getFulfilmentSlots: build.query<FulfilmentSlotsResponse, FulfilmentSlotsArgs>({
      query: ({ date, fulfilmentType }) => ({
        url: '/fulfilment/slots',
        params: { date, fulfilmentType },
      }),
      transformResponse: (response: unknown, _meta, arg) => normalizeSlots(response, arg),
    }),
    getPickupInfo: build.query<PickupInfo, void>({
      query: () => '/fulfilment/pickup-info',
      transformResponse: (response: unknown) => normalizePickupInfo(response),
    }),
  }),
  overrideExisting: true,
});

export const { useCheckServiceabilityMutation, useGetFulfilmentSlotsQuery, useGetPickupInfoQuery } =
  fulfilmentApi;
