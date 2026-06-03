import { COLORS } from '@/constants/colors';
import { Button, Stack } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const NoChatPlaceholder = () => {
  return (
    <Stack
      spacing={10}
      sx={{
        height: '600px',
        width: '100%',
        borderRadius: 2,
        backgroundColor: COLORS.white,
        my: 2,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Image
        alt="chat_illustration"
        src="/assets/svg/message-illustration.svg"
        width={260}
        height={180}
      />
      <Link href="/chat/add-campus" style={{ textDecoration: 'none' }}>
        <Button variant="contained" component="span">
          New Chat
        </Button>
      </Link>
    </Stack>
  );
};

export default NoChatPlaceholder;
