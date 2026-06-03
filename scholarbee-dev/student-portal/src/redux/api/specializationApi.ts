import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

interface Specializations {
  id: string;
  name: string;
}

interface SpecializationsResponse {
  docs: Specializations[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: number | null;
  page: number;
  pagingCounter: number;
  prevPage: number | null;
  totalDocs: number;
  totalPages: number;
}

export const specializationsApi = createApi({
  reducerPath: 'specializationsApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getSpecializations: builder.query<
      SpecializationsResponse,
      { search?: string; page?: number; limit?: number }
    >({
      query: ({ search = '', page = 1, limit = 20 }) =>
        search === ''
          ? `programs_template?depth=0&draft=true&limit=${limit}&page=${page}`
          : `programs_template?depth=0&draft=true&limit=${limit}&page=${page}&where[and][1][or][0][name][like]=${search}`
    })
  })
});

export const { useGetSpecializationsQuery } = specializationsApi;
