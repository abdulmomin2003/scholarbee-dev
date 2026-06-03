import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// Response types for count endpoints
export interface ProgramsCountResponse {
  total_programs_count: number;
}

export interface AdmissionProgramsCountResponse {
  total_admission_programs_count: number;
}

export interface CampusesCountResponse {
  total_campuses_count: number;
}

export interface ScholarshipsCountResponse {
  total_scholarships_count: number;
}

export interface StatsResponse {
  programs: number;
  admissionPrograms: number;
  campuses: number;
  scholarships: number;
}

export const statsApi = createApi({
  reducerPath: 'statsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Stats'],
  endpoints: (builder) => ({
    getProgramsCount: builder.query<ProgramsCountResponse, void>({
      query: () => ({
        url: 'programs/count',
        method: 'GET'
      }),
      providesTags: ['Stats']
    }),

    getAdmissionProgramsCount: builder.query<
      AdmissionProgramsCountResponse,
      void
    >({
      query: () => ({
        url: 'admission-programs/count',
        method: 'GET'
      }),
      providesTags: ['Stats']
    }),

    getCampusesCount: builder.query<CampusesCountResponse, void>({
      query: () => ({
        url: 'campuses/count',
        method: 'GET'
      }),
      providesTags: ['Stats']
    }),

    getScholarshipsCount: builder.query<ScholarshipsCountResponse, void>({
      query: () => ({
        url: 'scholarships/count',
        method: 'GET'
      }),
      providesTags: ['Stats']
    })
  })
});

export const {
  useGetProgramsCountQuery,
  useGetAdmissionProgramsCountQuery,
  useGetCampusesCountQuery,
  useGetScholarshipsCountQuery
} = statsApi;
