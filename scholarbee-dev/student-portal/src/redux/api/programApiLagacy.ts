import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauthOld } from './baseQuery';

export const programsApi = createApi({
  reducerPath: 'programsApiLegacy',
  baseQuery: baseQueryWithReauthOld,
  tagTypes: ['Programs', 'Favorites'],
  endpoints: (builder) => ({
    getProgramLegacy: builder.query({
      query: (id) => ({
        url: `admission_programs/${id}?depth=5`,
        method: 'GET'
      }),
      providesTags: ['Programs']
    })
  })
});

export const { useGetProgramLegacyQuery } = programsApi;
