/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { ChatConversation } from '@/types';
import { notificationsApi } from './notificationsApi';

export interface Message {
  _id: string;
  conversation_id: string;
  content: string;
  sender_type: 'user' | 'campus';
  created_at: string;
  is_read: boolean;
  attachments?: string[];
  pending?: boolean;
}

export interface SendMessageRequest {
  conversation_id: string;
  content: string;
  attachments?: string[];
}

export interface GetMessagesParams {
  conversationId: string;
  page?: number;
  limit?: number;
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Conversations', 'Messages'],
  endpoints: (builder) => ({
    getUserConversations: builder.query<ChatConversation[], void>({
      query: () => '/chat/conversations/user?limit=100',
      transformResponse: (response: any) => {
        if (!Array.isArray(response?.data)) return [];
        return response?.data?.map((conversation: any) => ({
          id: conversation._id,
          campusId: conversation.campus_id?.id || '',
          campusName: conversation.campus_id?.name || '',
          isSupport:
            conversation?.campus_id?.campus_type === 'support' ||
            conversation?.campus_id?.name === 'ScholarBee Support' ||
            false,
          campusLogo: conversation.campus_id?.logo_url || '',
          lastMessage: conversation.last_message,
          lastMessageTime: conversation.last_message_time || '--',
          unread: !conversation.is_read_by_user,
          verified: conversation?.campus_id?.verified || false,
          online: conversation?.is_active || false
        }));
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((conversation) => ({
                type: 'Conversations' as const,
                id: conversation.id
              })),
              { type: 'Conversations' as const, id: 'LIST' }
            ]
          : [{ type: 'Conversations' as const, id: 'LIST' }]
    }),

    // Create a new conversation with a campus
    createConversation: builder.mutation<ChatConversation, string>({
      query: (campusId) => ({
        url: '/chat/conversations',
        method: 'POST',
        body: { campus_id: campusId }
      }),
      transformResponse: (response: any) => ({
        id: response._id,
        campusId: response.campus_id?.id || '',
        campusName: response.campus_id?.name || 'University',
        campusLogo: response.campus_id?.logo_url || '/assets/svg/nust.svg',
        lastMessage: response.last_message?.content || 'No messages yet',
        lastMessageTime: response.last_message_time || new Date().toISOString(),
        unread: !response.is_read_by_user
      }),
      invalidatesTags: [{ type: 'Conversations', id: 'LIST' }]
    }),

    // Get messages for a conversation with pagination
    getConversationMessages: builder.query<Message[], GetMessagesParams>({
      query: ({ conversationId, page = 1, limit = 50 }) =>
        `/chat/messages/${conversationId}?page=${page}&limit=${limit}`,
      transformResponse: (response: any) => {
        return Array.isArray(response.data) ? response.data : [];
      },
      // Handle pagination for infinite scroll
      serializeQueryArgs: ({ queryArgs }) => queryArgs.conversationId,
      merge: (currentCache, newItems, { arg: { page = 1 } }) => {
        if (page === 1) {
          return newItems;
        }
        // Merge without duplicates
        const existingIds = new Set(currentCache.map((item) => item._id));
        const filteredNewItems = newItems.filter(
          (item) => !existingIds.has(item._id)
        );
        return [...currentCache, ...filteredNewItems];
      },
      // Only provide tag for this specific conversation
      providesTags: (result, error, { conversationId }) => [
        { type: 'Messages' as const, id: conversationId }
      ]
    }),

    sendMessage: builder.mutation<
      Message,
      SendMessageRequest & { retryMessageId?: string }
    >({
      query: (messageData) => ({
        url: '/chat/messages/user',
        method: 'POST',
        body: {
          conversation_id: messageData.conversation_id,
          content: messageData.content,
          attachments: messageData.attachments
        }
      }),
      async onQueryStarted(
        { conversation_id, content, attachments, retryMessageId },
        { dispatch, queryFulfilled }
      ) {
        const tempId = retryMessageId || `temp-${Date.now()}`;

        if (retryMessageId) {
          dispatch(
            chatApi.util.updateQueryData(
              'getConversationMessages',
              { conversationId: conversation_id },
              (draft) => {
                const messages = Array.isArray(draft) ? draft : [];
                const messageIndex = messages.findIndex(
                  (m) => m._id === retryMessageId
                );
                if (messageIndex !== -1) {
                  // Update the message to show pending state
                  messages[messageIndex] = {
                    ...messages[messageIndex],
                    pending: true,
                    content: content // Remove "(Not sent)" suffix
                  };
                }
                return messages;
              }
            )
          );
        } else {
          // For new messages, add optimistic update as before
          const optimisticMessage: Message = {
            _id: tempId,
            conversation_id,
            content,
            attachments,
            sender_type: 'user',
            created_at: new Date().toISOString(),
            is_read: true,
            pending: true
          };

          dispatch(
            chatApi.util.updateQueryData(
              'getConversationMessages',
              { conversationId: conversation_id },
              (draft) => {
                const messages = Array.isArray(draft) ? draft : [];
                messages.push(optimisticMessage);
                return messages;
              }
            )
          );
        }

        try {
          // Wait for the actual response
          const { data: resultMessage } = await queryFulfilled;

          dispatch(
            chatApi.util.updateQueryData(
              'getConversationMessages',
              { conversationId: conversation_id },
              (draft) => {
                const messages = Array.isArray(draft) ? draft : [];
                const messageIndex = messages.findIndex(
                  (m) => m._id === tempId
                );

                if (messageIndex !== -1) {
                  // Replace with real message
                  messages[messageIndex] = resultMessage;
                }

                return messages;
              }
            )
          );

          dispatch(
            chatApi.util.updateQueryData(
              'getUserConversations',
              undefined,
              (draft) => {
                const conversations = Array.isArray(draft) ? draft : [];
                const convo = conversations.find(
                  (c) => c.id === conversation_id
                );

                if (convo) {
                  convo.lastMessage = content;
                  convo.lastMessageTime = new Date().toISOString();
                }

                // Reorder conversations: move the conversation to the top when user sends a message
                conversations.sort((a, b) => {
                  if (a.id === conversation_id) {
                    return -1;
                  }
                  if (b.id === conversation_id) {
                    return 1;
                  }

                  const timeA = new Date(a.lastMessageTime).getTime();
                  const timeB = new Date(b.lastMessageTime).getTime();
                  return timeB - timeA;
                });

                return conversations;
              }
            )
          );
        } catch (error) {
          dispatch(
            chatApi.util.updateQueryData(
              'getConversationMessages',
              { conversationId: conversation_id },
              (draft) => {
                const messages = Array.isArray(draft) ? draft : [];
                const failedMessage = messages.find((m) => m._id === tempId);

                if (failedMessage) {
                  failedMessage.pending = false;
                  failedMessage._id = `failed-${tempId}`;
                  failedMessage.content = `${content} (Not sent)`;
                }

                return messages;
              }
            )
          );

          console.error('Failed to send message:', error);
        }
      }
    }),

    // Get support campus
    getSupportCampus: builder.query<any, void>({
      query: () => '/campuses/support-campus'
    }),

    // Mark conversation as read
    markConversationAsRead: builder.mutation<void, string>({
      query: (conversationId) => ({
        url: `/chat/conversations/${conversationId}/read/user`,
        method: 'PATCH'
      }),
      // Update the conversation list to reflect read status
      async onQueryStarted(conversationId, { dispatch, queryFulfilled }) {
        // Optimistically update read status in the list
        const patchResult = dispatch(
          chatApi.util.updateQueryData(
            'getUserConversations',
            undefined,
            (draft) => {
              const conversation = draft.find((c) => c.id === conversationId);
              if (conversation) {
                conversation.unread = false;
              }
            }
          )
        );

        // Optimistically update unread messages count
        const unreadCountPatchResult = dispatch(
          notificationsApi.util.updateQueryData(
            'getUnreadMessagesCount',
            undefined,
            (draft) => {
              if (draft) {
                const index = draft.conversationIds.indexOf(conversationId);
                if (index > -1) {
                  draft.conversationIds.splice(index, 1);
                  draft.count = Math.max(0, draft.count - 1);
                }
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResult.undo();
          unreadCountPatchResult.undo();
        }
      },
      invalidatesTags: (result, error, conversationId) => [
        { type: 'Conversations', id: conversationId }
      ]
    })
  })
});

export const {
  useGetUserConversationsQuery,
  useCreateConversationMutation,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useMarkConversationAsReadMutation,
  useGetSupportCampusQuery,
  useLazyGetSupportCampusQuery
} = chatApi;
