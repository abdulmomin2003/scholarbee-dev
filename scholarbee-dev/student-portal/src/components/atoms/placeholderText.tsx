import { Typography } from '@mui/material';
import React from 'react';

const PlaceholderText = ({ text }: { text: string }) => {
  return (
    <Typography my={5} color="text.secondary" fontSize={24} textAlign="center">
      {text}
    </Typography>
  );
};

export default PlaceholderText;
