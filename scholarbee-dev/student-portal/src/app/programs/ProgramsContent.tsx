'use client';
import React, { memo } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Skeleton,
  CircularProgress
} from '@mui/material';
import {
  getAdmissionStatus,
  toProgramCityPathSegment
} from '@/utils/helperFunctions';
import Footer from '@/components/organisms/footer';
import CustomizedBreadcrumbs from '@/components/organisms/breadCrumbs';
import Title from '@/components/atoms/title';
import { CustomTypography } from '@/components/atoms/customTypography';
import Navbar from '@/components/organisms/navbar';
import { COLORS } from '@/constants/colors';
import ProgramCardSkeleton from '@/components/organisms/programCardSkelton';
import { usePrograms } from './usePrograms';
import FilterSection from './(pageComponents)/filters';
import Link from 'next/link';
import ProgramCard from '../(pageComponents)/programCard';
import { ElasticsearchAdmissionProgramDocument } from '@/types/admission-program.types';
import PlaceholderText from '@/components/atoms/placeholderText';
import {
  Level1ProgramIntro,
  Level2CityIntro
} from './(pageComponents)/ProgramListingIntro';
import {
  ProgramListingFAQ,
  DEFAULT_PROGRAM_FAQ_ITEMS
} from './(pageComponents)/ProgramListingFAQ';

