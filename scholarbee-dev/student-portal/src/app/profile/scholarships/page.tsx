'use client';
import React from 'react';
import { Box, Typography, Divider, Paper, Stack } from '@mui/material';
import { styles } from '../styles';
import ErrorMessage from '../pageComponents/errorMessage';
import ApplicationsList from '../pageComponents/applicatoinList';
import { useApplicationStatus } from '../hooks/useProfile';
import { ApplicationsListSkeleton } from '../pageComponents';

const ScholarshipsPage = () => {
  const { scholarshipsData, isScholarshipLoading, scholarshipError } =
    useApplicationStatus();

  if (scholarshipError) {
    return (
      <ErrorMessage
        message={
          scholarshipError instanceof Error
            ? scholarshipError.message
            : 'Failed to load scholarships'
        }
      />
    );
  }

  if (isScholarshipLoading) {
    return <ApplicationsListSkeleton />;
  }

  return (
    <Paper sx={styles.section}>
      <Box sx={styles.sectionHeader}>
        <Typography variant="h6" sx={styles.sectionTitle}>
          Scholarships
        </Typography>
      </Box>
      <Divider />
      <Stack spacing={2} p={2}>
        <ApplicationsList
          isScholarship={true}
          applications={scholarshipsData?.data ?? []}
          isLoading={isScholarshipLoading}
        />
      </Stack>
    </Paper>
  );
};

export default ScholarshipsPage;
