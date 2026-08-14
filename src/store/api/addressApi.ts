import { baseApi } from './baseApi';
import type { Address, AddressListResponse, AddressPayload } from '@/src/types/address';
import { normalizeAddress, normalizeAddressList } from '@/src/utils/address';

const addressListTag = { type: 'Address' as const, id: 'LIST' };

function addressTags(result: AddressListResponse | undefined) {
  if (!result) {
    return [addressListTag];
  }
  return [
    addressListTag,
    ...result.items.map((item) => ({ type: 'Address' as const, id: item.id })),
  ];
}

/**
 * Address book — logical paths from docs/api-requirements.md:
 * GET/POST/PATCH/DELETE addresses
 */
export const addressApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAddresses: build.query<AddressListResponse, void>({
      query: () => '/addresses',
      transformResponse: (response: unknown) => normalizeAddressList(response),
      providesTags: (result) => addressTags(result),
    }),
    createAddress: build.mutation<Address | null, AddressPayload>({
      query: (body) => ({
        url: '/addresses',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => normalizeAddress(response),
      invalidatesTags: [addressListTag],
    }),
    updateAddress: build.mutation<Address | null, { id: string; body: AddressPayload }>({
      query: ({ id, body }) => ({
        url: `/addresses/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => normalizeAddress(response),
      invalidatesTags: (_result, _error, arg) => [addressListTag, { type: 'Address', id: arg.id }],
    }),
    deleteAddress: build.mutation<void, string>({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [addressListTag, { type: 'Address', id }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressApi;
