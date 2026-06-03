/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { Patch } from 'immer';
import Cookies from 'js-cookie';

/**
 * Resolve the current user id for optimistic favorite patches.
 *
 * The listing UI compares `scholarship.favouriteBy` against
 * `Cookies.get('userId')` — the cookie is the source of truth and persists
 * across reloads. `auth.user` in Redux is not persisted; it's only available
 * during the initial login session or after `useGetUserQuery` rehydrates it.
 *
 * Reading from Redux first (in case the cookie is somehow missing) and
 * falling back to the cookie keeps optimistic patches consistent with the
 * UI in every flow (cold start, re-mount, post-login, post-refresh).
 */
const getCurrentUserId = (state: any): string | undefined => {
  const reduxId = state?.auth?.user?._id as string | undefined;
  if (reduxId) return reduxId;
  return Cookies.get('userId');
};

interface GetScholarshipsParams {
  page?: number;
  limit?: number;
  search?: string;
  scholarship_type?: string;
  university_id?: string;
  status?: string;
  amountMin?: number | null;
  amountMax?: number | null;
}

export const scholarshipsApi = createApi({
  reducerPath: 'scholarshipsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Scholarships', 'FavoritesScholarships'],
  endpoints: (builder) => ({
    getScholarships: builder.query({
      query: (params: GetScholarshipsParams = {}) => {
        const { page = 1, limit, ...filters } = params;
        const queryParts = [`page=${page.toString()}`];

        if (limit) {
          queryParts.push(`limit=${limit.toString()}`);
        }

        (
          Object.entries(filters) as [keyof GetScholarshipsParams, string][]
        ).forEach(([key, value]) => {
          if (value) {
            queryParts.push(`${key}=${encodeURIComponent(value)}`);
          }
        });

        return {
          url: `scholarships?${queryParts.join('&')}`,
          method: 'GET'
        };
      },
      providesTags: ['Scholarships']
    }),
    getScholarshipById: builder.query({
      query: (scholarshipId: string) => `scholarships/${scholarshipId}`
    }),
    applyForScholarship: builder.mutation({
      query: (applicationData) => ({
        url: 'student-scholarships',
        method: 'POST',
        body: applicationData
      })
    }),
    getUserScholarshipApplications: builder.query({
      query: (userId) =>
        `/student-scholarships?page=1&student_id=${userId}&limit=30`
    }),
    getFavoriteScholarships: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `scholarships/user/favorites?page=${page}&limit=${limit}`,
        method: 'GET'
      }),
      serializeQueryArgs: () => {
        // Use a consistent cache key for all pages
        return 'favoriteScholarships';
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
      providesTags: ['FavoritesScholarships']
    }),

    addScholarshipToFavorite: builder.mutation({
      query: (scholarship_id) => ({
        url: `scholarships/${scholarship_id}/favorites`,
        method: 'POST'
      }),
      async onQueryStarted(
        scholarship_id,
        { dispatch, queryFulfilled, getState }
      ) {
        // Optimistic update for getScholarships - update all cache entries
        const patchResults: {
          patches: Patch[];
          inversePatches: Patch[];
          undo: () => void;
        }[] = [];
        const cacheEntries = (getState() as any).scholarshipsApi?.queries;

        if (cacheEntries) {
          Object.keys(cacheEntries).forEach((queryKey) => {
            if (queryKey.startsWith('getScholarships')) {
              const cacheEntry = cacheEntries[queryKey];
              if (cacheEntry?.data) {
                const patchResult = dispatch(
                  scholarshipsApi.util.updateQueryData(
                    'getScholarships',
                    cacheEntry.originalArgs,
                    (draft) => {
                      if (draft?.data) {
                        const scholarship = draft.data.find(
                          (s: any) => s._id === scholarship_id
                        );
                        if (scholarship) {
                          if (!scholarship.favouriteBy) {
                            scholarship.favouriteBy = [];
                          }
                          const userId = getCurrentUserId(getState());
                          if (
                            userId &&
                            !scholarship.favouriteBy.includes(userId)
                          ) {
                            scholarship.favouriteBy.push(userId);
                          }
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

        // Optimistic update for getFavoriteScholarships
        const patchResult2 = dispatch(
          scholarshipsApi.util.updateQueryData(
            'getFavoriteScholarships',
            { page: 1, limit: 10 }, // Using consistent args since serializeQueryArgs normalizes this
            (draft) => {
              if (draft?.data) {
                // Add the scholarship to favorites list if not already present
                const existingScholarship = draft.data.find(
                  (s: any) => s._id === scholarship_id
                );
                if (!existingScholarship) {
                  // Get the scholarship data from getScholarships cache
                  const scholarshipsCache = (getState() as any).scholarshipsApi
                    ?.queries;
                  let scholarshipData: any = null;

                  // Find the scholarship in any getScholarships cache entry
                  if (scholarshipsCache) {
                    Object.keys(scholarshipsCache).forEach((key) => {
                      if (
                        key.startsWith('getScholarships') &&
                        !scholarshipData
                      ) {
                        const cacheEntry = scholarshipsCache[key];
                        if (cacheEntry?.data?.data) {
                          const scholarship = cacheEntry.data.data.find(
                            (s: any) => s._id === scholarship_id
                          );
                          if (scholarship) {
                            scholarshipData = scholarship;
                          }
                        }
                      }
                    });
                  }
                  if (scholarshipData) {
                    draft.data.push(scholarshipData);
                    // Update the total count
                    if (draft.meta?.total) {
                      draft.meta.total += 1;
                    }
                  }
                }
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResults.forEach((patchResult) => patchResult.undo());
          patchResult2.undo();
        }
      }
    }),

    removeScholarshipFromFavorite: builder.mutation({
      query: (scholarship_id) => ({
        url: `scholarships/${scholarship_id}/favorites`,
        method: 'DELETE'
      }),
      invalidatesTags: ['FavoritesScholarships'],
      async onQueryStarted(
        scholarship_id,
        { dispatch, queryFulfilled, getState }
      ) {
        // Optimistic update for getScholarships - update all cache entries
        const patchResults: {
          patches: Patch[];
          inversePatches: Patch[];
          undo: () => void;
        }[] = [];
        const cacheEntries = (getState() as any).scholarshipsApi?.queries;

        if (cacheEntries) {
          Object.keys(cacheEntries).forEach((queryKey) => {
            if (queryKey.startsWith('getScholarships')) {
              const cacheEntry = cacheEntries[queryKey];
              if (cacheEntry?.data) {
                const patchResult = dispatch(
                  scholarshipsApi.util.updateQueryData(
                    'getScholarships',
                    cacheEntry.originalArgs,
                    (draft) => {
                      if (draft?.data) {
                        const scholarship = draft.data.find(
                          (s: any) => s._id === scholarship_id
                        );
                        if (scholarship?.favouriteBy) {
                          const userId = getCurrentUserId(getState());
                          if (userId) {
                            scholarship.favouriteBy =
                              scholarship.favouriteBy.filter(
                                (id: string) => id !== userId
                              );
                          }
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

        // Optimistic update for getFavoriteScholarships
        const patchResult2 = dispatch(
          scholarshipsApi.util.updateQueryData(
            'getFavoriteScholarships',
            { page: 1, limit: 10 }, // Using consistent args since serializeQueryArgs normalizes this
            (draft) => {
              if (draft?.data) {
                // Remove the scholarship from favorites list
                draft.data = draft.data.filter(
                  (s: any) => s._id !== scholarship_id
                );
                // Update the total count
                if (draft.meta?.total) {
                  draft.meta.total = Math.max(0, draft.meta.total - 1);
                }
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResults.forEach((patchResult) => patchResult.undo());
          patchResult2.undo();
        }
      }
    })
  })
});

export const {
  useGetScholarshipsQuery,
  useGetScholarshipByIdQuery,
  useApplyForScholarshipMutation,
  useGetUserScholarshipApplicationsQuery,
  useGetFavoriteScholarshipsQuery,
  useAddScholarshipToFavoriteMutation,
  useRemoveScholarshipFromFavoriteMutation
} = scholarshipsApi;
