/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import store from '@/redux/store';
import {
  addNotificationFromSocket,
  notificationsApi
} from '@/redux/api/notificationsApi';
import { chatApi, Message } from '@/redux/api/chatApi';
import { setUnreadConversationsCount } from '@/redux/slices/chatSlice';
import {
  NOTIFICATION_SOCKET_URL as CONFIG_NOTIFICATION_SOCKET_URL,
  CHAT_SOCKET_URL as CONFIG_CHAT_SOCKET_URL
} from '@/config/config';

interface ExtendedSocket extends Socket {
  _notificationHandlersSet?: boolean;
  _chatHandlersSet?: boolean;
}

const socketInstances: Map<string, ExtendedSocket> = new Map();

let reconnectionInProgress = false;

// Track current conversation
let currentConversationId: string | null = null;

export const NOTIFICATION_SOCKET_URL = CONFIG_NOTIFICATION_SOCKET_URL;
export const CHAT_SOCKET_URL = CONFIG_CHAT_SOCKET_URL;

export const isSocketConnected = (): boolean => {
  if (typeof window === 'undefined') return false;
  const socket = socketInstances.get(NOTIFICATION_SOCKET_URL);
  return !!socket?.connected;
};

export const isChatSocketConnected = (): boolean => {
  if (typeof window === 'undefined') return false;
  const socket = socketInstances.get(CHAT_SOCKET_URL);
  return !!socket?.connected;
};

export const isNotificationSocketConnected = (): boolean => {
  if (typeof window === 'undefined') return false;
  const socket = socketInstances.get(NOTIFICATION_SOCKET_URL);
  return !!socket?.connected;
};

const isTokenValid = (token: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn('Token has expired');
      return false;
    }
    return true;
  } catch (e) {
    console.error('Error validating token:', e);
    return false;
  }
};

export const clearSocketInstances = (): void => {
  socketInstances.forEach((socket) => {
    if (socket.connected) {
      socket.disconnect();
    }
  });

  socketInstances.clear();
};

const isFullReconnectNeeded = (): boolean => {
  if (typeof window === 'undefined') return false;
  const entries = Array.from(socketInstances.entries());
  for (const [url, socket] of entries) {
    if (!socket.connected && url === NOTIFICATION_SOCKET_URL) {
      return true;
    }
  }
  return false;
};

export const reconnectWithNewToken = async (
  reconnectChatSocket = false,
  forceReconnect = false
): Promise<void> => {
  try {
    if (reconnectionInProgress) {
      return;
    }

    reconnectionInProgress = true;

    const token = Cookies.get('access_token');
    if (!token) {
      reconnectionInProgress = false;
      return;
    }

    if (!isTokenValid(token)) {
      reconnectionInProgress = false;
      return;
    }

    const needsFullReconnect = isFullReconnectNeeded() || forceReconnect;

    if (!needsFullReconnect && socketInstances.has(NOTIFICATION_SOCKET_URL)) {
      reconnectionInProgress = false;
      return;
    }

    socketInstances.forEach((socket) => {
      if (socket.connected) {
        socket.disconnect();
      }
    });

    socketInstances.clear();

    getNotificationSocket();

    if (reconnectChatSocket) {
      getChatSocketWithHandlers();
    }

    setTimeout(() => {
      reconnectionInProgress = false;
    }, 500);
  } catch {
    reconnectionInProgress = false;
  }
};

