import Title from '@/components/atoms/title';
import { Box, Typography } from '@mui/material';
import React from 'react';

const HeaderText = () => {
  return (
    <Box mt={5} pb={3}>
      <Title title="Unlock Your Future with the Right Education" />
      <Typography variant="body2" fontSize={20}>
        {
          'Explore tailored programs and scholarship options—all in one place. ScholarBee is your trusted partner in finding the education that fits your goals.'
        }
      </Typography>
    </Box>
  );
};

export default HeaderText;
