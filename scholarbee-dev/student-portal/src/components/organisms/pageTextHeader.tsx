import { Box, Typography } from '@mui/material';
import React from 'react';
import Title from '../atoms/title';

const PageTextHeader = ({
  heading,
  subHeading
}: {
  heading: string;
  subHeading: string;
}) => {
  return (
    <Box py={4}>
      <Title title={heading} />
      <Typography variant="body2" fontSize={20}>
        {subHeading}
      </Typography>
    </Box>
  );
};

export default PageTextHeader;
