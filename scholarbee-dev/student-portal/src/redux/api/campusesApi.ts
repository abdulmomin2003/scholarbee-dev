import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import {
  Campus,
  CampusListResponse,
  QueryCampusParams,
  PartnerUniversitiesResponse
} from '@/types/campus.types';
import { mapRecommendedUniversityToCampus } from '@/utils/recommendations';

export const campusesApi = createApi({
  reducerPath: 'campusesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Campuses', 'CampusFavorites'],
  endpoints: (builder) => ({
    getCampuses: builder.query<CampusListResponse, QueryCampusParams>({
      query: (params) => {
        const {
          page = 1,
          limit = 10,
          name,
          city,
          area,
          university_type,
          partner_university,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = params || {};

        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        queryParams.append('sortBy', sortBy);
        queryParams.append('sortOrder', sortOrder);

        if (name) queryParams.append('name', name);
        if (city) queryParams.append('city', city);
        if (area) queryParams.append('area', area);
        if (university_type) {
          queryParams.append('university_type', university_type);
        }
        if (typeof partner_university === 'boolean') {
          queryParams.append('partner_university', String(partner_university));
        }

        return {
          url: `campuses?${queryParams.toString()}`,
          method: 'GET'
        };
      },
      providesTags: ['Campuses']
    }),

    getCampusById: builder.query<Campus, string>({
      query: (campusId) => ({
        url: `campuses/${campusId}`,
        method: 'GET'
      }),
      providesTags: (result, error, campusId) => [
        { type: 'Campuses', id: campusId }
      ]
    }),

    getCampusBySlug: builder.query<Campus, string>({
      query: (slug) => ({
        url: `campuses/slug/${slug}`,
        method: 'GET'
      }),
      providesTags: (result, error, slug) => [{ type: 'Campuses', id: slug }]
    }),

    getCampusesByUniversity: builder.query<Campus[], string>({
      query: (universityId) => ({
        url: `campuses/university/${universityId}`,
        method: 'GET'
      }),
      providesTags: (result, error, universityId) => [
        { type: 'Campuses', id: `university-${universityId}` }
      ]
    }),

    addCampusToFavorites: builder.mutation<Campus, { campusId: string }>({
      query: ({ campusId }) => ({
        url: `campuses/${campusId}/favorites`,
        method: 'POST'
      }),
      invalidatesTags: ['Campuses', 'CampusFavorites']
    }),

    removeCampusFromFavorites: builder.mutation<Campus, { campusId: string }>({
      query: ({ campusId }) => ({
        url: `campuses/${campusId}/favorites`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Campuses', 'CampusFavorites']
    }),

    getFavoriteCampuses: builder.query<CampusListResponse, QueryCampusParams>({
      query: (params) => {
        const {
          page = 1,
          limit = 10,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = params;

        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        queryParams.append('sortBy', sortBy);
        queryParams.append('sortOrder', sortOrder);

        return {
          url: `campuses/favorites?${queryParams.toString()}`,
          method: 'GET'
        };
      },
      providesTags: ['CampusFavorites']
    }),

    getPartnerUniversities: builder.query<PartnerUniversitiesResponse, void>({
      query: () => ({
        url: 'campuses/lookup/partners',
        method: 'GET'
      }),
      providesTags: ['Campuses']
    }),

    getCampusRecommendations: builder.query<
      CampusListResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `recommendations?type=universities&limit=${limit}&page=${page}`,
        method: 'GET'
      }),
      transformResponse: (response: any, _meta, arg) => {
        const limit = arg?.limit ?? 10;
        const page = arg?.page ?? 1;
        const total = response?.meta?.total || 0;
        const pages = Math.ceil(total / limit) || 1;

        return {
          data: (response?.data || []).map(mapRecommendedUniversityToCampus),
          meta: {
            total,
            page: response?.meta?.page || page,
            limit: response?.meta?.limit || limit,
            pages
          }
        };
      },
      providesTags: ['Campuses']
    })
  })
});

export const {
  useGetCampusesQuery,
  useLazyGetCampusesQuery,
  useGetCampusByIdQuery,
  useGetCampusBySlugQuery,
  useGetCampusesByUniversityQuery,
  useAddCampusToFavoritesMutation,
  useRemoveCampusFromFavoritesMutation,
  useGetFavoriteCampusesQuery,
  useGetPartnerUniversitiesQuery,
  useGetCampusRecommendationsQuery
} = campusesApi;
