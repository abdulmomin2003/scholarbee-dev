import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface LegalDocumentRequirement {
  _id: string;
  document_type: string;
  document_name: string;
  is_required: boolean;
  description?: string;
  file_format?: string[];
  max_file_size?: number;
}

export const applicationsApi = createApi({
  reducerPath: 'applicationsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Applications', 'LegalDocuments'],
  endpoints: (builder) => ({
    applyForProgram: builder.mutation({
      query: (data) => ({
        url: '/applications',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Applications']
    }),
    updateApplicationSubmission: builder.mutation({
      query: ({ applicationId, data }) => ({
        url: `/applications/${applicationId}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Applications']
    }),
    getApplicationDetails: builder.query({
      query: (applicationId) => `/applications/${applicationId}`,
      providesTags: ['Applications']
    }),
    makePayment: builder.mutation({
      query: (data) => ({
        url: '/payments?depth=0&fallback-locale=null',
        method: 'POST',
        body: data
      })
    }),
    getUserApplications: builder.query({
      query: (userId) => `/applications?limit=30&page=1&applicant_id=${userId}`,
      providesTags: ['Applications']
    }),
    getLegalDocumentRequirements: builder.query<
      LegalDocumentRequirement[],
      { programId?: string; campusId?: string }
    >({
      query: (params = {}) => {
        const { programId, campusId } = params;
        const queryParams = new URLSearchParams();

        if (programId) {
          queryParams.append('program_id', programId);
        }
        if (campusId) {
          queryParams.append('campus_id', campusId);
        }

        const queryString = queryParams.toString();
        return `/applications/legal-document-requirements${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['LegalDocuments']
    })
  })
});

export const {
  useApplyForProgramMutation,
  useGetApplicationDetailsQuery,
  useUpdateApplicationSubmissionMutation,
  useMakePaymentMutation,
  useGetUserApplicationsQuery,
  useGetLegalDocumentRequirementsQuery
} = applicationsApi;
