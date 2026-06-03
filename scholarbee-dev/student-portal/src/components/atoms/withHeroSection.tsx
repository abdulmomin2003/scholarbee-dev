import { COLORS } from '@/constants/colors';
import { Box, Container } from '@mui/material';
import React from 'react';

const WithHeroSection = ({
  children,
  backgroundImage
}: {
  children?: React.ReactNode;
  backgroundImage?: string;
}) => {
  const processedBackgroundImage = backgroundImage?.trim() || '';

  const backgroundImageStyle = processedBackgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${encodeURI(processedBackgroundImage)}")`
      }
    : {
        backgroundColor: COLORS.filtersColor,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      };

  return (
    <Box
      sx={{
        minHeight: '300px',
        height: 'auto',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        ...backgroundImageStyle
      }}
    >
      <Container>{children}</Container>
    </Box>
  );
};

export default WithHeroSection;
