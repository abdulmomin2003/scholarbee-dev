import { COLORS } from '@/constants/colors';
import { Box, Typography, Tooltip, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface SentMessageProps {
  message: string;
  time: string;
  pending?: boolean;
  failed?: boolean;
  onRetry?: () => void;
}

const renderMessageWithLinks = (message: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = message.split(urlRegex);
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#ffffff',
            textDecoration: 'underline',
            wordBreak: 'break-all'
          }}
        >
          {part}
        </a>
      );
    }
    // Handle line breaks by splitting on \n and adding <br> elements
    return part.split('\n').map((line, lineIndex, array) => (
      <span key={`${index}-${lineIndex}`}>
        {line}
        {lineIndex < array.length - 1 && <br />}
      </span>
    ));
  });
};

const SentMessage = ({
  message,
  time,
  pending,
  failed,
  onRetry
}: SentMessageProps) => {
  // Check if message includes the error message suffix
  const isFailedMessage = failed || message.includes('(Not sent)');
  const displayMessage = isFailedMessage
    ? message.replace(' (Not sent)', '')
    : message;

  // Message is delivered if it's not pending and not failed
  const isDelivered = !pending && !isFailedMessage;

  const handleRetry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRetry?.();
  };

  return (
    <Box
      display={'flex'}
      mr={2}
      flexDirection={'column'}
      alignItems={'flex-end'}
    >
      {/* <Typography variant="body2">You</Typography> */}
      <Box display="flex" sx={{ maxWidth: '80%' }}>
        <Typography
          sx={{
            mt: 1.5,
            py: 2.5,
            px: 2,
            backgroundColor: isFailedMessage ? '#ffebee' : COLORS.primary,
            color: isFailedMessage ? '#d32f2f' : COLORS.white,
            borderRadius: ' 24px 0 24px 24px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          {renderMessageWithLinks(displayMessage)}
        </Typography>
      </Box>

      {/* Status indicators in place of time */}
      <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
        {pending && (
          <Tooltip title="Sending">
            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Tooltip>
        )}

        {isDelivered && (
          <Typography variant="caption" fontSize={11} color="text.secondary">
            {time}
          </Typography>
        )}

        {isFailedMessage && (
          <Button
            onClick={handleRetry}
            sx={{
              minWidth: 'auto',
              p: 0,
              '&:hover': {
                background: 'none'
              }
            }}
          >
            <Typography
              variant="caption"
              color="#d32f2f"
              fontSize={11}
              fontStyle="italic"
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              <ErrorIcon sx={{ fontSize: 14, mr: 0.5, color: '#d32f2f' }} />
              Failed, Retry
            </Typography>
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default SentMessage;
