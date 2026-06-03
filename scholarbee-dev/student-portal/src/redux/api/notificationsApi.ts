import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  audience?: {
    audienceType: string;
    isGlobal: boolean;
    recipients?: string[];
  };
  createdAt: string;
  __v?: number;
  notificationType?: string;
  isRead: boolean;
  image_url?: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  message: null | string;
}

export interface NotificationCountResponse {
  count: number;
}

export interface SocketNotificationResponse {
  success: boolean;
  data: Notification;
  message: null | string;
}

export interface UnreadMessagesCountResponse {
  count: number;
  conversationIds: string[];
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Notifications'],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params = {}) => ({
        url: '/notifications',
        params: {
          read_status: params?.read_status ?? 'any',
          scope: params?.scope ?? 'all',
          limit: params?.limit ?? 10,
          page: params?.page ?? 1,
          category: params?.category
        },
        meta: {
          isCritical: params?.isCritical !== false
        }
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }: { _id: string }) => ({
                type: 'Notifications' as const,
                id: _id
              })),
              { type: 'Notifications', id: 'LIST' }
            ]
          : [{ type: 'Notifications', id: 'LIST' }],
      transformErrorResponse: (response, meta, arg) => {
        if (arg && 'isCritical' in arg && arg.isCritical === false) {
          return { success: true, data: [], message: null };
        }
        return response;
      }
    }),
    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/mark-read/${id}`,
        method: 'PATCH'
      }),
      invalidatesTags: [{ type: 'Notifications', id: 'LIST' }]
    }),
    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/mark-read-all',
        method: 'PATCH'
      }),
      invalidatesTags: [{ type: 'Notifications', id: 'LIST' }]
    }),
    markNotificationsAsReadBulk: builder.mutation<void, string[]>({
      query: (notificationIds) => ({
        url: '/notifications/mark-read/bulk',
        method: 'PATCH',
        body: { notificationIds }
      }),
      invalidatesTags: [{ type: 'Notifications', id: 'LIST' }]
    }),
    getUnreadMessagesCount: builder.query<UnreadMessagesCountResponse, void>({
      query: () => ({
        url: '/chat/conversations/user/count?read_status=unread'
      }),
      providesTags: [{ type: 'Notifications', id: 'UNREAD_COUNT' }]
    }),
    getNotificationCount: builder.query<NotificationCountResponse, void>({
      query: () => ({
        url: '/notifications/count'
      }),
      providesTags: [{ type: 'Notifications', id: 'COUNT' }]
    })
  })
});

export const addNotificationFromSocket = (notification: Notification) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (dispatch: any, getState: any) => {
    const state = getState();
    const notificationsInCache = state.notificationsApi.queries;

    if (!notificationsInCache) {
      console.error(
        '❌ No notifications cache found in state. Cache may not be initialized yet.'
      );
      return;
    }

    const queryKeys = Object.keys(notificationsInCache || {});

    const notificationsQueryKey = queryKeys.find(
      (key) =>
        key.startsWith('getNotifications') &&
        notificationsInCache[key]?.status === 'fulfilled'
    );

    if (!notificationsQueryKey) {
      console.error(
        '❌ No active notifications query found. Try refreshing the page.'
      );
      return;
    }

    const currentQueryData = notificationsInCache[notificationsQueryKey]?.data;

    if (!currentQueryData?.data) {
      console.error('❌ Query data is invalid');
      return;
    }

    const queryParams = notificationsInCache[notificationsQueryKey]
      ?.originalArgs || { read_status: 'any' };

    try {
      dispatch(
        notificationsApi.util.updateQueryData(
          'getNotifications',
          queryParams,
          (draft) => {
            const exists = draft.data.some(
              (existingNotification: { _id: string }) =>
                existingNotification._id === notification._id
            );

            if (!exists) {
              draft.data.unshift({
                ...notification,
                isRead: false
              });
            }
          }
        )
      );

      queryKeys.forEach((key) => {
        if (
          key !== notificationsQueryKey &&
          key.startsWith('getNotifications') &&
          notificationsInCache[key]?.status === 'fulfilled'
        ) {
          const params = notificationsInCache[key]?.originalArgs || {
            read_status: 'any'
          };

          dispatch(
            notificationsApi.util.updateQueryData(
              'getNotifications',
              params,
              (draft) => {
                const exists = draft.data.some(
                  (existingNotification: { _id: string }) =>
                    existingNotification._id === notification._id
                );

                if (!exists) {
                  draft.data.unshift({
                    ...notification,
                    isRead: false
                  });
                }
              }
            )
          );
        }
      });
    } catch (error) {
      console.error('❌ Error updating notifications cache:', error);
    }
  };
};

export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationsAsReadBulkMutation,
  useGetUnreadMessagesCountQuery,
  useGetNotificationCountQuery
} = notificationsApi;
