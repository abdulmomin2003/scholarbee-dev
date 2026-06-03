import { COLORS } from '@/constants/colors';
import { Box } from '@mui/material';
import Image from 'next/image';

const ChatSectionPlaceholder = () => {
  return (
    <Box
      sx={{
        minHeight: '600px',
        p: 2,

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderLeft: { xs: 'none', md: `2px solid ${COLORS.borderDark}` }
      }}
    >
      <Image
        src="/assets/svg/message-illustration.svg"
        alt="message_illustration"
        width={250}
        height={166}
      />
    </Box>
  );
};
export default ChatSectionPlaceholder;
