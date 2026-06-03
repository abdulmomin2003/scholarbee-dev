import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface ExternalApplicationRequest {
  admission_program: string;
  admission: string;
  campus: string;
  program: string;
  university: string;
}

export const externalApplicationApi = createApi({
  reducerPath: 'externalApplicationApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    submitExternalApplication: builder.mutation({
      query: (data) => ({
        url: 'external-applications',
        method: 'POST',
        body: data
      })
    })
  })
});

export const { useSubmitExternalApplicationMutation } = externalApplicationApi;
