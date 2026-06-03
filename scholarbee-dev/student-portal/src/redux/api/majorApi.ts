import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

interface GetMajorsParams {
  university_id?: string;
}

export const majorApi = createApi({
  reducerPath: 'majorApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Major', 'DegreeLevel'],
  endpoints: (builder) => ({
    getMajors: builder.query({
      query: (params: GetMajorsParams = {}) => {
        const queryParts: string[] = [];

        if (params?.university_id) {
          queryParts.push(`university_id=${params?.university_id}`);
        }

        const queryString =
          queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

        return {
          url: `admission-programs/majors${queryString}`,
          method: 'GET'
        };
      },
      providesTags: ['Major']
    }),
    getDegreeLevels: builder.query({
      query: (params: GetMajorsParams = {}) => {
        const queryParts: string[] = [];

        if (params?.university_id) {
          queryParts.push(`university_id=${params?.university_id}`);
        }

        const queryString =
          queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

        return {
          url: `admission-programs/degree-levels${queryString}`,
          method: 'GET'
        };
      },
      providesTags: ['DegreeLevel']
    })
  })
});

export const { useGetMajorsQuery, useGetDegreeLevelsQuery } = majorApi;
