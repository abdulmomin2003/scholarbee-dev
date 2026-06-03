'use client';
import { BLOGS_CATEGORIES } from '@/constants';
import { Box, Button } from '@mui/material';
import React, { useState } from 'react';

const Categories = () => {
  const [selectedButton, setSelectedButton] = useState('Scholarships');
  return (
    <Box
      mt={2}
      sx={{
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none'
        }
      }}
    >
      {BLOGS_CATEGORIES.map((cat) => (
        <Button
          sx={{
            py: 2,
            px: 3,
            borderRadius: '50px',
            mr: 2,
            display: 'inline-block'
          }}
          onClick={() => setSelectedButton(cat)}
          variant={selectedButton === cat ? 'contained' : 'outlined'}
          key={cat}
        >
          {cat}
        </Button>
      ))}
    </Box>
  );
};

export default Categories;
