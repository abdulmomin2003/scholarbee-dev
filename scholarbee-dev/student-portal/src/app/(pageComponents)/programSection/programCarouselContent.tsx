'use client';
import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { ElasticsearchAdmissionProgramDocument } from '@/types/admission-program.types';
import { toUrlSlug } from '@/utils/helperFunctions';
import type { Scholarship } from '@/types/scholarship';
import ProgramCarouselCard from '../programCarouselCard';
import ScholarshipCarouselCard from '../scholarshipCarouselCard';
import CarouselSection from '@/components/molecules/CarouselSection';
import { carouselStyles } from '@/components/molecules/carouselStyles';
import { useCarousel } from '@/components/molecules/hooks/useCarousel';
import { useCarouselSliderSettings } from '@/components/molecules/utils/carouselSliderSettings';
import CarouselSlider from '@/components/molecules/CarouselSlider';
import CarouselEmptyState from '@/components/molecules/CarouselEmptyState';
import ProgramCarouselSkeleton from '@/components/molecules/ProgramCarouselSkeleton';
import { useGetRecommendationsQuery } from '@/redux/api/programApi';
import { useGetScholarshipsQuery } from '@/redux/api/scholarshipApi';
import Cookies from 'js-cookie';
import ProgramToggleButtons from './programToggleButtons';
import {
  isRecommendationsPersonalized,
  isPersonalizedScoringMode
} from '@/utils/recommendations';

interface ProgramsResponse {
  docs: ElasticsearchAdmissionProgramDocument[];
  pagination?: {
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
  };
}

interface ProgramCarouselContentProps {
  isScholarship?: boolean;
  initialPrograms?: ProgramsResponse | null;
  initialScholarships?: Scholarship[];
  styles: any;
}

