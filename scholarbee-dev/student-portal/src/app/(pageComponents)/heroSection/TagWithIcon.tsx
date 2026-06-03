// 'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
// import { keyframes } from '@mui/material/styles';

// const pulse = keyframes`
//   0%, 100% {
//     transform: scale(0.9);
//   }
//   50% {
//     transform: scale(1.1);
//   }
// `;

interface TagWithIconProps {
  styles: any;
}

const TagWithIcon: React.FC<TagWithIconProps> = ({ styles }) => {
  return (
    <Box sx={styles.tag}>
      <Box
        sx={{
          ...styles.tagIcon
          // animation: `${pulse} 4s ease-in-out infinite`
        }}
      />
      <Typography variant="subtitle2" fontWeight={500} sx={styles.tagText}>
        Level Up Your Journey
      </Typography>
    </Box>
  );
};

export default TagWithIcon;
