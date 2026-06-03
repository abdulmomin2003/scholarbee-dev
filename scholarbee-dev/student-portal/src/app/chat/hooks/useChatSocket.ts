/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useCallback } from 'react';
import {
  getChatSocket,
  joinConversation,
  leaveConversation
} from '@/lib/socket';
import { useAppDispatch } from '@/redux/hooks';
import { chatApi, Message } from '@/redux/api/chatApi';

export const useChatSocket = (conversationId: string) => {
  const dispatch = useAppDispatch();
  const previousConversationRef = useRef<string | null>(null);

  const handleMessage = useCallback(
    (data: any) => {
      console.log(`[Socket] Message received:`, data);

      try {
        // Parse string data if needed
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            console.error('[Socket] Failed to parse message data string:', e);
          }
        }

        const isActiveConversation = data.isActiveConversation || false;
        console.log(`[Socket] Is active conversation: ${isActiveConversation}`);

        // Extract the message from various possible formats
        let message: Message;

        if (data.message && typeof data.message === 'object') {
          // Format from your screenshot: { message: {...} }
          console.log('[Socket] Using nested message format');
          message = {
            _id: data.message._id,
            conversation_id: data.message.conversation_id,
            content: data.message.content,
            sender_type: data.message.sender_type,
            created_at: data.message.created_at,
            is_read: data.message.is_read_by_user || false,
            attachments: data.message.attachments || []
          };
        } else if (data.content && data.sender_type) {
          // Direct message format
          console.log('[Socket] Using direct message format');
          message = {
            _id: data._id,
            conversation_id: data.conversation_id,
            content: data.content,
            sender_type: data.sender_type,
            created_at: data.created_at,
            is_read: data.is_read_by_user || false,
            attachments: data.attachments || []
          };
        } else if (
          data.messageSnippet &&
          (data.senderId || data.conversationId)
        ) {
          // New backend format with messageSnippet
          // If senderId exists, it's likely from campus; otherwise it's from user
          const senderType = data.senderId ? 'campus' : 'user';
          console.log(
            `[Socket] Using messageSnippet format, sender: ${senderType}`
          );

          message = {
            _id: data.messageId,
            conversation_id: data.conversationId,
            content: data.messageSnippet,
            sender_type: senderType,
            created_at: data.timestamp,
            is_read: true, // Assume read for now
            attachments: []
          };
        } else {
          console.error('[Socket] Unknown message format:', data);
          return;
        }

        console.log('[Socket] Processed message:', message);
        console.log('[Socket] Current conversationId:', conversationId);
        console.log(
          '[Socket] Message conversation_id:',
          message.conversation_id
        );

        // Update messages in the UI if this message belongs to the currently active conversation
        // We check if the message is for the current conversation, regardless of isActiveConversation flag
        if (message.conversation_id === conversationId) {
          console.log(
            '[Socket] Message belongs to current conversation, updating chat UI'
          );

          // Update messages for this conversation
          dispatch(
            chatApi.util.updateQueryData(
              'getConversationMessages',
              { conversationId: message.conversation_id },
              (draft: any) => {
                console.log('[Socket] Before update - draft:', draft);

                // Handle both array and API response structures
                let messages: any[];

                if (Array.isArray(draft)) {
                  // Normal case: draft is already the array from transformResponse
                  messages = draft;
                } else if (draft && Array.isArray(draft.data)) {
                  // Fallback case: draft is the full API response structure
                  messages = draft.data;
                } else {
                  // Edge case: no valid data structure
                  console.warn(
                    '[Socket] Invalid draft structure in useChatSocket:',
                    draft
                  );
                  messages = [];
                }

                console.log(
                  '[Socket] Messages array length before:',
                  messages.length
                );

                // Simple duplicate check by ID only
                const exists = messages.some((m: any) => m._id === message._id);

                // Also check if we have a pending message with the same content
                const hasPendingDuplicate = messages.some(
                  (m: any) =>
                    m.pending &&
                    m.content === message.content &&
                    m.sender_type === message.sender_type
                );

                if (!exists && !hasPendingDuplicate) {
                  messages.push(message);
                  console.log(
                    '[Socket] Added new message to active conversation'
                  );
                  console.log(
                    '[Socket] Messages array length after:',
                    messages.length
                  );
                } else if (hasPendingDuplicate) {
                  // Find and replace the pending message with the real one
                  const pendingIndex = messages.findIndex(
                    (m: any) =>
                      m.pending &&
                      m.content === message.content &&
                      m.sender_type === message.sender_type
                  );

                  if (pendingIndex !== -1) {
                    messages[pendingIndex] = message;
                    console.log(
                      '[Socket] Replaced pending message with real one'
                    );
                  }
                } else {
                  console.log('[Socket] Message already exists');
                }

                console.log('[Socket] Final messages array:', messages);

                // Return the same structure we received
                if (Array.isArray(draft)) {
                  return messages;
                } else {
                  return { ...draft, data: messages };
                }
              }
            )
          );

          // No invalidation needed - optimistic updates should handle all cases
          // If a message doesn't appear, it's likely a data structure or timing issue
        } else {
          console.log(
            '[Socket] Message is for different conversation, not updating chat UI'
          );
        }

        // Always update the conversations list for all messages
        dispatch(
          chatApi.util.updateQueryData(
            'getUserConversations',
            undefined,
            (draft: any) => {
              const conversations = Array.isArray(draft) ? draft : [];

              const convo = conversations.find(
                (c) => c.id === message.conversation_id
              );
              if (convo) {
                convo.lastMessage = message.content;
                convo.lastMessageTime = message.created_at;
                // Mark as unread if it's from campus and not from the active conversation
                convo.unread =
                  message.sender_type === 'campus' && !isActiveConversation;
                console.log('[Socket] Updated conversation preview');
              }

              return conversations;
            }
          )
        );
      } catch (e) {
        console.error('[Socket] Error processing message:', e);
      }
    },
    [dispatch, conversationId]
  );

  useEffect(() => {
    if (!conversationId) return;

    // Set up event listeners for the new message events
    const handleActiveConversationMessage = (event: CustomEvent) => {
      console.log('💬 Conversation message received:', event.detail);
      handleMessage(event.detail);
    };

    const handleNotificationMessage = (event: CustomEvent) => {
      console.log('🔔 Notification message received:', event.detail);
      handleMessage(event.detail);
    };

    // Add event listeners
    window.addEventListener(
      'chatConversationMessage',
      handleActiveConversationMessage as EventListener
    );
    window.addEventListener(
      'chatNotificationMessage',
      handleNotificationMessage as EventListener
    );

    // Leave previous conversation if switching
    if (
      previousConversationRef.current &&
      previousConversationRef.current !== conversationId
    ) {
      console.log(
        '[Socket] Leaving previous conversation:',
        previousConversationRef.current
      );
      leaveConversation(previousConversationRef.current);
    }

    previousConversationRef.current = conversationId;

    // Join new conversation
    const socket = getChatSocket();

    if (typeof socket?.on === 'function') {
      if (!socket.connected) {
        socket.on('connect', () => {
          console.log('[Socket] Connected, joining:', conversationId);
          joinConversation(conversationId);
        });
      } else {
        console.log('[Socket] Already connected, joining:', conversationId);
        joinConversation(conversationId);
      }
    } else {
      console.warn(
        '[Socket] Socket not available or invalid, skipping connection setup'
      );
    }

    // Cleanup
    return () => {
      console.log('[Socket] Cleaning up:', conversationId);
      window.removeEventListener(
        'chatConversationMessage',
        handleActiveConversationMessage as EventListener
      );
      window.removeEventListener(
        'chatNotificationMessage',
        handleNotificationMessage as EventListener
      );
    };
  }, [conversationId, dispatch, handleMessage]);
};