const tryRefreshToken = async (): Promise<boolean> => {
  try {
    // Check if refresh token exists
    const refreshTokenCookie = Cookies.get('refresh_token');
    if (!refreshTokenCookie) {
      return false;
    }

    const axiosWithAuth = await import('./axiosWithAuth');
    await axiosWithAuth.refreshToken();

    const newToken = Cookies.get('access_token');
    if (newToken && isTokenValid(newToken)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

export const getSocket = (socketUrl: string): ExtendedSocket | null => {
  if (socketInstances.has(socketUrl)) {
    const socket = socketInstances.get(socketUrl);
    return socket || null;
  }

  const token = Cookies.get('access_token');

  if (!token || !isTokenValid(token)) {
    setTimeout(async () => {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        reconnectWithNewToken(false);
      }
    }, 0);

    return null;
  }

  const isNotificationSocket = socketUrl === NOTIFICATION_SOCKET_URL;
  const finalUrl = isNotificationSocket
    ? `${socketUrl}?token=${token}`
    : socketUrl;

  const socket = io(finalUrl, {
    transports: ['websocket', 'polling'],
    path: '/socket.io',
    query: isNotificationSocket ? {} : { token },
    forceNew: true, // Use a new connection for each different URL
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  }) as ExtendedSocket;

  // Validate socket object
  if (!socket || typeof socket.on !== 'function') {
    console.error('[Socket] Invalid socket object created:', socket);
    return null;
  }

  // Set up common event handlers
  socket.on('connect', () => {
    console.log(`✅ Socket connected to ${socketUrl}`);
  });

  socket.on('connect_error', async (err) => {
    if (
      err.message.includes('Unauthorized') ||
      err.message.includes('jwt expired')
    ) {
      const refreshed = await tryRefreshToken();

      if (refreshed) {
        socketInstances.delete(socketUrl);
        if (socketUrl === NOTIFICATION_SOCKET_URL) {
          getNotificationSocket();
        } else if (socketUrl === CHAT_SOCKET_URL) {
          getChatSocketWithHandlers();
        }
      } else {
        socketInstances.delete(socketUrl);
      }
    }
  });

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      socketInstances.delete(socketUrl);
    }
  });

  socket.on('reconnect', () => {
    // Silent reconnect
  });

  socket.on('reconnect_attempt', () => {
    // Silent reconnect attempt
  });

  socket.on('error', () => {
    // Silent error handling
  });

  socketInstances.set(socketUrl, socket);
  return socket;
};

export const getChatSocket = (): ExtendedSocket | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return getSocket(CHAT_SOCKET_URL);
};

