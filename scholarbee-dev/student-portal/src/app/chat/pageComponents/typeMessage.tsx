import { COLORS } from '@/constants/colors';
import { IconButton, Stack, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState, useRef, useMemo } from 'react';

interface TypeMessageProps {
  conversationId: string;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const TypeMessage = ({
  conversationId,
  onSendMessage,
  isLoading = false
}: TypeMessageProps) => {
  const [message, setMessage] = useState('');
  const shouldFocusRef = useRef(false);
  const lastSentMessageRef = useRef<string>('');

  const inputCallbackRef = useMemo(() => {
    return (inputElement: HTMLInputElement | null) => {
      if (inputElement && shouldFocusRef.current && !isLoading) {
        inputElement.focus();
        shouldFocusRef.current = false;
      }
    };
  }, [isLoading]);

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId || isLoading) return;

    if (message === lastSentMessageRef.current) return;

    try {
      console.log(
        '[TypeMessage] Sending message:',
        message.substring(0, 20) + (message.length > 20 ? '...' : '')
      );

      lastSentMessageRef.current = message;

      shouldFocusRef.current = true;
      onSendMessage(message);

      setMessage('');
    } catch (error) {
      console.error('[TypeMessage] Failed to send message:', error);
      shouldFocusRef.current = false;
      lastSentMessageRef.current = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setMessage(e.target.value);
    if (e.target.value !== lastSentMessageRef.current) {
      lastSentMessageRef.current = '';
    }
  };

  return (
    <Stack direction="row" alignItems="center">
      <TextField
        inputRef={inputCallbackRef}
        multiline
        minRows={1}
        maxRows={4}
        sx={{
          borderRadius: '8px',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderWidth: '0'
            },
            '&:hover fieldset': {
              borderWidth: '0'
            },
            '&.Mui-focused fieldset': {
              borderWidth: '0'
            },
            '& textarea': {
              fontSize: '20px',
              resize: 'none'
            }
          },
          backgroundColor: 'rgba(0, 0, 0, 0.06)',
          minHeight: '72px',
          display: 'flex',
          justifyContent: 'center'
        }}
        fullWidth
        placeholder="Type your message here..."
        variant="outlined"
        value={message}
        onChange={handleMessageChange}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <IconButton
        disabled={!message.trim() || isLoading}
        sx={{
          backgroundColor: COLORS.primary,
          color: COLORS.white,
          borderRadius: '8px',
          p: 1,
          ml: 1,
          height: '72px',
          width: '72px',
          '&:hover': {
            backgroundColor: COLORS.primary,
            opacity: 0.8
          },
          '&.Mui-disabled': {
            backgroundColor: COLORS.borderColor,
            color: COLORS.white
          }
        }}
        onClick={handleSendMessage}
        aria-label="Send message"
      >
        <SendIcon fontSize="large" />
      </IconButton>
    </Stack>
  );
};

export default TypeMessage;
