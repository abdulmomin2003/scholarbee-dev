/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { Suspense, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Skeleton,
  CircularProgress
} from '@mui/material';
import ProgramCardSkeleton from '@/components/organisms/programCardSkelton';
import ProgramCard from '@/app/(pageComponents)/programCard';
import {
  toUrlSlug,
  toProgramCityPathSegment,
  getAdmissionStatus,
  resolveProgramUniversityAbbreviation
} from '@/utils/helperFunctions';
import { useFavorites } from '../hooks/useFavorite';
import withAuth from '@/utils/withAuth';
import ScholarshipCard from '@/app/search-scholarship/components/scholarshipCard';

const MemoizedProgramCard = React.memo(ProgramCard);

const MemoizedScholarshipCard = React.memo(ScholarshipCard);

const ProgramsLoading = () => (
  <Box>
    <Box>
      <Container>
        <Skeleton variant="text" width="60%" height={40} />
        <Box mt={5} pb={3}>
          <Skeleton variant="text" width="80%" height={60} />
          <Skeleton variant="text" width="70%" height={40} />
        </Box>
      </Container>
    </Box>
    <Container>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <Box sx={{ borderRadius: 2, backgroundColor: 'white', padding: 2 }}>
            <Skeleton variant="text" width="100%" height={60} />
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 9 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <ProgramCardSkeleton key={`program-loading-skeleton-${index}`} />
          ))}
        </Grid>
      </Grid>
    </Container>
  </Box>
);

