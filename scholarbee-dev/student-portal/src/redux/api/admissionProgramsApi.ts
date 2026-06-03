import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const admissionProgramsApi = createApi({
  reducerPath: 'admissionProgramsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AdmissionPrograms'],
  endpoints: (builder) => ({
    getAllPrograms: builder.query({
      query: (limit?: number) => ({
        url: `/admission-programs-with-filters?depth=5${limit ? `&limit=${limit}` : ''}`,
        method: 'GET'
      }),
      providesTags: ['AdmissionPrograms']
    }),

    getCampusPrograms: builder.query({
      query: (campusId: string) => ({
        url: `/admission_programs?where[program.campus_id][equals]=${campusId}&limit=500`,
        method: 'GET'
      }),
      providesTags: ['AdmissionPrograms']
    }),

    getProgram: builder.query({
      query: (slug: string) => ({
        url: `/admission-programs/slug/${slug}`,
        method: 'GET'
      }),
      providesTags: (result, error, slug) => [
        { type: 'AdmissionPrograms', id: slug }
      ]
    }),

    getProgramById: builder.query({
      query: (id: string) => ({
        url: `/admission-programs/${id}`,
        method: 'GET'
      }),
      providesTags: (result, error, id) => [{ type: 'AdmissionPrograms', id }]
    }),

    getProgramsByAcademicDepartment: builder.query({
      query: (academicDepartmentId: string) => ({
        url: `/admission-programs/lookup/academic-department/${academicDepartmentId}`,
        method: 'GET'
      }),
      providesTags: ['AdmissionPrograms']
    })
  })
});

export const {
  useGetAllProgramsQuery,
  useGetCampusProgramsQuery,
  useGetProgramQuery,
  useLazyGetProgramByIdQuery,
  useGetProgramsByAcademicDepartmentQuery
} = admissionProgramsApi;
