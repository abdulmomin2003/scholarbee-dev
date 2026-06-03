'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Stack,
  Chip,
  Zoom,
  InputAdornment,
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import SendIcon from '@mui/icons-material/Send';
import Image from 'next/image';
import { useAppSelector } from '@/redux/hooks';
import { chatbotIcon } from '@/constants';
import { useChatbot } from '@/hooks/useChatbot';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const quickPrompts = [
  'How to Apply?',
  'Admission Deadlines',
  'Browse Majors',
  'Application Status',
  "Master's Programs",
];

function TypingIndicator() {
  const dotStyle = {
    width: 6,
    height: 6,
    borderRadius: '999px',
    backgroundColor: '#0F172A',
    animation: 'beeDotBounce 1.1s infinite ease-in-out',
  } as const;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 0.4, py: 0.2 }}>
      <Box sx={{ ...dotStyle, animationDelay: '0s' }} />
      <Box sx={{ ...dotStyle, animationDelay: '0.18s' }} />
      <Box sx={{ ...dotStyle, animationDelay: '0.36s' }} />
      <Box
        sx={{
          '@keyframes beeDotBounce': {
            '0%, 80%, 100%': { transform: 'translateY(0)', opacity: 0.35 },
            '40%': { transform: 'translateY(-4px)', opacity: 1 },
          },
        }}
      />
    </Box>
  );
}

