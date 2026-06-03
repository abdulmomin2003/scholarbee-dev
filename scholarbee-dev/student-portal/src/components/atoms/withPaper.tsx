import { Paper, Typography } from '@mui/material';
import React from 'react';

const WithPaper = ({
  children,
  title
}: {
  children?: React.ReactNode;
  title: string;
}) => {
  return (
    <Paper elevation={6} sx={{ p: 4, borderRadius: 5 }}>
      <Typography fontWeight={600} variant="h5">
        {title}
      </Typography>
      {children}
    </Paper>
  );
};

export default WithPaper;
