/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from '@reduxjs/toolkit/query/react';
import { User } from '@/app/create-profile/constants/types';
import { baseQueryWithReauth } from './baseQuery';

interface EducationalBackground {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  transcript?: string;
}

interface NationalIDCard {
  front_side: string;
  back_side: string;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'EducationalBackground', 'NationalIDCard'],
  endpoints: (builder) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getUser: builder.query<any, { isCritical?: boolean } | void>({
      query: (arg) => ({
        url: '/users/profile/me',
        meta: {
          isCritical: arg?.isCritical !== false // Default to true if not specified
        }
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 60, // Keep data in cache for 60 seconds to prevent skeleton flicker on navigation
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          console.log('User profile fetch failed, will just show login UI');
        }
      },
      transformErrorResponse: (response, meta, arg) => {
        if (arg && 'isCritical' in arg && arg.isCritical === false) {
          console.log('Non-critical user request failed, returning null');
          return null;
        }
        return response;
      }
    }),
    updateUser: builder.mutation<
      User,
      { user_id: string; data: Partial<User> }
    >({
      query: ({ user_id, data }) => ({
        url: `/users/${user_id}`,
        method: 'PATCH',
        body: data
      }),
      async onQueryStarted({ user_id, data }, { queryFulfilled, dispatch }) {
        console.log('onQueryStarted', user_id, data);
        try {
          await queryFulfilled;
          dispatch(userApi.util.invalidateTags(['User']));
        } catch (err) {
          console.error('Update failed', err);
        }
      }
    }),
    addEducationalBackground: builder.mutation<
      EducationalBackground,
      { user_id: string; data: EducationalBackground }
    >({
      query: ({ user_id, data }) => ({
        url: `/users/${user_id}/educational-backgrounds`,
        method: 'POST',
        body: data
      }),
      async onQueryStarted({ user_id, data }, { queryFulfilled, dispatch }) {
        console.log('Adding educational background', user_id, data);
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags(['User', 'EducationalBackground'])
          );
        } catch (err) {
          console.error('Adding educational background failed', err);
        }
      }
    }),
    updateEducationalBackground: builder.mutation<
      EducationalBackground,
      {
        user_id: string;
        educational_background_id: string;
        data: Partial<EducationalBackground>;
      }
    >({
      query: ({ user_id, educational_background_id, data }) => ({
        url: `/users/${user_id}/educational-backgrounds/${educational_background_id}`,
        method: 'PATCH',
        body: data
      }),
      async onQueryStarted(
        { user_id, educational_background_id, data },
        { queryFulfilled, dispatch }
      ) {
        console.log(
          'Updating educational background',
          user_id,
          educational_background_id,
          data
        );
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags(['User', 'EducationalBackground'])
          );
        } catch (err) {
          console.error('Updating educational background failed', err);
        }
      }
    }),
    deleteEducationalBackground: builder.mutation<
      void,
      { user_id: string; educational_background_id: string }
    >({
      query: ({ user_id, educational_background_id }) => ({
        url: `/users/${user_id}/educational-backgrounds/${educational_background_id}`,
        method: 'DELETE'
      }),
      async onQueryStarted(
        { user_id, educational_background_id },
        { queryFulfilled, dispatch }
      ) {
        console.log(
          'Deleting educational background',
          user_id,
          educational_background_id
        );
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags(['User', 'EducationalBackground'])
          );
        } catch (err) {
          console.error('Deleting educational background failed', err);
        }
      }
    }),
    addNationalIDCard: builder.mutation<
      NationalIDCard,
      { user_id: string; data: any }
    >({
      query: ({ user_id, data }) => ({
        url: `/users/${user_id}/national-id-card`,
        method: 'POST',
        body: data
      }),
      async onQueryStarted({ user_id, data }, { queryFulfilled, dispatch }) {
        console.log('Adding national ID card', user_id, data);
        try {
          await queryFulfilled;
          dispatch(userApi.util.invalidateTags(['User', 'NationalIDCard']));
        } catch (err) {
          console.error('Adding national ID card failed', err);
        }
      }
    }),
    updateNationalIDCard: builder.mutation<
      NationalIDCard,
      { user_id: string; data: any }
    >({
      query: ({ user_id, data }) => ({
        url: `/users/${user_id}/national-id-card`,
        method: 'PATCH',
        body: data
      }),
      async onQueryStarted({ user_id, data }, { queryFulfilled, dispatch }) {
        console.log('Updating national ID card', user_id, data);
        try {
          await queryFulfilled;
          dispatch(userApi.util.invalidateTags(['User', 'NationalIDCard']));
        } catch (err) {
          console.error('Updating national ID card failed', err);
        }
      }
    }),
    resendVerificationEmail: builder.mutation<
      { success: boolean; message: string },
      { email: string }
    >({
      query: ({ email }) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body: { email }
      })
    }),
    updateMe: builder.mutation<User, any>({
      query: (data) => ({
        url: '/users/me',
        method: 'PATCH',
        body: data
      }),
      async onQueryStarted(data, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(userApi.util.invalidateTags(['User']));
        } catch (err) {
          console.error('updateMe failed', err);
        }
      }
    })
  })
});

export const {
  useGetUserQuery,
  useUpdateUserMutation,
  useAddEducationalBackgroundMutation,
  useUpdateEducationalBackgroundMutation,
  useDeleteEducationalBackgroundMutation,
  useAddNationalIDCardMutation,
  useUpdateNationalIDCardMutation,
  useResendVerificationEmailMutation,
  useUpdateMeMutation
} = userApi;
