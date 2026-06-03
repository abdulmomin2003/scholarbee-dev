import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { NEXT_PUBLIC_API_CMS_URL } from '@/constants/config';

export const feeStructureApi = createApi({
  reducerPath: 'feeStructureApi',
  baseQuery: fetchBaseQuery({
    baseUrl: NEXT_PUBLIC_API_CMS_URL
  }),
  tagTypes: ['FeeStructure'],
  endpoints: (builder) => ({
    getFeeStructure: builder.query({
      query: (programId: string) => ({
        url: `/fee_structures?depth=0&draft=true&limit=10&page=1&where[or][0][and][0][program_id][equals]=${programId}`,
        method: 'GET'
      }),
      providesTags: (result, error, programId) => [
        { type: 'FeeStructure', id: programId }
      ]
    })
  })
});

export const { useGetFeeStructureQuery } = feeStructureApi;
