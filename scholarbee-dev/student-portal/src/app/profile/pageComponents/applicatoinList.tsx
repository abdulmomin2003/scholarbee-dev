import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { Application, ApplicationListProps, Scholarship } from '../types';
import ApplicationSkeleton from './applicationSkeltion';
import { ApplicationItem } from '../programsAndApplications/components/applicationItem';

const ApplicationsList = ({
  applications,
  isLoading,
  isScholarship
}: ApplicationListProps) => {
  if (isLoading) {
    return (
      <Stack spacing={2} p={2}>
        <ApplicationSkeleton />
        <ApplicationSkeleton />
        <ApplicationSkeleton />
      </Stack>
    );
  }

  if (!applications?.length) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1">
          {isScholarship ? 'No scholarship found. ' : 'No applications found. '}
          <Link
            href={isScholarship ? '/search-scholarship' : '/programs'}
            prefetch
            style={{
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 500
            }}
          >
            {isScholarship
              ? 'Start by applying to a scholarship.'
              : 'Start by applying to a program.'}
          </Link>
        </Typography>
      </Box>
    );
  }

  return applications.map((application) => {
    if (isScholarship) {
      const scholarship = application as Scholarship;
      return (
        <ApplicationItem
          key={scholarship.id}
          name={scholarship.scholarship_id.scholarship_name}
          submission_date={scholarship.created_at}
          status={scholarship.approval_status}
          scholarshipId={scholarship?.scholarship_id?._id}
        />
      );
    } else {
      const app = application as Application;
      const programName =
        app.program_id?.name ||
        app.program?.name ||
        (typeof app.admission_program_id === 'object'
          ? app.admission_program_id?.program_name ||
            app.admission_program_id?.name
          : '') ||
        'Applied Program';
      const programId = app.program_id?._id || app.program?._id || '';
      const admissionProgramId =
        typeof app.admission_program_id === 'object'
          ? app.admission_program_id?._id
          : app.admission_program_id || '';
      return (
        <ApplicationItem
          application={app}
          key={app.id}
          name={programName}
          submission_date={app.submission_date}
          status={app.status}
          programId={programId}
          admission_program_id={admissionProgramId}
        />
      );
    }
  });
};

export default ApplicationsList;
