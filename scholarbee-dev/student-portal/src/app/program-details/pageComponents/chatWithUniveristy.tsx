'use client';
import { Box, Button } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

interface ChatWithUniversityProps {
  campusId: string;
}

const ChatWithUniversity: React.FC<ChatWithUniversityProps> = ({
  campusId
}) => {
  const chatHref = `/chat?campusId=${campusId}`;

  return (
    <Box
      sx={{
        whiteSpace: 'nowrap',
        display: 'block',
        width: { xs: '100%', sm: 'auto' }
      }}
    >
      <Link
        href={chatHref}
        style={{ textDecoration: 'none' }}
        aria-label="Chat with university"
      >
        <Button
          variant="outlined"
          component="span"
          sx={{
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            borderColor: '#3478F6',
            color: '#3478F6',
            backgroundColor: '#fff',
            textTransform: 'none',
            fontSize: { xs: '14px', sm: '16px', md: '18px' },
            fontWeight: 500,
            width: '100%',
            height: { xs: '44px', sm: '56px' },
            borderRadius: '6px',
            '&:hover': {
              borderColor: '#3478F6',
              backgroundColor: 'rgba(52, 120, 246, 0.04)'
            },
            '& > img': {
              flexShrink: 0
            }
          }}
        >
          <Image
            src="/assets/svg/messages-primary.svg"
            alt=""
            width={24}
            height={24}
          />
          Chat with University
        </Button>
      </Link>
    </Box>
  );
};

export default ChatWithUniversity;
