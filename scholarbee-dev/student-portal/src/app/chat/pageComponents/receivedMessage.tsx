import { COLORS } from '@/constants/colors';
import { Box, Typography } from '@mui/material';

interface ReceivedMessageProps {
  message: string;
  time: string;
}

// Function to detect URLs and render them as links
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
            color: '#1976d2',
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

const ReceivedMessage = ({ message, time }: ReceivedMessageProps) => {
  return (
    <Box ml={2}>
      {/* <Typography variant="body2">Campus</Typography> */}
      <Box display="flex" alignItems="flex-end" sx={{ maxWidth: '80%' }}>
        <Typography
          sx={{
            mt: 1.5,
            py: 2.5,
            px: 2,
            backgroundColor: COLORS.white,
            borderRadius: '0 24px 24px 24px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          {renderMessageWithLinks(message)}
        </Typography>
      </Box>

      <Typography
        variant="caption"
        fontSize={11}
        mt={0.5}
        color="text.secondary"
      >
        {time || ''}
      </Typography>
    </Box>
  );
};

export default ReceivedMessage;
