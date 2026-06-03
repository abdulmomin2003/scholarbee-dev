/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, Fragment, useEffect } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { COLORS } from '@/constants/colors';
import { ChatSectionBodySkeleton } from './sekltons';
import TypeMessage from './typeMessage';
import SentMessage from './sentMessage';
import ReceivedMessage from './receivedMessage';
import { useSendMessageMutation } from '@/redux/api/chatApi';
import { useChatSocket } from '../hooks/useChatSocket';
import Image from 'next/image';
import { FONTS } from '@/constants/fonts';

// Helper function to format dates for the divider
const formatDateDivider = (dateString: string): string => {
  const messageDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return 'Today';
  }

  if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  };
  return messageDate.toLocaleDateString(undefined, options);
};

// Helper function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const SupportBanner = () => {
  return (
    <Box
      sx={{
        background:
          'linear-gradient(0deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), linear-gradient(270deg, #FFDE00 0%, #FFB751 100%)',
        borderRadius: '14px',
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mb: 2,
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 40,
          height: 40,
          bgcolor: COLORS.white,
          borderRadius: '10px',
          boxShadow: '0px 1.66667px 5px -1px rgba(0, 0, 0, 0.08)',
          flexShrink: 0
        }}
      >
        <Image src="/assets/svg/sparkle.svg" alt="sparkle" width={18} height={18} />
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: COLORS.uniNameGray,
          fontFamily: FONTS.secondary,
          fontSize: '12px',
          lineHeight: '18px'
        }}
      >
        Our team is available — we usually respond within 1-2 hours; for urgent
        matters or queries please reach out to us on WhatsApp at{' '}
        <Box
          component="span"
          sx={{
            textDecoration: 'underline',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          onClick={() => window.open('https://wa.me/923255559699', '_blank')}
        >
          +92 325 555 9699
        </Box>
      </Typography>
    </Box>
  );
};

const ChatSectionBody = ({
  isLoading,
  conversationMessages,
  selectedChat
}: {
  isLoading?: boolean;
  conversationMessages: any;
  selectedChat: any;
}) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useChatSocket(selectedChat?.id);

  const [sendMessage, { isLoading: isSendingMessage }] =
    useSendMessageMutation();

  const handleSendMessage = async (content: string) => {
    if (content.trim() && selectedChat?.id) {
      try {
        await sendMessage({
          conversation_id: selectedChat.id,
          content
        }).unwrap();
      } catch (error) {
        console.error('[Chat] Failed to send message:', error);
      }
    }
  };

  const handleRetry = async (failedMessage: any) => {
    if (!failedMessage || !selectedChat?.id) return;

    const originalContent = failedMessage.content.replace(' (Not sent)', '');

    try {
      await sendMessage({
        conversation_id: selectedChat.id,
        content: originalContent,
        retryMessageId: failedMessage._id
      }).unwrap();
    } catch (error) {
      console.error('[Chat] Message retry failed:', error);
    }
  };

  // Sort messages by timestamp, then by ID to ensure stable ordering
  const sortedMessages =
    conversationMessages?.length > 0
      ? [...(conversationMessages ?? [])].sort((a, b) => {
          const timeA = new Date(a.created_at).getTime();
          const timeB = new Date(b.created_at).getTime();
          if (timeA !== timeB) {
            return timeA - timeB;
          }
          return a._id.localeCompare(b._id);
        })
      : [];

  // Group messages by date for rendering with dividers
  const groupedMessagesByDate: { date: Date; messages: any[] }[] = [];

  sortedMessages.forEach((message: any) => {
    const messageDate = new Date(message.created_at);
    messageDate.setHours(0, 0, 0, 0); // Reset time to compare dates only

    // Check if we already have a group for this date
    const existingGroup = groupedMessagesByDate.find((group) =>
      isSameDay(group.date, messageDate)
    );
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groupedMessagesByDate.push({
        date: messageDate,
        messages: [message]
      });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current && sortedMessages.length > 0) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [sortedMessages.length]);

  return isLoading ? (
    <ChatSectionBodySkeleton />
  ) : (
    <Box
      sx={{
        height: { xs: '500px', md: '100%' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 2,
        backgroundColor: COLORS.bgColor,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        flex: 1,
        minHeight: 0
      }}
    >
      {selectedChat?.isSupport && <SupportBanner />}

      <Box
        ref={messagesContainerRef}
        sx={{
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          mb: 2,
          position: 'relative',
          // Hide scrollbar but maintain scroll functionality
          // '&::-webkit-scrollbar': {
          //   display: 'none'
          // },
          // For Firefox
          // scrollbarWidth: 'none',
          // For IE and Edge
          msOverflowStyle: 'none'
        }}
      >
        {groupedMessagesByDate.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              minHeight: 0
            }}
          >
            <Typography variant="body2">No messages yet</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ flex: 1 }} />
            {groupedMessagesByDate.map((group) => (
              <Fragment key={group.date.toISOString()}>
                {/* Date Divider */}
                <Divider
                  sx={{
                    '&::before, &::after': { borderColor: COLORS.dividerColor }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      my: 2,
                      position: 'relative'
                    }}
                  >
                    <Box
                      sx={{
                        border: `1px solid ${COLORS.dividerColor}`,
                        borderRadius: 4,
                        px: 2,
                        py: 0.5,
                        zIndex: 1
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: COLORS.textSecondary,
                          fontWeight: 'medium'
                        }}
                      >
                        {formatDateDivider(group.date.toString())}
                      </Typography>
                    </Box>
                  </Box>
                </Divider>

                {/* Messages for this date */}
                {group.messages.map((message: any) => (
                  <Fragment key={message._id}>
                    {message.sender_type === 'user' ? (
                      <SentMessage
                        message={message.content}
                        // time={formatMessageTime(message.created_at)}
                        time={new Date(message.created_at).toLocaleTimeString(
                          [],
                          {
                            hour: '2-digit',
                            minute: '2-digit'
                          }
                        )}
                        pending={message.pending}
                        failed={message._id.startsWith('failed-')}
                        onRetry={() => handleRetry(message)}
                      />
                    ) : (
                      <ReceivedMessage
                        message={message.content}
                        // time={formatMessageTime(message.created_at)}
                        time={new Date(message.created_at).toLocaleTimeString(
                          [],
                          {
                            hour: '2-digit',
                            minute: '2-digit'
                          }
                        )}
                      />
                    )}
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </>
        )}
      </Box>

      {selectedChat && (
        <TypeMessage
          conversationId={selectedChat.id}
          onSendMessage={handleSendMessage}
          isLoading={isSendingMessage}
        />
      )}
    </Box>
  );
};

export default ChatSectionBody;
