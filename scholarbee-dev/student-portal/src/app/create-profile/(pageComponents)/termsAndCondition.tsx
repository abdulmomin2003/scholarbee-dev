import React from 'react';
import { Grid, Typography } from '@mui/material';

const TermsAndConditions: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          User Agreement
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="body1">
          Please read these terms and conditions carefully before using our
          service.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default TermsAndConditions;