export const getChatSocketWithHandlers = (): ExtendedSocket | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const socket = getSocket(CHAT_SOCKET_URL);

  if (socket?.on && !socket._chatHandlersSet) {
    // Listen to chat/notification/message event
    socket.on('chat/notification/message', (data: any) => {
      console.log('🔔 Chat notification message received:', data);

      try {
        // Extract message from the notification data
        let message: Message;

        if (data.messageSnippet && data.conversationId && data.messageId) {
          // Notification format: { conversationId, messageId, senderId, messageSnippet, timestamp }
          message = {
            _id: data.messageId,
            conversation_id: data.conversationId,
            content: data.messageSnippet,
            sender_type: data.senderId ? 'campus' : 'user', // Determine type based on senderId presence
            created_at: data.timestamp,
            is_read: false,
            attachments: []
          };
        } else if (data.message && typeof data.message === 'object') {
          // Nested message format
          message = {
            _id: data.message._id,
            conversation_id: data.message.conversation_id,
            content: data.message.content,
            sender_type: data.message.sender_type,
            created_at: data.message.created_at,
            is_read: data.message.is_read_by_user || false,
            attachments: data.message.attachments || []
          };
        } else if (data.content && data.sender_type && data.conversation_id) {
          // Direct message format
          message = {
            _id: data._id,
            conversation_id: data.conversation_id,
            content: data.content,
            sender_type: data.sender_type,
            created_at: data.created_at,
            is_read: false,
            attachments: data.attachments || []
          };
        } else {
          return;
        }

        // Update conversations list for notification messages
        store.dispatch(
          chatApi.util.updateQueryData(
            'getUserConversations',
            undefined,
            (draft) => {
              const conversations = Array.isArray(draft) ? draft : [];
              const convo = conversations.find(
                (c) => c.id === message.conversation_id
              );

              if (convo) {
                convo.lastMessage = message.content;
                convo.lastMessageTime = message.created_at;
                // Mark as unread since it's a notification (not active conversation)
                convo.unread = true;
              }

              // Reorder conversations: unread first, then by most recent message time
              conversations.sort((a, b) => {
                // First priority: unread conversations go to top
                if (a.unread && !b.unread) return -1;
                if (!a.unread && b.unread) return 1;

                // Second priority: sort by most recent message time
                const timeA = new Date(a.lastMessageTime).getTime();
                const timeB = new Date(b.lastMessageTime).getTime();
                return timeB - timeA;
              });

              const unreadCount = conversations.filter((c) => c.unread).length;
              store.dispatch(setUnreadConversationsCount(unreadCount));

              return conversations;
            }
          )
        );

        // Optimistic update for unread messages count
        store.dispatch(
          notificationsApi.util.updateQueryData(
            'getUnreadMessagesCount',
            undefined,
            (draft) => {
              if (!draft) {
                return {
                  count: 1,
                  conversationIds: [message.conversation_id]
                };
              }

              const conversationExists = draft.conversationIds.includes(
                message.conversation_id
              );

              if (!conversationExists) {
                draft.conversationIds.push(message.conversation_id);
                draft.count += 1;
              }

              return draft;
            }
          )
        );

        // Dispatch custom window event for useChatSocket to handle
        const notificationEvent = new CustomEvent('chatNotificationMessage', {
          detail: data
        });
        window.dispatchEvent(notificationEvent);

        // Optionally update message cache for this conversation if it exists (fallback)
        store.dispatch(
          chatApi.util.updateQueryData(
            'getConversationMessages',
            { conversationId: message.conversation_id },
            (draft: any) => {
              // Only update if this conversation's messages are already cached
              let messages: any[];

              if (Array.isArray(draft)) {
                // Normal case: draft is already the array from transformResponse
                messages = draft;
              } else if (draft && Array.isArray(draft.data)) {
                // Fallback case: draft is the full API response structure
                messages = draft.data;
              } else {
                // No valid cache data, skip update
                console.log(
                  '[Socket] No valid cache data for notification, skipping update'
                );
                return draft;
              }

              const exists = messages.some((m: any) => m._id === message._id);

              if (!exists) {
                messages.push(message);
              }

              // Return the same structure we received
              if (Array.isArray(draft)) {
                return messages;
              } else {
                return { ...draft, data: messages };
              }
            }
          )
        );
      } catch {
        // Silent error handling
      }
    });

    // Listen to chat/conversation/message event
    socket.on('chat/conversation/message', (data: any) => {
      console.log('💬 Chat conversation message received:', data);

      try {
        // Extract message from the data
        let message: Message;

        if (
          data._id &&
          data.conversation_id &&
          data.content &&
          data.sender_type
        ) {
          // Direct conversation format: { _id, conversation_id, content, sender_type, created_at, ... }
          message = {
            _id: data._id,
            conversation_id: data.conversation_id,
            content: data.content,
            sender_type: data.sender_type,
            created_at: data.created_at,
            is_read: data.is_read_by_user || true,
            attachments: data.attachments || []
          };
        } else if (data.message && typeof data.message === 'object') {
          // Nested message format
          message = {
            _id: data.message._id,
            conversation_id: data.message.conversation_id,
            content: data.message.content,
            sender_type: data.message.sender_type,
            created_at: data.message.created_at,
            is_read: data.message.is_read_by_user || true,
            attachments: data.message.attachments || []
          };
        } else if (data.content && data.sender_type && data.conversation_id) {
          // Alternative direct message format
          message = {
            _id: data._id,
            conversation_id: data.conversation_id,
            content: data.content,
            sender_type: data.sender_type,
            created_at: data.created_at,
            is_read: true,
            attachments: data.attachments || []
          };
        } else {
          return;
        }

        // Dispatch custom window event for useChatSocket to handle
        const event = new CustomEvent('chatConversationMessage', {
          detail: data
        });
        window.dispatchEvent(event);

        // Update conversation messages (fallback)
        store.dispatch(
          chatApi.util.updateQueryData(
            'getConversationMessages',
            { conversationId: message.conversation_id },
            (draft: any) => {
              // The draft should be an array after transformResponse
              // But let's be defensive and handle both cases
              let messages: any[];

              if (Array.isArray(draft)) {
                // Normal case: draft is already the array from transformResponse
                messages = draft;
              } else if (draft && Array.isArray(draft.data)) {
                // Fallback case: draft is the full API response structure
                messages = draft.data;
              } else {
                // Edge case: no valid data structure
                console.warn('[Socket] Invalid draft structure:', draft);
                return draft || [];
              }

              // Check for duplicates
              const exists = messages.some((m: any) => m._id === message._id);

              if (!exists) {
                messages.push(message);
                console.log(
                  '[Socket] Added message to cache, total messages:',
                  messages.length
                );
              } else {
                console.log('[Socket] Message already exists in cache');
              }

              // Return the same structure we received
              if (Array.isArray(draft)) {
                return messages;
              } else {
                return { ...draft, data: messages };
              }
            }
          )
        );

        // Update conversations list
        store.dispatch(
          chatApi.util.updateQueryData(
            'getUserConversations',
            undefined,
            (draft: any) => {
              const conversations = Array.isArray(draft?.data || [])
                ? draft?.data
                : [];
              const convo = conversations.find(
                (c: any) => c.id === message.conversation_id
              );

              if (convo) {
                convo.lastMessage = message.content;
                convo.lastMessageTime = message.created_at;
                // Don't mark as unread since it's for active conversation
                convo.unread = false;
              }

              conversations.sort((a: any, b: any) => {
                if (
                  a.id === message.conversation_id &&
                  message.sender_type === 'user'
                ) {
                  return -1;
                }
                if (
                  b.id === message.conversation_id &&
                  message.sender_type === 'user'
                ) {
                  return 1;
                }

                const timeA = new Date(a.lastMessageTime).getTime();
                const timeB = new Date(b.lastMessageTime).getTime();
                return timeB - timeA;
              });

              // Update global unread count for navbar badge
              const unreadCount = conversations.filter(
                (c: any) => c.unread
              ).length;
              store.dispatch(setUnreadConversationsCount(unreadCount));

              return conversations;
            }
          )
        );
      } catch {
        // Silent error handling
      }
    });

    socket._chatHandlersSet = true;
  }

  return socket;
};

