/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  useGetUserConversationsQuery,
  useCreateConversationMutation,
  useGetConversationMessagesQuery,
  useMarkConversationAsReadMutation
} from '@/redux/api/chatApi';
import { useSearchParams, useRouter } from 'next/navigation';
import { leaveConversation, calculateInitialUnreadCount } from '@/lib/socket';

export const useChats = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campusId = searchParams.get('campusId');
  const conversationId = searchParams.get('conversationId');

  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [initializing, setInitializing] = useState(!!campusId);
  const [chatSearch, setChatSearch] = useState('');
  const campusIdHandledRef = useRef<string | null>(null);
  const currentConversationRef = useRef<string | null>(null);

  const { data: conversations = [], isLoading: isLoadingConversations } =
    useGetUserConversationsQuery();

  const [createConversation, { isLoading: isCreatingConversation }] =
    useCreateConversationMutation();

  const [markConversationAsRead] = useMarkConversationAsReadMutation();

  const {
    data: messages,
    isLoading: isLoadingMessages,
    isFetching
  } = useGetConversationMessagesQuery(
    { conversationId: selectedChat?.id },
    { skip: !selectedChat?.id }
  );

  // Auto-select chat if conversationId exists
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const matched = conversations.find((c) => c.id === conversationId);
      if (matched) {
        setSelectedChat(matched);
        currentConversationRef.current = matched.id;
      }
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    const createNewConversation = async () => {
      if (campusId && campusId !== campusIdHandledRef.current) {
        campusIdHandledRef.current = campusId;
        setInitializing(true);

        try {
          const existingConversation = conversations.find(
            (conv) => conv.campusId === campusId
          );

          if (existingConversation) {
            setSelectedChat(existingConversation);
            currentConversationRef.current = existingConversation.id;
            router.replace(`/chat?conversationId=${existingConversation.id}`, {
              scroll: false
            });
          } else {
            const newChat = await createConversation(campusId).unwrap();
            setSelectedChat(newChat);
            currentConversationRef.current = newChat.id;
            router.replace(`/chat?conversationId=${newChat.id}`, {
              scroll: false
            });
          }
        } catch (e) {
          console.error('Failed to create conversation', e);
        } finally {
          setInitializing(false);
        }
      }
    };

    createNewConversation();
  }, [campusId, createConversation, router, conversations]);

  const handleSelectChat = (chat: any) => {
    if (
      currentConversationRef.current &&
      currentConversationRef.current !== chat.id
    ) {
      leaveConversation(currentConversationRef.current);
    }

    setSelectedChat(chat);
    currentConversationRef.current = chat.id;
    const currentScrollY = window.scrollY;
    router.replace(`/chat?conversationId=${chat.id}`, { scroll: false });

    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);
  };

  const handleSearch = (text: string) => {
    setChatSearch(text);
  };

  // Cleanup when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      if (currentConversationRef.current) {
        console.log(
          '[useChats] Component unmounting, leaving conversation:',
          currentConversationRef.current
        );
        leaveConversation(currentConversationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      calculateInitialUnreadCount(conversations);
    }
  }, [conversations]);

  // Mark conversation as read when messages are fully loaded
  useEffect(() => {
    if (selectedChat?.id && messages && !isLoadingMessages && !isFetching) {
      // Only mark as read if the conversation has unread messages
      const conversation = conversations.find((c) => c.id === selectedChat.id);
      if (conversation?.unread) {
        // The markConversationAsRead mutation already has optimistic updates built-in
        markConversationAsRead(selectedChat.id).catch((error) => {
          console.error('Failed to mark conversation as read:', error);
        });
      }
    }
  }, [
    selectedChat?.id,
    messages,
    isLoadingMessages,
    isFetching,
    conversations,
    markConversationAsRead
  ]);

  const filteredConversations = useMemo(() => {
    if (chatSearch) {
      return conversations.filter((chat) =>
        chat.campusName.toLowerCase().includes(chatSearch.toLowerCase())
      );
    }
    return conversations;
  }, [chatSearch, conversations]);

  return {
    selectedChat,
    conversations: filteredConversations,
    setSelectedChat: handleSelectChat,
    isLoading: isLoadingConversations || initializing,
    isCreatingConversation,
    conversationMessages: { data: messages },
    isLoadingMessages,
    isFetching,
    handleSearch,
    chatSearch
  };
};
