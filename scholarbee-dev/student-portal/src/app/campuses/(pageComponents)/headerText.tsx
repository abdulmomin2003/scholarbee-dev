import Title from '@/components/atoms/title';
import { Box, Typography } from '@mui/material';
import React from 'react';

const HeaderText = () => {
  return (
    <Box mt={5} pb={3}>
      <Title title="Explore Top Universities  in Pakistan" />
      <Typography variant="body2" fontSize={20}>
        Discover leading campuses, compare programs, and connect directly to
        start your academic journey today.
      </Typography>
    </Box>
  );
};

export default HeaderText;
