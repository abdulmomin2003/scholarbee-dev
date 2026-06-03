/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid, Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react';
import { styles } from '../styles';
import { ApplicationItem } from './applicationItem';
import ApplicationItemSkeleton from './applicationItemSkelton';

const ApplicationStatus = ({
  applications,
  scholarships,
  isLoadingApplications,
  isLoadingScholarships
  //     handleViewAllApplications,
  //     handleViewAllScholarships
}: {
  applications: any;
  scholarships: any;
  isLoadingApplications: boolean;
  isLoadingScholarships: boolean;
  // handleViewAllApplications: () => void;
  // handleViewAllScholarships: () => void;
}) => {
  return (
    <Box sx={styles.section}>
      <Box p={2}>
        <Stack direction={'row'} justifyContent={'space-between'}></Stack>
        <Typography variant="h5" component="h2" fontWeight={600}>
          My Applications Overview
        </Typography>
        <Grid
          mt={3}
          container
          spacing={3}
          sx={{ width: '100%', overflow: 'hidden' }}
        >
          {/* <Grid sx={styles.applicationGrid} size={{ xs: 12, sm: 6 }}> */}
          <Grid sx={styles.applicationGrid} size={{ xs: 12 }}>
            <Stack direction={'row'} justifyContent={'space-between'}>
              <Typography component="h3" variant="h6">
                Admissions
              </Typography>
              {applications.length > 0 && (
                <Link
                  href="/profile/applications"
                  style={{
                    fontWeight: 500,
                    textDecoration: 'underline',
                    color: 'inherit'
                  }}
                >
                  View All
                </Link>
              )}
            </Stack>
            <Stack mt={2} spacing={2}>
              {isLoadingApplications ? (
                <ApplicationItemSkeleton />
              ) : (
                <>
                  {applications?.length === 0 ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No Application found.{' '}
                        <Link
                          prefetch
                          href="/programs"
                          style={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontWeight: 500
                          }}
                        >
                          Start by applying to a program.
                        </Link>
                      </Typography>
                    </Box>
                  ) : (
                    applications
                      .slice(0, 2)
                      .map((application: any) => (
                        <ApplicationItem
                          application={application}
                          key={application?._id}
                          name={application?.program?.name ?? ''}
                          submission_date={application?.submission_date ?? ''}
                          status={application?.status ?? ''}
                        />
                      ))
                  )}
                </>
              )}
            </Stack>
          </Grid>
          {/* <Grid sx={styles.applicationGrid} size={{ xs: 12, sm: 6 }}> */}
          <Grid sx={styles.applicationGrid} size={{ xs: 12 }}>
            <Stack direction={'row'} justifyContent={'space-between'}>
              <Typography component="h3" variant="h6">
                Scholarships
              </Typography>
              {scholarships.length > 0 && (
                <Link
                  href="/profile/scholarships"
                  style={{
                    fontWeight: 500,
                    textDecoration: 'underline',
                    color: 'inherit'
                  }}
                >
                  View All
                </Link>
              )}
            </Stack>
            <Stack mt={2} spacing={2}>
              {isLoadingScholarships ? (
                <ApplicationItemSkeleton />
              ) : (
                <>
                  {scholarships.length === 0 ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No Scholarship found.{' '}
                        <Link
                          prefetch
                          href="/search-scholarship"
                          style={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontWeight: 500
                          }}
                        >
                          Start by applying to a scholarship.
                        </Link>
                      </Typography>
                    </Box>
                  ) : (
                    scholarships.slice(0, 2).map((scholarship: any) => {
                      return (
                        <ApplicationItem
                          key={scholarship?._id ?? ''}
                          scholarshipId={scholarship?.scholarship_id?._id}
                          name={
                            scholarship?.scholarship_id?.scholarship_name ?? ''
                          }
                          submission_date={scholarship?.application_date ?? ''}
                          status={scholarship?.approval_status ?? ''}
                        />
                      );
                    })
                  )}
                </>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ApplicationStatus;
