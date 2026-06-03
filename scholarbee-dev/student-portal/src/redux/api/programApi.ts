/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { Patch } from 'immer';
import { API_BASE_URL_DEV } from '@/config/config';
import Cookies from 'js-cookie';

/** True if string looks like a MongoDB ObjectId (24 hex chars). */
function isMongoId(value: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(value ?? '');
}

/** Title case for API: degree_level=Bachelors, major=Artificial Intelligence, city=Peshawar */
function toTitleCase(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function decodeURIComponentSafe(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

export interface GetProgramDetailsParams {
  slug: string;
  degree_level?: string;
  city?: string;
  uni?: string;
  major?: string;
}
export interface GetProgramDetailsListParams {
  seo_title_key: string;
  city: string;
  campus_slug: string;
  session_term?: string;
  major?: string;
}

export interface IsExternalApplicationAllowedResponse {
  isExternalApplicationAllowed: boolean;
  university_name: string;
  university_id: string;
  redirect_deeplink?: string;
}

interface GetProgramsParams {
  page?: number;
  search?: string;
  university?: string;
  degree_level?: string;
  courseForm?: string;
  year?: string;
  intake?: string;
  min_fee?: number | null;
  max_fee?: number | null;
  major?: string;
  receiving_applications?: boolean;
  admission_startdate_from?: string;
  admission_startdate_to?: string;
  admission_enddate_from?: string;
  admission_enddate_to?: string;
  limit?: number;
}

interface GetUniversityProgramsParams {
  universityId: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  populate?: boolean;
}

interface FavoriteParams {
  admissionProgramId: string;
}

interface GetCampusProgramsParams {
  campusId: string;
  page?: number;
  limit?: number;
  search?: string;
  degree_level?: string;
  academic_departments?: string;
  duration?: string;
}

export interface CityOption {
  label: string;
  value: string;
}

export const programsApi: any = createApi({
  reducerPath: 'programsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Programs', 'Favorites'],
  endpoints: (builder) => ({
    trackRecommendationEvent: builder.mutation({
      query: (data: { event_type: string; resource_type: string; resource_id: string; metadata?: any }) => ({
        url: 'recommendations/events',
        method: 'POST',
        body: data
      })
    }),
    getRecommendations: builder.query({
      query: (params: { type?: string; limit?: number; page?: number } = {}) => {
        const { type = 'programs', limit = 15, page = 1 } = params;
        return {
          url: `recommendations?type=${type}&limit=${limit}&page=${page}`,
          method: 'GET'
        };
      },
      transformResponse: (response: any, _meta, arg) => {
        const limit = arg?.limit ?? 15;
        const page = arg?.page ?? 1;
        const totalDocs = response?.meta?.total || 0;
        const totalPages = Math.ceil(totalDocs / limit) || 1;

        return {
          docs: response?.data || [],
          pagination: {
            totalDocs,
            limit: response?.meta?.limit || limit,
            page: response?.meta?.page || page,
            totalPages,
            hasNextPage: page < totalPages
          }
        };
      },
      providesTags: ['Programs']
    }),
    getPrograms: builder.query({
      query: (params) => {
        const { page = 1, limit, ...filters } = params;
        const queryParts = [`page=${page.toString()}`];

        if (limit) {
          queryParts.push(`limit=${limit.toString()}`);
        }

        (
          Object.entries(filters) as [keyof GetProgramsParams, unknown][]
        ).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            const paramKey =
              key === 'search'
                ? 'programName'
                : key === 'intake'
                  ? 'session_term'
                  : String(key);
            const stringValue =
              typeof value === 'string' || typeof value === 'number'
                ? String(value)
                : JSON.stringify(value);
            queryParts.push(`${paramKey}=${encodeURIComponent(stringValue)}`);
          }
        });

        return {
          url: `admission-programs/with-filters?${queryParts.join('&')}`,
          method: 'GET'
        };
      },
      providesTags: ['Programs']
    }),
    getProgram: builder.query({
      query: (slug: string) => ({
        url: `admission-programs/slug/${slug}`,
        method: 'GET'
      }),
      providesTags: ['Programs']
    }),
    /** Same API as server: detail-list with university_slug, major=Artificial Intelligence, degree_level=Bachelors, city=Peshawar */
    getProgramDetails: builder.query<any, GetProgramDetailsParams>({
      queryFn: async (arg) => {
        const { slug, degree_level, city, uni, major } = arg;
        const token = Cookies.get('access_token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        };

        const degreeStr = String(degree_level ?? '')
          .trim()
          .toLowerCase();
        const majorDecoded = decodeURIComponentSafe(String(major ?? ''));
        const majorStr = toTitleCase(majorDecoded.replace(/-/g, ' '));
        const cityStr = String(city ?? '').toLowerCase();
        const uniStr = String(uni ?? '').trim();
        const detailListUrl = `${API_BASE_URL_DEV}/admission-programs/detail-list?university_slug=${encodeURIComponent(uniStr)}&major=${encodeURIComponent(majorStr)}&degree_level=${encodeURIComponent(degreeStr)}&city=${encodeURIComponent(cityStr)}`;
        const listRes = await fetch(detailListUrl, { headers });
        if (listRes.ok) {
          const data = await listRes.json();
          const single = Array.isArray(data) ? (data[0] ?? null) : data;
          return { data: single };
        }

        if (isMongoId(slug)) {
          const idUrl = `${API_BASE_URL_DEV}/admission-programs/${slug}`;
          const idRes = await fetch(idUrl, { headers });
          if (idRes.ok) {
            const data = await idRes.json();
            return { data };
          }
        }

        return { error: { status: 404, data: 'Not found' as any } };
      },
      providesTags: ['Programs']
    }),
    getProgramDetailsList: builder.query<any, GetProgramDetailsListParams>({
      queryFn: async (arg) => {
        const { seo_title_key, city, campus_slug, session_term } = arg;
        const token = Cookies.get('access_token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        };

        const queryParams = new URLSearchParams({
          campus_slug: String(campus_slug ?? '')
            .trim()
            .toLowerCase(),
          seo_title_key: String(seo_title_key ?? '')
            .trim()
            .toLowerCase(),
          city: String(city ?? '')
            .trim()
            .toLowerCase()
        });

        if (session_term) {
          queryParams.set('session_term', String(session_term).trim());
        }

        const detailListUrl = `${API_BASE_URL_DEV}/programs/detail-list?${queryParams.toString()}`;
        const listRes = await fetch(detailListUrl, { headers });

        if (!listRes.ok) {
          return {
            error: { status: listRes.status, data: 'Not found' as any }
          };
        }

        const data = await listRes.json();
        return { data };
      },
      providesTags: ['Programs']
    }),
    getCities: builder.query<CityOption[], void>({
      query: () => ({
        url: 'addresses/cities?trim=true',
        method: 'GET'
      }),
      providesTags: ['Programs']
    }),
    isExternalApplicationAllowed: builder.query<
      IsExternalApplicationAllowedResponse,
      string
    >({
      query: (admissionProgramId) => ({
        url: `admission-programs/${admissionProgramId}/is-external-application-allowed`,
        method: 'GET'
      }),
      providesTags: ['Programs']
    }),
    getUniversityPrograms: builder.query({
      query: (params: GetUniversityProgramsParams) => {
        const {
          universityId,
          limit = 200,
          sortBy = 'name',
          sortOrder = 'asc',
          populate = true
        } = params;
        const queryParams = new URLSearchParams();

        queryParams.append('university_id', universityId);
        queryParams.append('limit', limit.toString());
        queryParams.append('sortBy', sortBy);
        queryParams.append('sortOrder', sortOrder);
        queryParams.append('populate', populate.toString());

        return {
          // url: `programs/university/${universityId}?${queryParams.toString()}`,
          url: `programs/?${queryParams.toString()}`,
          method: 'GET'
        };
      },
      providesTags: ['Programs']
    }),

    getCampusPrograms: builder.query({
      query: (params: GetCampusProgramsParams) => {
        const {
          campusId,
          page = 1,
          limit = 10,
          search,
          degree_level,
          academic_departments,
          duration
        } = params;
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());

        if (search) queryParams.append('search', search);
        if (degree_level) queryParams.append('degree_level', degree_level);
        if (academic_departments)
          queryParams.append('academic_departments', academic_departments);
        if (duration) queryParams.append('duration', duration);

        return {
          url: `programs/campus/${campusId}?${queryParams.toString()}`,
          method: 'GET'
        };
      },
      providesTags: (result, error, { campusId }) => [
        { type: 'Programs', id: `campus-${campusId}` }
      ]
    }),
    getFavoritePrograms: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `admission-programs/user/favorites?page=${page}&limit=${limit}`,
        method: 'GET'
      }),
      serializeQueryArgs: () => {
        // Use a consistent cache key for all pages
        return 'favoritePrograms';
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          // First page, replace the cache
          return newItems;
        }
        // Subsequent pages, append to existing cache
        if (currentCache?.data && newItems?.data) {
          return {
            ...newItems,
            data: [...currentCache.data, ...newItems.data]
          };
        }
        return newItems;
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        // Force refetch if page changes
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: ['Favorites']
    }),

    addFavoriteProgram: builder.mutation<void, FavoriteParams>({
      query: ({ admissionProgramId }) => ({
        url: `/admission-programs/${admissionProgramId}/favorites`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      invalidatesTags: ['Favorites'],
      async onQueryStarted(
        { admissionProgramId },
        { dispatch, queryFulfilled, getState }
      ) {
        // Optimistic update for getPrograms - update all cache entries
        const patchResults: {
          patches: Patch[];
          inversePatches: Patch[];
          undo: () => void;
        }[] = [];
        const cacheEntries = (getState() as any).programsApi?.queries;

        if (cacheEntries) {
          Object.keys(cacheEntries).forEach((queryKey) => {
            if (queryKey.startsWith('getPrograms')) {
              const cacheEntry = cacheEntries[queryKey];
              if (cacheEntry?.data) {
                const patchResult = dispatch(
                  programsApi.util.updateQueryData(
                    'getPrograms',
                    cacheEntry.originalArgs,
                    (draft: any) => {
                      if (draft?.docs) {
                        const program = draft.docs.find(
                          (p: any) => p._id === admissionProgramId
                        );
                        if (program) {
                          program.isFavorite = true;
                        }
                      }
                    }
                  )
                );
                patchResults.push(patchResult);
              }
            }
          });
        }

        // Optimistic update for getFavoritePrograms
        // const patchResult2 = dispatch(
        //   programsApi.util.updateQueryData(
        //     'getFavoritePrograms',
        //     { page: 1, limit: 10 }, // Using consistent args since serializeQueryArgs normalizes this
        //     (draft: any) => {
        //       if (draft?.data) {
        //         // Add the program to favorites list if not already present
        //         const existingProgram = draft.data.find(
        //           (p: any) => p._id === admissionProgramId
        //         );
        //         if (!existingProgram) {
        //           // Get the program data from getPrograms cache
        //           const programsCache = (getState() as any).programsApi
        //             ?.queries;
        //           let flattenedProgram: any = null;

        //           // Find the program in any getPrograms cache entry
        //           if (programsCache) {
        //             Object.keys(programsCache).forEach((key) => {
        //               if (key.startsWith('getPrograms') && !flattenedProgram) {
        //                 const cacheEntry = programsCache[key];
        //                 if (cacheEntry?.data?.docs) {
        //                   const program = cacheEntry.data.docs.find(
        //                     (p: any) => p._id === admissionProgramId
        //                   );
        //                   if (program) {
        //                     flattenedProgram = program;
        //                   }
        //                 }
        //               }
        //             });
        //           }

        //           if (flattenedProgram) {
        //             // Transform flattened structure to nested structure
        //             const transformedProgram = {
        //               _id: flattenedProgram._id || flattenedProgram.doc_id,
        //               admission: {
        //                 _id: flattenedProgram.admission_id || '',
        //                 admission_deadline:
        //                   flattenedProgram.admission_enddate || null,
        //                 admission_startdate:
        //                   flattenedProgram.admission_startdate || null,
        //                 admission_title: flattenedProgram.program_title || ''
        //               },
        //               program: {
        //                 _id: flattenedProgram.program_id || '',
        //                 name: flattenedProgram.program_title || '',
        //                 mode_of_study: flattenedProgram.study_mode || '',
        //                 fee_structure: {
        //                   tuition_fee: flattenedProgram.tuition_fee || 0,
        //                   currency: flattenedProgram.currency || ''
        //                 },
        //                 campus_id: {
        //                   _id: flattenedProgram.campus_id || '',
        //                   name: flattenedProgram.campus_name || '',
        //                   logo_url: flattenedProgram.campus_image || '',
        //                   address_id: {
        //                     city: flattenedProgram.location_details?.city || '',
        //                     state:
        //                       flattenedProgram.location_details?.state || '',
        //                     country:
        //                       flattenedProgram.location_details?.country || '',
        //                     address_line_1:
        //                       flattenedProgram.location_details
        //                         ?.complete_address || ''
        //                   },
        //                   university_id: {
        //                     _id: flattenedProgram.university_id || '',
        //                     name: flattenedProgram.university_name || '',
        //                     logo_url: flattenedProgram.university_logo || ''
        //                   }
        //                 }
        //               }
        //             };

        //             draft.data.push(transformedProgram);
        //             // Update the total count
        //             if (draft.meta?.total) {
        //               draft.meta.total += 1;
        //             }
        //           }
        //         }
        //       }
        //     }
        //   )
        // );
        // patchResults.push(patchResult2);

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResults.forEach((patchResult) => patchResult.undo());
        }
      }
    }),

    removeFavoriteProgram: builder.mutation<void, FavoriteParams>({
      query: ({ admissionProgramId }) => ({
        url: `/admission-programs/${admissionProgramId}/favorites`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      invalidatesTags: ['Favorites'],
      async onQueryStarted(
        { admissionProgramId },
        { dispatch, queryFulfilled, getState }
      ) {
        // Optimistic update for getPrograms - update all cache entries
        const patchResults: {
          patches: Patch[];
          inversePatches: Patch[];
          undo: () => void;
        }[] = [];
        const cacheEntries = (getState() as any).programsApi?.queries;

        if (cacheEntries) {
          Object.keys(cacheEntries).forEach((queryKey) => {
            if (queryKey.startsWith('getPrograms')) {
              const cacheEntry = cacheEntries[queryKey];
              if (cacheEntry?.data) {
                const patchResult = dispatch(
                  programsApi.util.updateQueryData(
                    'getPrograms',
                    cacheEntry.originalArgs,
                    (draft: any) => {
                      if (draft?.docs) {
                        const program = draft.docs.find(
                          (p: any) => p._id === admissionProgramId
                        );
                        if (program) {
                          program.isFavorite = false;
                        }
                      }
                    }
                  )
                );
                patchResults.push(patchResult);
              }
            }
          });
        }

        // Optimistic update for getFavoritePrograms
        const patchResult2 = dispatch(
          programsApi.util.updateQueryData(
            'getFavoritePrograms',
            { page: 1, limit: 10 }, // Using consistent args since serializeQueryArgs normalizes this
            (draft: any) => {
              if (draft?.data) {
                // Remove the program from favorites list
                draft.data = draft.data.filter(
                  (p: any) => p._id !== admissionProgramId
                );
                // Update the total count
                if (draft.meta?.total) {
                  draft.meta.total = Math.max(0, draft.meta.total - 1);
                }
              }
            }
          )
        );
        patchResults.push(patchResult2);

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResults.forEach((patchResult) => patchResult.undo());
        }
      }
    }),
    getProgramTemplates: builder.query<any, number | void>({
      query: (limit = 2000) => ({
        url: `/program-templates?limit=${limit}`,
        method: 'GET'
      })
    })
  })
});

export const {
  useTrackRecommendationEventMutation,
  useGetRecommendationsQuery,
  useGetProgramsQuery,
  useGetProgramQuery,
  useGetProgramDetailsQuery,
  useGetProgramDetailsListQuery,
  useGetCitiesQuery,
  useGetUniversityProgramsQuery,
  useGetCampusProgramsQuery,
  useAddFavoriteProgramMutation,
  useGetFavoriteProgramsQuery,
  useRemoveFavoriteProgramMutation,
  useIsExternalApplicationAllowedQuery,
  useGetProgramTemplatesQuery
} = programsApi;
