'use client';
import { Box, Container, Grid, Typography } from '@mui/material';
import Navbar from '@/components/organisms/navbar';
import React from 'react';
import CustomizedBreadcrumbs from '@/components/organisms/breadCrumbs';
import HeroSection from '../../program-details/pageComponents/heroSection';
import ProgramDetailsInfo from '../../program-details/pageComponents/programDetailsInfo';
import Footer from '@/components/organisms/footer';
import { COLORS } from '@/constants/colors';
import {
  formatAdmissionDeadline,
  formatSnakeCase,
  isDomainAllowed
} from '@/utils/helperFunctions';
import feeIcon from '@public/assets/svg/fee-icon.svg';
import primaryCalendarIcon from '@public/assets/svg/calendar-primary.svg';
import calendarIcon from '@public/assets/svg/calendar.svg';
import ApplyForScholarship from '../../scholarships/pageComponents/applyForScholarship';
import DetailPageSkeleton from '@/app/program-details/pageComponents/detailPageSkelton';

interface RequiredDocument {
  document_name: string;
  id: string;
}

const GetDetails = ({ details }: { details: string | RequiredDocument[] }) => {
  if (typeof details === 'string') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap'
        }}
      >
        <Typography mt={2} variant="body1" fontSize={18}>
          {details}
        </Typography>
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <ul>
          {details?.map((doc) => (
            <li key={doc.id}>
              <Typography variant="body1" fontSize={18}>
                {formatSnakeCase(doc.document_name)}
              </Typography>
            </li>
          ))}
        </ul>
      </Box>
    );
  }
};

const ScholarshipSection = ({
  title,
  details
}: {
  title: string;
  details: string | RequiredDocument[];
}) => (
  <Box
    sx={{
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      mb: 3,
      backgroundColor: COLORS.bgColor,
      padding: 2
    }}
  >
    <Typography variant="body1" component="h3" fontWeight="600" fontSize={18}>
      {title}
    </Typography>
    <GetDetails details={details} />
  </Box>
);

interface ScholarshipDetailsClientProps {
  scholarshipDetails: any;
  isLoading: boolean;
  error: any;
}

const ScholarshipDetailsClient: React.FC<ScholarshipDetailsClientProps> = ({
  scholarshipDetails,
  isLoading
}) => {
  const {
    scholarship_name,
    scholarship_description,
    eligibility_criteria,
    application_process,
    application_deadline,
    required_documents,
    amount,
    _id: scholarshipId,
    image_url,
    region,
    is_already_applied
  } = scholarshipDetails ?? {};

  const scholarshipSections = [
    {
      id: 'overview',
      title: scholarship_name,
      details: scholarship_description
    },
    {
      id: 'eligibility',
      title: 'Eligibility Criteria',
      details: eligibility_criteria
    },
    {
      id: 'application',
      title: 'Application Process',
      details: application_process
    },
    {
      id: 'documents',
      title: 'Required Documents',
      details: required_documents
    }
  ];

  const { hasPassed, formattedDate } =
    formatAdmissionDeadline(application_deadline);

  const infoItems = [
    {
      icon: feeIcon,
      title: amount || 'Not Disclosed',
      subtitle: 'Amount'
    },
    {
      icon: !hasPassed ? primaryCalendarIcon : calendarIcon,
      title: formattedDate,
      subtitle: 'Deadline',
      hasDatePassed: hasPassed
    }
  ];

  return (
    <Box bgcolor={COLORS.bgColor}>
      <Navbar />
      {isLoading ? (
        <DetailPageSkeleton />
      ) : (
        <>
          <Box bgcolor="white">
            <Container sx={{ py: 2 }}>
              <CustomizedBreadcrumbs
                items={[
                  { title: 'Scholarship', link: '/search-scholarship' },
                  { title: scholarship_name }
                ]}
              />
            </Container>
            <HeroSection
              uni_logo={
                isDomainAllowed(image_url)
                  ? image_url
                  : '/assets/png/scholarship_placeholder.png'
              }
              title={scholarship_name}
              address={region?.region_name}
            />
          </Box>
          <Container sx={{ mb: { xs: 5, md: 10 } }}>
            <ProgramDetailsInfo {...{ infoItems }} />
            <Grid mt={2} container>
              <Grid size={{ xs: 12 }}>
                <Box sx={styles.mainContainer}>
                  <Box>
                    <ApplyForScholarship
                      buttonDisabled={hasPassed || isLoading}
                      isLoading={isLoading}
                      scholarshipId={scholarshipId}
                      is_already_applied={is_already_applied}
                    />
                    {scholarshipSections.map((section) => (
                      <ScholarshipSection
                        key={section?.id}
                        title={section?.title}
                        details={section?.details}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </>
      )}
      <Footer />
    </Box>
  );
};

export default ScholarshipDetailsClient;

const styles = {
  mainContainer: {
    p: 2,
    backgroundColor: 'white',
    borderRadius: 2
  },
  container: {
    mt: 2,
    p: 3,
    backgroundColor: COLORS.bgColor,
    borderRadius: 2,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  infoBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    px: { xs: 2, sm: 1, md: 2 },
    mt: 2
  },

  summaryContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  }
};