const ProgramsContent = ({ type }: { type: string }) => {
  const {
    allFavorites,
    isLoadingFavoritePrograms,
    isFetchingFavoritePrograms,
    handleLoadMore,
    totalDocs,
    totalProgramPages,
    programPage,
    favoritesScholarships,
    isLoadingScholarships,
    isFetchingScholarships,
    totalFavoritesScholarships,
    handleLoadMoreScholarships,
    totalScholarshipPages,
    scholarshipPage,
    meta,
    metaScholarships
  } = useFavorites(type);

  const filteredFavorites = useMemo(() => allFavorites, [allFavorites]);

  const memoizedPrograms = useMemo(
    () =>
      filteredFavorites?.map((favorite: any, index: number) => {
        if (!favorite) return null;

        const { _id, program, admission } = favorite ?? {};
        const {
          name = '',
          mode_of_study = '',
          fee_structure = {},
          campus_id = {},
          degree_level,
          major,
          seo_title_key,
          receiving_applications: program_receiving_applications
        } = program ?? {};

        const { tuition_fee = '', payment_schedule } = fee_structure ?? {};

        const {
          admission_deadline = '',
          admission_startdate = '',
          receiving_applications: admission_receiving_applications,
          session_term,
          session_year,
          intake_year
        } = admission ?? {};

        const {
          logo_url: campusImage,
          address_id,
          university_id,
          slug: campusSlug
        } = campus_id ?? {};

        const { logo_url, slug: universitySlug } = (university_id ?? {}) as {
          logo_url?: string;
          slug?: string;
        };

        const universityName =
          (typeof university_id === 'object' && university_id !== null
            ? ((
                university_id as {
                  name?: string;
                  university_name?: string;
                }
              )?.name ??
              (university_id as { university_name?: string })?.university_name)
            : '') ?? '';

        const campusName = (campus_id as any)?.name ?? '';

        const cityName = address_id?.city ?? '';

        const programSlug = toUrlSlug(
          [degree_level, major].filter(Boolean).join(' ')
        );

        const campusId =
          (campus_id as any)?._id ?? (campus_id as any)?.id ?? '';

        // Effective RA: program-level RA wins unless 'inherit', in which case
        // we fall back to the admission-level RA.
        const effectiveReceivingApplications =
          program_receiving_applications &&
          program_receiving_applications !== 'inherit'
            ? program_receiving_applications
            : admission_receiving_applications;

        const status = getAdmissionStatus(
          admission_startdate,
          admission_deadline,
          effectiveReceivingApplications
        );

        const universityAbbreviation = resolveProgramUniversityAbbreviation(
          favorite,
          program,
          university_id
        );

        const programCardData = {
          id: _id,
          slug: (favorite as { slug?: string })?.slug ?? _id,
          programTitle: name,
          modeOfStudy: mode_of_study,
          programTuitionFee: tuition_fee,
          programAdmissionDeadline: admission_deadline,
          admission_startdate,
          programAdmissionStartDate: admission_startdate,
          intakeYear: session_year ?? intake_year,
          campusImage: campusImage,
          campusId,
          campusName,
          universityName,
          universityLogoUrl: logo_url,
          campusAddress: `${address_id?.city}, ${address_id?.state}, ${address_id?.country}`,
          isFavorite: true,
          payment_schedule,
          programSlug,
          citySlug: toProgramCityPathSegment(cityName),
          uniSlug: universitySlug ?? toUrlSlug(universityName),
          status,
          receiving_applications:
            favorite?.receiving_applications ?? program_receiving_applications,
          admission_receiving_applications,
          universityAbbreviation,
          campusSlug,
          session_term,
          seo_title_key
        };
        return (
          <Box key={favorite?._id ?? favorite?.id ?? index} mb={3}>
            <MemoizedProgramCard
              onFavoritePage
              programCardData={programCardData}
            />
          </Box>
        );
      }),
    [filteredFavorites]
  );

  const memoizedScholarships = useMemo(
    () =>
      favoritesScholarships.map((favorite: any) => {
        return (
          <Box key={favorite?._id ?? favorite?.id} mb={3}>
            <MemoizedScholarshipCard
              programTitle={favorite?.scholarship_name ?? ''}
              scholarshipType={favorite?.scholarship_type ?? ''}
              scholarshipDeadline={favorite?.application_deadline ?? ''}
              offeredBy={favorite?.organization_id?.organization_name ?? ''}
              universityAddress={favorite?.region?.region_name ?? ''}
              scholarship={favorite}
              scholarshipImage={favorite?.image_url ?? ''}
              scholarshipAmount={favorite?.amount}
              isLoggedIn
              isFavorite
            />
          </Box>
        );
      }),
    [favoritesScholarships]
  );

  return (
    <Box>
      <Container>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}
            >
              {type === 'programs' ? (
                <>
                  {(isLoadingFavoritePrograms || isFetchingFavoritePrograms) &&
                  !allFavorites.length ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <ProgramCardSkeleton
                        key={`program-loading-skeleton-${index}`}
                      />
                    ))
                  ) : (
                    <>
                      {totalDocs ? (
                        memoizedPrograms
                      ) : (
                        <Typography
                          my={5}
                          color="text.secondary"
                          fontSize={24}
                          textAlign="center"
                        >
                          No Program Found
                        </Typography>
                      )}
                      {(programPage < totalProgramPages ||
                        isLoadingFavoritePrograms ||
                        isFetchingFavoritePrograms) &&
                        allFavorites.length > 0 &&
                        meta.total > 10 && (
                          <Button
                            sx={{
                              px: 12,
                              alignSelf: 'center',
                              minWidth: 140
                            }}
                            variant="outlined"
                            onClick={handleLoadMore}
                            disabled={
                              isLoadingFavoritePrograms ||
                              isFetchingFavoritePrograms
                            }
                          >
                            {isLoadingFavoritePrograms ||
                            isFetchingFavoritePrograms ? (
                              <CircularProgress color="inherit" size={28} />
                            ) : (
                              'Show More'
                            )}
                          </Button>
                        )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {(isLoadingScholarships || isFetchingScholarships) &&
                  !favoritesScholarships.length ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <ProgramCardSkeleton
                        key={`scholarship-skeleton-${index}`}
                      />
                    ))
                  ) : (
                    <>
                      {totalFavoritesScholarships ? (
                        memoizedScholarships
                      ) : (
                        <Typography
                          my={5}
                          color="text.secondary"
                          fontSize={24}
                          textAlign="center"
                        >
                          No Scholarships Found
                        </Typography>
                      )}

                      {(scholarshipPage < totalScholarshipPages ||
                        isLoadingScholarships ||
                        isFetchingScholarships) &&
                        favoritesScholarships.length > 0 &&
                        metaScholarships.total > 10 && (
                          <Button
                            sx={{
                              px: 12,
                              alignSelf: 'center',
                              minWidth: 140
                            }}
                            variant="outlined"
                            onClick={handleLoadMoreScholarships}
                            disabled={
                              isLoadingScholarships || isFetchingScholarships
                            }
                          >
                            {isLoadingScholarships || isFetchingScholarships ? (
                              <CircularProgress color="inherit" size={28} />
                            ) : (
                              'Show More'
                            )}
                          </Button>
                        )}
                    </>
                  )}
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const Programs: React.FC<{ type: string }> = ({ type }) => {
  return (
    <Suspense fallback={<ProgramsLoading />}>
      <ProgramsContent type={type} />
    </Suspense>
  );
};

const ProtectedPrograms = withAuth(Programs);

const MemoizedProtectedFavoritePrograms = React.memo(ProtectedPrograms);
MemoizedProtectedFavoritePrograms.displayName =
  'MemoizedProtectedFavoritePrograms';

export default MemoizedProtectedFavoritePrograms;
