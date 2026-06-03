/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const compareFiltersApi = createApi({
  reducerPath: 'compareFilters',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CompareCampuses', 'ComparePrograms'],
  endpoints: (builder) => ({
    getCampuses: builder.query({
      query: (universityId) => `/campuses/university/${universityId}`,
      providesTags: ['CompareCampuses'],
      transformResponse: (response: any) => {
        return response ?? [];
      }
    }),
    getPrograms: builder.query({
      query: (campusId) => `/programs/campus/${campusId}?page=1&limit=500`,
      providesTags: ['ComparePrograms'],
      transformResponse: (response: any) => {
        return response?.programs ?? [];
      }
    }),
    compareUniversities: builder.mutation({
      query: (programIds) => ({
        url: '/programs/compare',
        method: 'POST',
        body: {
          programIds
        }
      }),
      // Invalidate both cache tags when a comparison is made
      invalidatesTags: ['CompareCampuses', 'ComparePrograms']
    })
  })
});

// Export the API utilities
export const { util, endpoints } = compareFiltersApi;

// Export hooks
export const {
  useGetCampusesQuery,
  useGetProgramsQuery,
  useCompareUniversitiesMutation
} = compareFiltersApi;

// Export the API itself as default
export default compareFiltersApi;
