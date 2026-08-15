import { baseApi } from './baseApi';
import type { LegalDocument, LegalType } from '@/src/types/legal';
import { normalizeLegalDocument } from '@/src/utils/legal';

/**
 * Legal content — GET legal/{type}
 * types: terms | privacy | refund | cancellation
 * Response may be URL or markdown/text [CONFIRM].
 */
export const legalApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLegalDocument: build.query<LegalDocument | null, LegalType>({
      query: (type) => `/legal/${type}`,
      transformResponse: (response: unknown, _meta, type) => normalizeLegalDocument(response, type),
      providesTags: (_result, _error, type) => [{ type: 'Legal', id: type }],
    }),
  }),
  overrideExisting: true,
});

export const { useGetLegalDocumentQuery } = legalApi;