export const getNotificationSocket = (): ExtendedSocket | null => {
  const socket = getSocket(NOTIFICATION_SOCKET_URL);

  if (socket?.on && !socket._notificationHandlersSet) {
    socket.on('notification/user/specific', (response: any) => {
      // Extract notification from the response and use it directly
      const notification = response.data ?? response;

      // Ensure notification is valid before dispatching
      if (notification?._id) {
        // Dispatch action to add the notification to the store
        store.dispatch(addNotificationFromSocket(notification));
      }
    });

    socket.on('notification/user/global', (response: any) => {
      // Extract notification from the response and use it directly
      const notification = response.data ?? response;

      // Ensure notification is valid before dispatching
      if (notification?._id) {
        // Dispatch action to add the notification to the store
        store.dispatch(addNotificationFromSocket(notification));
      }
    });

    socket.on('error', async (data) => {
      if (
        data &&
        (data.error === 'Unauthorized' || data.message === 'jwt expired')
      ) {
        const refreshed = await tryRefreshToken();

        if (refreshed) {
          socketInstances.delete(NOTIFICATION_SOCKET_URL);
          getNotificationSocket();
        } else {
          socketInstances.delete(NOTIFICATION_SOCKET_URL);
        }
      }
    });

    socket._notificationHandlersSet = true;
  }

  return socket;
};

export const joinConversation = (conversationId: string): void => {
  const socket = getChatSocket();
  if (socket?.connected) {
    // Leave previous conversation if exists
    if (currentConversationId && currentConversationId !== conversationId) {
      socket.emit('leave/conversation', currentConversationId);
    }

    // Join new conversation
    socket.emit('join/conversation', conversationId);
    currentConversationId = conversationId;
  }
};

export const leaveConversation = (conversationId: string): void => {
  const socket = getChatSocket();
  if (socket?.connected) {
    socket.emit('leave/conversation', conversationId);
    if (currentConversationId === conversationId) {
      currentConversationId = null;
    }
  }
};

export const calculateInitialUnreadCount = (conversations: any[]): void => {
  if (!conversations) return;

  const unreadCount = conversations.filter((c) => c.unread).length;
  store.dispatch(setUnreadConversationsCount(unreadCount));
};
