'use client';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react';

const ApplyForScholarship = ({
  scholarshipId,
  isLoading,
  buttonDisabled,
  is_already_applied
}: {
  scholarshipId: string;
  isLoading: boolean;
  buttonDisabled: boolean;
  is_already_applied: boolean;
}) => {
  const applyHref = `/scholarships/apply-scholarship?scholarshipId=${scholarshipId}`;
  const isDisabled = buttonDisabled || is_already_applied;

  const getButtonContent = () => {
    if (isLoading) return <LinearProgress sx={{ width: '180px' }} />;
    if (is_already_applied) return 'Already Applied';
    return 'Apply For Scholarship';
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      mb={2}
      alignItems="center"
    >
      <Typography component="h2" variant="h5" fontWeight="600">
        Scholarship Overview
      </Typography>
      <Link
        href={applyHref}
        style={{
          textDecoration: 'none',
          pointerEvents: isDisabled ? 'none' : 'auto'
        }}
        aria-disabled={isDisabled}
      >
        <Button
          sx={{
            cursor: isDisabled ? 'not-allowed' : 'pointer'
          }}
          variant="contained"
          disabled={isDisabled}
          size="small"
        >
          {getButtonContent()}
        </Button>
      </Link>
    </Box>
  );
};

export default ApplyForScholarship;
