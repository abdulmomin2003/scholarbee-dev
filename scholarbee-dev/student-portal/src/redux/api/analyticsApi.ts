import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    registerEvent: builder.mutation({
      query: (data) => ({
        url: '/analytics/application-metrics/register-event',
        method: 'POST',
        body: data
      })
    }),
    getProgramApplications: builder.query({
      query: () => ({
        url: '/analytics/program-applications',
        method: 'GET'
      })
    }),
    getScholarshipApplications: builder.query({
      query: () => ({
        url: '/analytics/scholarship-applications',
        method: 'GET'
      })
    })
  })
});

// Valid step values based on the API error response:
// application/start, profile/self, profile/contact, profile/education, profile/docs,
// application/program_selection, application/complete

export const {
  useRegisterEventMutation,
  useGetProgramApplicationsQuery,
  useGetScholarshipApplicationsQuery
} = analyticsApi;
