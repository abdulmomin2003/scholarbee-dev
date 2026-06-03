'use client';
import React from 'react';
import { Box, Container, Typography } from '@mui/material';

interface CarouselEmptyStateProps {
  message: string;
  py?: number;
}

const CarouselEmptyState: React.FC<CarouselEmptyStateProps> = ({
  message,
  py = 4
}) => {
  return (
    <Container>
      <Box sx={{ py, textAlign: 'center' }}>
        <Typography>{message}</Typography>
      </Box>
    </Container>
  );
};

export default CarouselEmptyState;