const ProgramCardsList = memo(
  ({ programs }: { programs: ElasticsearchAdmissionProgramDocument[] }) => {
    return (
      <>
        {programs?.map((program) => {
          const {
            program_title,
            study_mode,
            first_semester_fee,
            payment_schedule,
            campus_image,
            campus_slug,
            campus_id,
            university_logo,
            location_details,
            _id,
            slug: programSlug,
            program_id,
            isFavorite,
            admission_enddate,
            admission_startdate,
            // degree_level,
            // major,
            university_name,
            campus_name,
            seo_title_key,
            session_term: intake_period,
            session_year,
            intake_year,
            // university_slug,
            short_name,
            university_abbreviation,
            receiving_applications
          } = program;
          // const programSlugSegment = toUrlSlug(
          //   [degree_level, major].filter(Boolean).join(' ') || program_title
          // );
          const programSlugSegment = [seo_title_key, intake_period]
            .map((segment) => segment?.trim())
            .filter(Boolean)
            .join('-');
          const citySlugSegment =
            location_details?.city != null
              ? toProgramCityPathSegment(location_details.city)
              : '';
          const uniSlugSegment = campus_slug ?? '';
          const programCardData = {
            id: _id,
            slug: programSlug,
            programId: program_id,
            programTitle: program_title,
            modeOfStudy: study_mode,
            programTuitionFee: first_semester_fee,
            programAdmissionDeadline: admission_enddate,
            campusImage: campus_image,
            campusId: campus_id,
            campusName: campus_name,
            universityName: university_name,
            universityLogoUrl: university_logo,
            campusAddress: `${location_details?.city}, ${location_details?.state}, ${location_details?.country}`,
            isFavorite: isFavorite,
            payment_schedule: payment_schedule,
            status: getAdmissionStatus(
              admission_startdate,
              admission_enddate,
              receiving_applications
            ),
            admission_startdate,
            programSlug: programSlugSegment,
            citySlug: citySlugSegment,
            uniSlug: uniSlugSegment,
            shortName: short_name,
            universityAbbreviation: university_abbreviation,
            campusSlug: campus_slug,
            seo_title_key,
            session_term: intake_period,
            intakeYear: session_year ?? intake_year,
            receiving_applications: receiving_applications
          };
          return (
            <Box key={program?._id} mb={3}>
              <ProgramCard programCardData={programCardData} />
            </Box>
          );
        })}
      </>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the array length changes or if any program data actually changed
    if (prevProps.programs.length !== nextProps.programs.length) {
      return false; // Re-render if length changed
    }

    // Check if any program data has actually changed
    return prevProps.programs.every((prevProgram, index) => {
      const nextProgram = nextProps.programs[index];
      return (
        prevProgram._id === nextProgram._id &&
        prevProgram.isFavorite === nextProgram.isFavorite &&
        prevProgram.program_title === nextProgram.program_title
      );
    });
  }
);

ProgramCardsList.displayName = 'ProgramCardsList';

const ProgramsContent = ({
  initialPrograms,
  initialTotalDocs,
  fixedMajor,
  fixedCity,
  majorName,
  cityName
}: {
  initialPrograms?: ElasticsearchAdmissionProgramDocument[];
  initialTotalDocs?: number;
  fixedMajor?: string;
  fixedCity?: string;
  /** Display name for Level 1/2 SEO intro (e.g. "Computer Science") */
  majorName?: string;
  /** Display name for Level 2 city intro (e.g. "Islamabad") */
  cityName?: string;
}) => {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('programNavigationSource', 'programs');
    }
  }, []);

  const {
    showFilters,
    formData,
    allPrograms,
    isLoading,
    isFetching,
    programs,
    handleChange,
    handleFilters,
    handleLoadMore,
    totalDocs,
    handleSearchChange,
    handleUniversityChange,
    handleReset,
    isLoadingMajors,
    isLoadingDegreeLevels,
    majorsPrograms,
    degreeLevelsPrograms,
    searchValue
  } = usePrograms(initialPrograms, initialTotalDocs, { fixedMajor, fixedCity });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true
  });

  let listingContent: React.ReactNode;
  if (isLoading && !allPrograms.length) {
    listingContent = Array.from({ length: 5 }).map((_, position) => (
      <ProgramCardSkeleton key={`skeleton-position-${position + 1}`} />
    ));
  } else if (totalDocs) {
    listingContent = <ProgramCardsList programs={allPrograms} />;
  } else {
    listingContent = <PlaceholderText text="No Program Found" />;
  }

  const loadMoreButtonLabel =
    isLoading || isFetching ? (
      <CircularProgress color="inherit" />
    ) : (
      'Show More'
    );

  let programCountContent: React.ReactNode;
  if (!isLoading && !isFetching) {
    programCountContent = (
      <>
        <CustomTypography
          fontSize={24}
          smallFont={18}
          color="primary"
          fontWeight="bold"
          variant="h5"
          component="h2"
        >
          {`${totalDocs} programs found`}
        </CustomTypography>
        <Typography fontSize={14} variant="body1">
          Match your filter & search settings
        </Typography>
      </>
    );
  } else if (initialTotalDocs) {
    programCountContent = (
      <>
        <CustomTypography
          fontSize={24}
          smallFont={18}
          color="primary"
          fontWeight="bold"
          variant="h5"
        >
          {`${initialTotalDocs} programs found`}
        </CustomTypography>
        <Typography fontSize={14} variant="body1">
          Match your filter & search settings
        </Typography>
      </>
    );
  } else {
    programCountContent = (
      <>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="text" width={150} height={20} />
      </>
    );
  }

  return (
    <Box bgcolor={COLORS.bgColor}>
      <Navbar isCritical={false} />
      <Box bgcolor="white">
        <Container>
          <CustomizedBreadcrumbs />
          {(() => {
            if (majorName && cityName) {
              return (
                <Level2CityIntro majorName={majorName} cityName={cityName} />
              );
            }
            if (majorName) {
              return <Level1ProgramIntro majorName={majorName} />;
            }
            return (
              <Box mt={5} pb={3}>
                <Title title="Unlock Your Future with the Right Education" />
                <Typography variant="body2" fontSize={20}>
                  Explore tailored programs and scholarship options—all in one
                  place. ScholarBee is your trusted partner in finding the
                  education that fits your goals.
                </Typography>
              </Box>
            );
          })()}
        </Container>
      </Box>
      <Container sx={{ my: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Box sx={{ borderRadius: 2, backgroundColor: 'white', padding: 2 }}>
              <Link href="/programs/compare-universities">
                <Button
                  sx={{ maxWidth: '100%', width: '100%' }}
                  variant="contained"
                >
                  Compare Universities
                </Button>
              </Link>
            </Box>
            <Box
              sx={{ borderRadius: 2, backgroundColor: 'white', p: 2, mt: 2 }}
            >
              {programCountContent}
              <FilterSection
                formData={formData}
                handleChange={handleChange}
                handleUniversityChange={handleUniversityChange}
                handleSearchChange={handleSearchChange}
                handleReset={handleReset}
                handleFilters={handleFilters}
                showFilters={showFilters}
                isFetching={isFetching}
                isSmallScreen={isSmallScreen}
                uniqueDegreeLevels={
                  isLoadingDegreeLevels ? [] : degreeLevelsPrograms
                }
                uniqueMajors={isLoadingMajors ? [] : majorsPrograms}
                searchValue={searchValue}
                hideMajorField={!!fixedMajor}
                hideCityField={!!fixedCity}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 8, md: 9 }}>
            <Box
              sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}
            >
              {listingContent}
              {programs?.pagination?.hasNextPage && (
                <Button
                  sx={{ px: 12, alignSelf: 'center' }}
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={isLoading || isFetching}
                >
                  {loadMoreButtonLabel}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
      {majorName && <ProgramListingFAQ items={DEFAULT_PROGRAM_FAQ_ITEMS} />}
      <Footer />
    </Box>
  );
};

export default ProgramsContent;
