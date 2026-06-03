/* eslint-disable @typescript-eslint/no-explicit-any */
import { Typography, Box, Stack } from '@mui/material';
import Link from 'next/link';
import React from 'react';
import { styles } from '../styles';
import ProgramCardSkeleton from '@/components/organisms/programCardSkelton';
import ScholarshipCard from '@/app/search-scholarship/components/scholarshipCard';
import { Scholarship } from '@/types/scholarship';
import ProgramCard from '@/app/(pageComponents)/programCard';
import {
  resolveProgramUniversityAbbreviation,
  toUrlSlug,
  toProgramCityPathSegment
} from '@/utils/helperFunctions';

const viewAllHrefByType: Record<string, string> = {
  Programs: '/profile/favorite-programs',
  Scholarships: '/profile/favorite-scholarships'
};

const SavedPrograms = ({
  allFavorites,
  isLoading,
  // handleViewAllFavorites,
  type
}: {
  allFavorites: any;
  isLoading: boolean;
  // handleViewAllFavorites: () => void;
  type: string;
}) => {
  const viewAllHref = viewAllHrefByType[type] ?? '/profile';
  return (
    <Box sx={styles.savedSection}>
      <Stack mt={2} direction="row" justifyContent="space-between">
        <Typography fontWeight={'600'} variant="h5">
          {`Saved ${type}`}
        </Typography>
        {allFavorites?.length > 0 && (
          <Link
            href={viewAllHref}
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
      {type === 'Scholarships' ? (
        <Box>
          {isLoading ? (
            <>
              <ProgramCardSkeleton />
              <ProgramCardSkeleton />
            </>
          ) : (
            <>
              {allFavorites?.length > 0 ? (
                <Box mt={3}>
                  {allFavorites
                    ?.slice(0, 2)
                    ?.map((scholarship: Scholarship) => (
                      <Box key={scholarship?._id} my={1}>
                        <ScholarshipCard
                          outlined
                          scholarship={scholarship}
                          isFavorite={true}
                          programTitle={scholarship?.scholarship_name ?? ''}
                          scholarshipType={scholarship?.scholarship_type}
                          scholarshipDeadline={
                            scholarship?.application_deadline
                          }
                          universityAddress={
                            scholarship?.region?.region_name ?? ''
                          }
                          isLoggedIn={true}
                          offeredBy={
                            scholarship?.organization_id?.organization_name ??
                            ''
                          }
                          scholarshipImage={scholarship?.image_url}
                          scholarshipAmount={scholarship?.amount}
                        />
                      </Box>
                    ))}
                </Box>
              ) : (
                <Typography
                  my={5}
                  color="text.secondary"
                  variant="body1"
                  textAlign="center"
                >
                  No Scholarships Found
                </Typography>
              )}
            </>
          )}
        </Box>
      ) : (
        <Box>
          {isLoading ? (
            <>
              <ProgramCardSkeleton />
              <ProgramCardSkeleton />
            </>
          ) : (
            <>
              {allFavorites?.length > 0 ? (
                <Box mt={3}>
                  {allFavorites?.slice(0, 2)?.map((favorite: any) => {
                    if (!favorite) return null;
                    const { _id, program, admission } = favorite;
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

                    const { tuition_fee = '', payment_schedule } =
                      fee_structure ?? {};

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

                    const { logo_url, slug: universitySlug } = (university_id ??
                      {}) as { logo_url?: string; slug?: string };
                    const universityName =
                      (typeof university_id === 'object' &&
                      university_id !== null
                        ? ((
                            university_id as {
                              name?: string;
                              university_name?: string;
                            }
                          )?.name ??
                          (university_id as { university_name?: string })
                            ?.university_name)
                        : '') ?? '';
                    const campusName = (campus_id as any)?.name ?? '';
                    const cityName = address_id?.city ?? '';

                    const campusId =
                      (campus_id as any)?._id ?? (campus_id as any)?.id ?? '';

                    const universityAbbreviation =
                      resolveProgramUniversityAbbreviation(
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
                      universityLogoUrl: logo_url ?? '',
                      campusAddress: `${address_id?.city}, ${address_id?.state}, ${address_id?.country}`,
                      isFavorite: true,
                      payment_schedule,
                      programSlug: toUrlSlug(
                        [degree_level, major].filter(Boolean).join(' ')
                      ),
                      citySlug: toProgramCityPathSegment(cityName),
                      uniSlug: universitySlug ?? toUrlSlug(universityName),
                      campusSlug,
                      session_term,
                      seo_title_key,
                      receiving_applications:
                        favorite?.receiving_applications ??
                        program_receiving_applications,
                      admission_receiving_applications,
                      universityAbbreviation
                    };

                    return (
                      <Box key={program?._id} my={1}>
                        <ProgramCard
                          onFavoritePage
                          programCardData={programCardData}
                        />
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography
                  my={5}
                  color="text.secondary"
                  variant="body1"
                  textAlign="center"
                >
                  No Programs Found
                </Typography>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SavedPrograms;