export default function ChatbotWidget() {
  const createSessionId = () =>
    `bee-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const getInitialSessionId = () => {
    if (typeof window === 'undefined') {
      return createSessionId();
    }
    const stored = sessionStorage.getItem('scholarbee-bee-chat-session');
    if (stored) {
      return stored;
    }
    const next = createSessionId();
    sessionStorage.setItem('scholarbee-bee-chat-session', next);
    return next;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>(getInitialSessionId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const authUser = useAppSelector((state) => state.auth.user);
  const { sendQuery, clearSession, isLoading } = useChatbot(sessionId);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const userAvatarUrl = (() => {
    const profileImageUrl = (authUser as { profile_image_url?: string } | null)
      ?.profile_image_url;
    return typeof profileImageUrl === 'string' ? profileImageUrl.trim() : '';
  })();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const resetConversation = async () => {
    try {
      await clearSession();
    } catch {
      // ignore
    }
    const next = createSessionId();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('scholarbee-bee-chat-session', next);
    }
    setSessionId(next);
    setMessages([]);
    setInputValue('');
    setIsOpen(false);
  };

  const sendMessage = async (textOverride?: string) => {
    const query = (textOverride ?? inputValue).trim();
    if (!query) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: query,
      timestamp: new Date(),
    };

    setInputValue('');
    setMessages((prev) => [...prev, userMessage]);

    try {
      const data = await sendQuery(query);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: data.answer || 'Sorry, try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const detail =
        err instanceof Error && err.message.trim()
          ? err.message
          : 'Sorry, I encountered an error. Please try again.';
      const errMsg: Message = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        text: detail,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    void sendMessage(prompt);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        right: { xs: '16px', md: '20px' },
        bottom: { xs: '88px', md: '92px' },
        zIndex: 1400,
        width: { xs: 'calc(100vw - 32px)', sm: '320px', md: '360px' },
        height: { xs: 56, sm: 56, md: 56 },
      }}
    >
      <Zoom in={isOpen}>
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: { xs: 'calc(100vw - 32px)', sm: '320px', md: '360px' },
            maxWidth: '360px',
            height: { xs: 'min(56vh, 380px)', sm: '360px', md: '380px' },
            maxHeight: 'calc(100vh - 180px)',
            borderRadius: '26px',
            overflow: 'hidden',
            transformOrigin: 'bottom right',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 22px 55px rgba(15, 23, 42, 0.18)',
            bgcolor: '#FFFFFF',
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1,
              background: '#DDEBFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 56,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Image src={chatbotIcon} alt="BeeBot" width={24} height={24} />
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>BeeBot</Typography>
            </Box>
            <IconButton size="small" onClick={() => void resetConversation()} sx={{ width: 32, height: 32 }}>
              <RemoveIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {messages.length === 0 && (
            <Box
              sx={{
                px: 2,
                py: 2.6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: 210,
              }}
            >
              <Typography sx={{ mb: 2, fontSize: { xs: 18, sm: 19 }, fontWeight: 500 }}>
                Hi! What Can I Help you with?
              </Typography>
              <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={0.8} sx={{ maxWidth: 278 }}>
                {quickPrompts.map((p) => (
                  <Chip
                    key={p}
                    label={p}
                    onClick={() => handleQuickPrompt(p)}
                    disabled={isLoading}
                    sx={{
                      bgcolor: '#FFF',
                      border: '1px solid #D6DCE6',
                      color: '#667085',
                      fontSize: 10.5,
                      height: 29,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              px: 1.5,
              py: messages.length === 0 ? 0 : 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                  gap: 1,
                  width: '100%',
                }}
              >
                {message.type === 'bot' && (
                  <Image
                    src={chatbotIcon}
                    alt="BeeBot"
                    width={24}
                    height={24}
                    style={{ flexShrink: 0, alignSelf: 'flex-start', marginTop: 2 }}
                  />
                )}

                <Paper
                  elevation={0}
                  sx={{
                    maxWidth: message.type === 'user' ? '72%' : '82%',
                    px: 1.4,
                    py: 1.1,
                    borderRadius:
                      message.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    bgcolor: message.type === 'user' ? '#8EC7FF' : '#F3F5F8',
                    color: '#000000',
                    boxShadow: 'none',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 12.5,
                      lineHeight: 1.48,
                      whiteSpace: 'pre-wrap',
                      color: '#000000',
                    }}
                  >
                    {message.text}
                  </Typography>
                </Paper>

                {message.type === 'user' && userAvatarUrl && (
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      flexShrink: 0,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      boxShadow: '0 4px 10px rgba(15,23,42,0.06)',
                      mt: 0.25,
                    }}
                  >
                    <Image src={userAvatarUrl} alt="User" width={30} height={30} />
                  </Box>
                )}
              </Box>
            ))}

            {isLoading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: 1,
                  width: '100%',
                }}
              >
                <Image
                  src={chatbotIcon}
                  alt="BeeBot"
                  width={24}
                  height={24}
                  style={{ flexShrink: 0, alignSelf: 'flex-start', marginTop: 2 }}
                />
                <Paper
                  elevation={0}
                  sx={{
                    px: 1.4,
                    py: 1,
                    borderRadius: '18px 18px 18px 4px',
                    bgcolor: '#F3F5F8',
                    boxShadow: 'none',
                    minWidth: 52,
                  }}
                >
                  <TypingIndicator />
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              minRows={1}
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKey}
              disabled={isLoading}
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => void sendMessage()}
                      disabled={!inputValue.trim() || isLoading}
                      sx={{
                        width: 38,
                        height: 38,
                        bgcolor: '#0F62FE',
                        color: '#FFFFFF',
                        opacity: inputValue.trim() ? 1 : 0.35,
                        '&:hover': { bgcolor: '#0B4FD9' },
                        '&.Mui-disabled': { bgcolor: '#0F62FE', color: '#FFFFFF', opacity: 0.35 },
                      }}
                    >
                      <SendIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '999px',
                  fontSize: '12.5px',
                  '& textarea': { paddingTop: '10px', paddingBottom: '10px' },
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: '999px', color: '#000000' },
                '& .MuiOutlinedInput-input': { color: '#000000' },
              }}
            />
          </Box>
        </Paper>
      </Zoom>

      <Box
        sx={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2.5,
          py: 1.3,
          borderRadius: '999px',
          bgcolor: '#FFFFFF',
          border: '1px solid #EEF2F7',
          boxShadow: '0 14px 36px rgba(15,23,42,0.12)',
          cursor: 'pointer',
          maxWidth: 'calc(100vw - 24px)',
          minHeight: 56,
        }}
        onClick={() => setIsOpen(true)}
      >
        <Typography sx={{ fontSize: 14, color: '#111827' }}>BeeBot</Typography>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: '#FFF',
          }}
        >
          <Image src={chatbotIcon} alt="BeeBot" width={30} height={30} />
        </Box>
      </Box>
    </Box>
  );
}