const ProgramCarouselContent: React.FC<ProgramCarouselContentProps> = ({
  isScholarship,
  initialPrograms,
  initialScholarships,
  styles
}) => {
  const [showScholarships, setShowScholarships] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const token = mounted ? Cookies.get('access_token') : undefined;

  // Determine if initialPrograms is already personalized
  const isInitialPersonalized = isRecommendationsPersonalized(
    initialPrograms?.docs?.[0]
  );

  // We should fetch personalized recommendations on the client if:
  // 1. We are mounted on client-side.
  // 2. The user is logged in (has token).
  // 3. The initial server programs are NOT personalized.
  const shouldFetchPersonalized = !!(
    mounted &&
    token &&
    !isInitialPersonalized
  );

  // We should fetch fallback recommendations (trending) on the client to keep click popularity fresh
  const shouldFetchFallbackRecs = !!(mounted && !shouldFetchPersonalized);

  // Fetch recommendations
  const { data: recsData, isLoading: recsLoading } = useGetRecommendationsQuery(
    { type: 'programs', limit: 15 },
    { skip: !(shouldFetchPersonalized || shouldFetchFallbackRecs) }
  );

  // Fetch scholarships only when no SSR data provided
  const { data: scholarshipsData, isLoading: scholarshipsLoading } =
    useGetScholarshipsQuery(
      { page: 1, limit: 10 },
      { skip: (initialScholarships?.length ?? 0) > 0 }
    );

  const programs =
    shouldFetchPersonalized || shouldFetchFallbackRecs
      ? recsData || initialPrograms
      : initialPrograms;

  // Use SSR scholarships if provided, else fall back to CSR fetch
  const scholarships =
    (initialScholarships?.length ?? 0) > 0
      ? { data: initialScholarships }
      : scholarshipsData;

  const isLoading =
    (!programs && recsLoading) ||
    (!initialScholarships?.length && scholarshipsLoading);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[Diagnostic] Client-side recommendations state:', {
        hasInitialProgramsProps: !!initialPrograms?.docs?.length,
        initialProgramsCount: initialPrograms?.docs?.length || 0,
        initialProgramsTopTitle:
          initialPrograms?.docs?.[0]?.program_title || 'none',
        initialProgramsTopScoringMode:
          (initialPrograms?.docs?.[0] as any)?.scoring_mode || 'none',
        shouldFetchPersonalized,
        shouldFetchFallbackRecs,
        hasRecsData: !!recsData?.docs?.length,
        recsDataCount: recsData?.docs?.length || 0,
        recsDataTopTitle: recsData?.docs?.[0]?.program_title || 'none',
        finalDisplayProgramsCount: programs?.docs?.length || 0,
        finalDisplayProgramsTopTitle:
          programs?.docs?.[0]?.program_title || 'none',
        finalDisplayProgramsTopScoringMode:
          (programs?.docs?.[0] as any)?.scoring_mode || 'none',
        browserCookieTokenFound: document.cookie.includes('access_token'),
        browserCookieTokenSnippet:
          (
            document.cookie.match(/access_token=([^;]+)/)?.[1] || 'NONE'
          ).substring(0, 25) + '...'
      });
    }
  }, [
    initialPrograms,
    recsData,
    programs,
    shouldFetchPersonalized,
    shouldFetchFallbackRecs
  ]);

  const { sliderRef, handleNext, handlePrev } = useCarousel();
  const baseSliderSettings = useCarouselSliderSettings({
    breakpoint: 1024,
    slidesToShowMedium: 2
  });

  const sliderSettings = {
    ...baseSliderSettings,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true
  };

  const displayPrograms = useMemo(() => {
    if (!programs?.docs) return [];
    return programs.docs.map(
      (program: ElasticsearchAdmissionProgramDocument) => ({
        ...program
      })
    );
  }, [programs?.docs]);

  const displayScholarships = useMemo(() => {
    if (!scholarships?.data) return [];
    return scholarships.data;
  }, [scholarships?.data]);

  return (
    <>
      {/* Toggle Switch Buttons */}
      <ProgramToggleButtons
        showScholarships={showScholarships}
        onToggle={setShowScholarships}
        styles={styles}
      />

      {/* Visual Debug Indicator for Recommendations */}
      {!showScholarships && displayPrograms.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
            mb: 1
          }}
        >
          <Box
            sx={{
              padding: '6px 16px',
              borderRadius: '20px',
              backgroundColor: isPersonalizedScoringMode(
                displayPrograms[0]?.scoring_mode
              )
                ? 'rgba(74, 222, 128, 0.15)'
                : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${isPersonalizedScoringMode(displayPrograms[0]?.scoring_mode) ? 'rgba(74, 222, 128, 0.5)' : 'rgba(244, 63, 94, 0.5)'}`,
              color: isPersonalizedScoringMode(displayPrograms[0]?.scoring_mode)
                ? '#16a34a'
                : '#be123c',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif"
            }}
          >
            System Mode:{' '}
            {isPersonalizedScoringMode(displayPrograms[0]?.scoring_mode)
              ? '🎯 Personalized Recommendations Active'
              : '🔥 Trending Fallback (Anonymous/No Preferences)'}
          </Box>
        </Box>
      )}

      {/* Programs or Scholarships Carousel */}
      {isLoading ? (
        <ProgramCarouselSkeleton />
      ) : showScholarships ? (
        displayScholarships.length > 0 ? (
          <CarouselSection
            title="Find Scholarships That Fit You"
            subtitle="Funding opportunities tailored for your academic journey."
            onPrev={handlePrev}
            onNext={handleNext}
            seeAllHref="/search-scholarship"
            prevArrowStyle="white"
            nextArrowStyle="white"
            containerAlignItems="flex-end"
          >
            <CarouselSlider
              sliderRef={sliderRef}
              sliderSettings={sliderSettings}
              className="scholarship-carousel-container"
            >
              {displayScholarships.map(
                (scholarship: Scholarship, index: number) => {
                  return (
                    <Box
                      key={scholarship._id}
                      component={motion.div}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      sx={carouselStyles.cardWrapper}
                    >
                      <ScholarshipCarouselCard scholarship={scholarship} />
                    </Box>
                  );
                }
              )}
            </CarouselSlider>
          </CarouselSection>
        ) : (
          <CarouselEmptyState message="No Scholarships Found" py={3} />
        )
      ) : displayPrograms.length > 0 ? (
        <CarouselSection
          title="Explore Top Academic Programs"
          subtitle="Compare universities, check programs offered, and apply confidently."
          onPrev={handlePrev}
          onNext={handleNext}
          seeAllHref={isScholarship ? '/search-scholarship' : '/programs'}
          prevArrowStyle="white"
          nextArrowStyle="white"
          containerAlignItems="flex-end"
        >
          <CarouselSlider
            sliderRef={sliderRef}
            sliderSettings={sliderSettings}
            className="program-carousel-container"
          >
            {displayPrograms.map(
              (
                program: ElasticsearchAdmissionProgramDocument & {
                  badge?: string;
                  badgeColor?: { bg: string; text: string };
                },
                index: number
              ) => {
                const {
                  program_title,
                  study_mode,
                  first_semester_fee,
                  payment_schedule,
                  admission_enddate,
                  campus_image,
                  university_logo,
                  location_details,
                  university_name,
                  campus_name,
                  university_slug,
                  seo_title_key,
                  session_term: intake_period,
                  session_year,
                  intake_year,
                  campus_slug,
                  _id,
                  slug: programSlug,
                  program_id,
                  isFavorite,
                  degree_level,
                  major,
                  receiving_applications
                } = program;
                const programSlugSeg = toUrlSlug(
                  [degree_level, major].filter(Boolean).join(' ') ||
                    program_title
                );
                const citySlugSeg = location_details?.city?.toLowerCase() ?? '';
                const uniSlugSeg = university_slug ?? '';
                const detailsUrl = `/programs/${seo_title_key}/${location_details?.city?.toLowerCase()}/${campus_slug}?session=${intake_period?.toLowerCase()}-${session_year?.toString()?.trim()?.toLowerCase() ?? ''}`;
                const programCardData = {
                  id: _id,
                  slug: programSlug,
                  programId: program_id,
                  programTitle: program_title,
                  modeOfStudy: study_mode,
                  programTuitionFee: first_semester_fee,
                  programAdmissionDeadline: admission_enddate,
                  campusImage: campus_image,
                  universityLogoUrl: university_logo,
                  universityName: university_name,
                  campusName: campus_name,
                  campusAddress: `${location_details?.city}, ${location_details?.country}`,
                  isFavorite: isFavorite,
                  payment_schedule: payment_schedule,
                  programSlug: programSlugSeg,
                  citySlug: citySlugSeg,
                  uniSlug: uniSlugSeg,
                  receiving_applications: receiving_applications,
                  session_term: intake_period,
                  intakeYear: session_year ?? intake_year,
                  detailsUrl: detailsUrl
                };
                return (
                  <Box
                    key={program._id}
                    component={motion.div}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    sx={carouselStyles.cardWrapper}
                  >
                    <ProgramCarouselCard programCardData={programCardData} />
                  </Box>
                );
              }
            )}
          </CarouselSlider>
        </CarouselSection>
      ) : (
        <CarouselEmptyState message="No Program Found" py={3} />
      )}
    </>
  );
};

export default ProgramCarouselContent;
