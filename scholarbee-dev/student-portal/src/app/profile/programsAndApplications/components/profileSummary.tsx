import { Grid, Box, Typography, Stack } from '@mui/material';
import React from 'react';
import { styles } from '../styles';
import ProfileSummaryCard from './summaryCard';
import { COLORS } from '@/constants/colors';
import Image from 'next/image';

interface ProfileSummaryProps {
  programApplicationsStats?: {
    totalApplications: number;
    breakdown: {
      Draft: number;
      Pending: number;
      Approved: number;
      Rejected: number;
      'Under Review': number;
    };
  };
  scholarshipApplicationsStats?: {
    totalScholarshipApplications: number;
    breakdown: {
      Applied: number;
      Approved: number;
      Rejected: number;
    };
  };
  isLoadingProgramStats: boolean;
  isLoadingScholarshipStats: boolean;
  onApplicationsClick?: () => void;
  // onScholarshipsClick: () => void;
}

const ProfileSummary = ({
  programApplicationsStats,
  scholarshipApplicationsStats,
  isLoadingProgramStats,
  isLoadingScholarshipStats,
  onApplicationsClick
  // onScholarshipsClick
}: ProfileSummaryProps) => {
  // Calculate stats from the analytics data
  // Show 0 when loading to indicate no data yet
  const applicationsSubmitted = isLoadingProgramStats
    ? 0
    : (programApplicationsStats?.breakdown?.Pending ?? 0) +
      (programApplicationsStats?.breakdown?.Approved ?? 0) +
      (programApplicationsStats?.breakdown?.Rejected ?? 0) +
      (programApplicationsStats?.breakdown?.['Under Review'] ?? 0);
  const applicationsApproved = isLoadingProgramStats
    ? 0
    : (programApplicationsStats?.breakdown?.Approved ?? 0);
  const applicationsDraft = isLoadingProgramStats
    ? 0
    : (programApplicationsStats?.breakdown?.Draft ?? 0);
  const scholarshipsApplied = isLoadingScholarshipStats
    ? 0
    : (scholarshipApplicationsStats?.totalScholarshipApplications ?? 0);

  return (
    <Box sx={styles.section}>
      <Box p={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight={600}>
            Profile Summary
          </Typography>
          <Typography
            fontWeight={500}
            sx={{
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={onApplicationsClick}
          >
            View All
          </Typography>
        </Stack>
        <Grid mt={3} container spacing={3}>
          <ProfileSummaryCard
            title="Total Applications Submitted"
            count={applicationsSubmitted}
            // actionText="View All"
            iconBgColor={COLORS.skyBlue}
            icon={
              <Image
                src="/assets/svg/graduation-cap.svg"
                height={24}
                width={24}
                alt="cap_icon"
              />
            }
            // onClick={onApplicationsClick}
          />
          <ProfileSummaryCard
            title="Applications Approved"
            count={applicationsApproved}
            // actionText="View All"
            iconBgColor={COLORS.mustard}
            icon={
              <Image
                src="/assets/svg/university.svg"
                height={24}
                width={24}
                alt="university_icon"
              />
            }
            // onClick={onApplicationsClick}
          />
          <ProfileSummaryCard
            title="Draft Applications"
            count={applicationsDraft}
            // actionText="View All"
            iconBgColor={COLORS.skyBlue}
            icon={
              <Image
                src="/assets/svg/document.svg"
                height={24}
                width={24}
                alt="draft_icon"
              />
            }
            // onClick={onApplicationsClick}
          />
          <ProfileSummaryCard
            title="Scholarships Applied"
            count={scholarshipsApplied}
            // actionText="View All"
            iconBgColor={COLORS.purple}
            icon={
              <Image
                src="/assets/svg/document.svg"
                height={24}
                width={24}
                alt="application_icon"
              />
            }
            // onClick={onScholarshipsClick}
          />
        </Grid>
      </Box>
    </Box>
  );
};

export default ProfileSummary;
