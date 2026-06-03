/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import Sidebar from '@/app/profile/pageComponents/sidebar';
import { Box, Stack, Typography, Divider, Container } from '@mui/material';
import React, { Suspense, useState } from 'react';
import {
  ApplicationDetailsItemSkeleton,
  ContentSkeleton,
  NavbarSkeleton
} from '../../profile/pageComponents';
import Navbar from '@/components/organisms/navbar';
import { styles } from '../../profile/styles';
import Footer from '@/components/organisms/footer';
import { COLORS } from '@/constants/colors';
import Image from 'next/image';
import { useGetApplicationDetailsQuery } from '@/redux/api/applicationApi';
import { formattedDate } from '@/utils/helperFunctions';

const getApplicationStatusValueColor = (status?: string) => {
  const normalized = status?.trim().toLowerCase() || '';

  if (normalized === 'approved') return COLORS.greenPrimary;
  if (normalized === 'rejected') return COLORS.statusClosed;
  if (normalized === 'draft') return COLORS.filtersColor;
  if (normalized === 'pending' || normalized.includes('review'))
    return COLORS.mustard;

  return COLORS.textPrimary;
};

const getSidebarItems = (
  activeTab: string,
  handleTabChange: (tab: string) => void
) => [
  {
    icon: `/assets/svg/teacher${activeTab === 'academicInformation' ? '-white' : ''}.svg`,
    text: 'Academic Information',
    name: 'profileSummary',
    active: activeTab === 'academicInformation',
    onClick: () => handleTabChange('academicInformation')
  },
  {
    icon: `/assets/svg/application-status${activeTab === 'applicationInformation' ? '' : '-black'}.svg`,
    text: 'Application Information',
    name: 'applications',
    active: activeTab === 'applicationInformation',
    onClick: () => handleTabChange('applicationInformation')
  },
  //add a tab for the documents
  {
    icon: `/assets/svg/document-text${activeTab === 'documents' ? '-white' : ''}.svg`,
    text: 'Documents',
    name: 'documents',
    active: activeTab === 'documents',
    onClick: () => handleTabChange('documents')
  }
];

const getAcademicInformation = (educationalBg: any[]) => {
  if (!educationalBg || !Array.isArray(educationalBg)) {
    return [];
  }

  return educationalBg
    .map((bg, index) => [
      {
        icon: '/assets/svg/buildings.svg',
        title: bg?.school_college_university || 'Not specified',
        description: 'School/College/University'
      },
      {
        icon: '/assets/svg/cap-primary.svg',
        title: bg?.education_level || 'Not specified',
        description: 'Education Level'
      },
      {
        icon: '/assets/svg/book.svg',
        title: bg?.field_of_study || 'Not specified',
        description: 'Field of Study'
      },
      {
        icon: '/assets/svg/favorite-chart.svg',
        title: bg?.marks_gpa
          ? `${bg.marks_gpa.obtained_marks_gpa}/${bg.marks_gpa.total_marks_gpa}`
          : 'Not specified',
        description: 'GPA/Grades'
      },
      {
        icon: '/assets/svg/document-download.svg',
        title: 'View Transcript',
        description: 'Transcript',
        isLink: !!bg?.transcript,
        onClick: bg?.transcript
          ? () => {
              window.open(bg.transcript, '_blank');
            }
          : undefined
      },
      // Add divider if not the last education background
      ...(index < educationalBg.length - 1 ? [{ isDivider: true }] : [])
    ])
    .flat();
};

