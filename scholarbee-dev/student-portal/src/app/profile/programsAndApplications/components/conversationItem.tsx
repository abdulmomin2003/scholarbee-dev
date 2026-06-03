'use client';
import { COLORS } from '@/constants/colors';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { isDomainAllowed } from '@/utils/helperFunctions';

const ConversationItem = ({
  universityName = '',
  messagePreview = '',
  logoSrc = '/assets/svg/bahria.svg',
  conversationId = ''
}: {
  universityName: string;
  messagePreview: string;
  logoSrc: string;
  conversationId: string;
}) => {
  return (
    <Link
      href={conversationId ? `/chat?conversationId=${conversationId}` : '#'}
      style={{ textDecoration: 'none' }}
      aria-label={`Open conversation with ${universityName}`}
    >
      <Box
        display="flex"
        gap={1}
        alignItems="center"
        sx={{
          borderRadius: '200px',
          p: 2.5,
          border: `1px solid ${COLORS.applicationItemBorder}`,
          transition: 'background-color 0.2s ease',
          cursor: 'pointer'
        }}
      >
        <Box flexShrink={0} mr={1}>
          <Image
            style={{
              borderRadius: '50%'
            }}
            src={
              logoSrc && isDomainAllowed(logoSrc)
                ? logoSrc
                : '/assets/png/university_placeholder.png'
            }
            alt={`${universityName} logo`}
            width={64}
            height={64}
          />
        </Box>

        <Box flexGrow={1} overflow="hidden">
          <Typography variant="h6" fontWeight="600" noWrap>
            {universityName}
          </Typography>
          <Typography
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {messagePreview}
          </Typography>
        </Box>

        <Box flexShrink={0}>
          <Image
            src="/assets/svg/message-icon.svg"
            alt="message"
            width={32}
            height={32}
          />
        </Box>
      </Box>
    </Link>
  );
};

export default ConversationItem;