const ApplicationDetails = ({ params }: { params: { id: string } }) => {
  const { data: applicationDetails, isLoading: isLoadingApplicationDetails } =
    useGetApplicationDetailsQuery(params.id);
  const [activeTab, setActiveTab] = useState('academicInformation');
  const handleTabChange = (tab: string) => setActiveTab(tab);
  const sidebarItems = getSidebarItems(activeTab, handleTabChange);

  const studentInfo = applicationDetails?.applicant_snapshot;
  const educationalBg = studentInfo?.educational_backgrounds;
  const campusInfo = applicationDetails?.campus_id;
  const idCard = studentInfo?.national_id_card;

  const academicInformation = getAcademicInformation(educationalBg);
  const applicationInformation = [
    {
      icon: '/assets/svg/buildings.svg',
      title: campusInfo?.name || '',
      description: 'University/Institute'
    },
    {
      icon: '/assets/svg/book.svg',
      title: applicationDetails?.program?.name || '',
      description: 'Program'
    },
    {
      icon: '/assets/svg/notification-status.svg',
      title: applicationDetails?.status || '',
      description: 'Application Status',
      titleColor: getApplicationStatusValueColor(applicationDetails?.status)
    },
    {
      icon: '/assets/svg/calendar-primary.svg',
      title: formattedDate(applicationDetails?.submission_date) || '',
      description: 'Admission Date'
    }
  ];
  const documentsInformation = [
    {
      icon: '/assets/svg/document-download.svg',
      title: 'View National ID Card Front',
      description: 'National ID Card',
      isLink: !!idCard?.front_side,
      onClick: idCard?.front_side
        ? () => {
            window.open(idCard?.front_side, '_blank');
          }
        : undefined
    },
    {
      icon: '/assets/svg/document-download.svg',
      title: 'View National ID Card Back',
      description: 'National ID Card',
      isLink: !!idCard?.back_side,
      onClick: idCard?.back_side
        ? () => {
            window.open(idCard?.back_side, '_blank');
          }
        : undefined
    }
  ];

  return (
    <Box sx={styles.pageWrapper}>
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      <Box sx={styles.contentContainer}>
        <Box sx={styles.root}>
          <Container>
            <Box
              sx={{
                backgroundColor: COLORS.bgColor,
                borderRadius: 3,
                p: 2
              }}
            >
              <Box sx={styles.contentWrapper}>
                <Box
                  sx={{
                    backgroundColor: COLORS.white,
                    borderRadius: 2,
                    border: `1px solid ${COLORS.borderColor}`,
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                    height: 'fit-content'
                  }}
                >
                  <Sidebar items={sidebarItems} />
                </Box>
                <Box sx={styles.mainContent}>
                  <Suspense fallback={<ContentSkeleton />}>
                    <Box
                      sx={{
                        backgroundColor: COLORS.white,
                        borderRadius: 2,
                        border: `1px solid ${COLORS.borderColor}`,
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                        p: 2
                      }}
                    >
                      {activeTab === 'academicInformation' && (
                        <>
                          {isLoadingApplicationDetails ? (
                            <>
                              <ApplicationDetailsItemSkeleton />
                              <ApplicationDetailsItemSkeleton />
                              <ApplicationDetailsItemSkeleton />
                            </>
                          ) : (
                            <>
                              <Typography
                                variant="h5"
                                fontWeight={600}
                                color="primary"
                              >
                                Academic Information
                              </Typography>
                              <Stack mt={4} spacing={3}>
                                {academicInformation.map((item, index) => (
                                  <DetailsItem key={index} item={item} />
                                ))}
                              </Stack>
                            </>
                          )}
                        </>
                      )}
                      {activeTab === 'applicationInformation' && (
                        <>
                          {isLoadingApplicationDetails ? (
                            <>
                              <ApplicationDetailsItemSkeleton />
                              <ApplicationDetailsItemSkeleton />
                              <ApplicationDetailsItemSkeleton />
                            </>
                          ) : (
                            <>
                              <Typography
                                variant="h5"
                                fontWeight={600}
                                color="primary"
                              >
                                Application Information
                              </Typography>
                              <Stack mt={4} spacing={3}>
                                {applicationInformation.map((item, index) => (
                                  <DetailsItem key={index} item={item} />
                                ))}
                              </Stack>
                            </>
                          )}
                        </>
                      )}
                      {activeTab === 'documents' && (
                        <>
                          {isLoadingApplicationDetails ? (
                            <>
                              <ApplicationDetailsItemSkeleton />
                              <ApplicationDetailsItemSkeleton />
                            </>
                          ) : (
                            <>
                              <Typography
                                variant="h5"
                                fontWeight={600}
                                color="primary"
                              >
                                Documents
                              </Typography>
                              <Stack mt={4} spacing={3}>
                                {documentsInformation.map((item, index) => (
                                  <DetailsItem key={index} item={item} />
                                ))}
                              </Stack>
                            </>
                          )}
                        </>
                      )}
                    </Box>
                  </Suspense>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default ApplicationDetails;

interface DetailsItemProps {
  item: {
    icon?: string;
    title?: string;
    description?: string;
    isLink?: boolean;
    onClick?: () => void;
    isHeader?: boolean;
    isDivider?: boolean;
    titleColor?: string;
  };
}

const DetailsItem = ({ item }: DetailsItemProps) => {
  if (item.isDivider) {
    return (
      <Box sx={{ my: 3 }}>
        <Divider />
      </Box>
    );
  }

  return (
    <Stack direction="row" gap={2} alignItems="center">
      <Box
        sx={{
          bgcolor: COLORS.bgBlue,
          height: 48,
          width: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2
        }}
      >
        <Image
          src={item.icon!}
          alt={item.description || ''}
          height={24}
          width={24}
        />
      </Box>
      <Stack>
        <Typography
          fontWeight="500"
          noWrap
          onClick={item?.onClick}
          sx={{
            color: item.isLink ? COLORS.primary : item.titleColor || 'inherit',
            textDecoration: item.isLink ? 'underline' : 'none',
            cursor: item.isLink ? 'pointer' : 'default',
            maxWidth: { xs: '220px', sm: '360px', md: '520px' }
          }}
        >
          {item.title}
        </Typography>
        <Typography variant="body2">{item.description}</Typography>
      </Stack>
    </Stack>
  );
};
