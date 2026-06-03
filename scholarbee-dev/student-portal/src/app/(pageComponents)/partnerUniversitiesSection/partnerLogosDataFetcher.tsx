'use client';
import React, { useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useGetPartnerUniversitiesQuery } from '@/redux/api/campusesApi';
import PartnerUniversitiesGrid from './PartnerUniversitiesGrid';
import { PartnerLogo } from './logoItem';
// import { toUrlSlug } from '@/utils/helperFunctions';

import partner1 from '@public/assets/svg/partners/partner.svg';
import partner2 from '@public/assets/svg/partners/partner2.svg';
import partner3 from '@public/assets/svg/partners/partner3.svg';
import partner4 from '@public/assets/svg/partners/partner4.svg';
import partner5 from '@public/assets/svg/partners/partner5.svg';
import partner6 from '@public/assets/svg/partners/partner6.svg';
import partner7 from '@public/assets/svg/partners/partner7.svg';
import partner8 from '@public/assets/svg/partners/partner8.svg';
import partner9 from '@public/assets/svg/partners/partner9.svg';
import partner10 from '@public/assets/svg/partners/partner10.svg';

// Static partner logos as fallback
const STATIC_PARTNER_LOGOS = [
  partner1,
  partner2,
  partner3,
  partner4,
  partner5,
  partner6,
  partner7,
  partner8,
  partner9,
  partner10
];

// Placeholder image for universities without logos
const PLACEHOLDER_LOGO = '/assets/svg/partners/partner.svg';

// Helper function to check if error is 404
const is404Error = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  if ('status' in error) {
    const status = (error as { status: number | string }).status;
    return status === 404 || status === 'FETCH_ERROR';
  }
  return false;
};

const PartnerLogosDataFetcher: React.FC = () => {
  const {
    data: partnersData,
    isLoading,
    isError,
    error
  } = useGetPartnerUniversitiesQuery();

  // Check if error is 404 or if data is empty
  const shouldUseFallback = useMemo(() => {
    if (isError) {
      return is404Error(error) || !partnersData?.data;
    }
    return !partnersData?.data || partnersData.data.length === 0;
  }, [isError, error, partnersData]);

  // Flatten partner campuses into a single array of logos
  // Only show first campus from each university, use university logo_url for display
  const partnerLogos = useMemo((): PartnerLogo[] => {
    // Use static logos if API failed or returned empty data
    if (shouldUseFallback) {
      return STATIC_PARTNER_LOGOS.map((logo, index) => ({
        url: logo,
        alt: `Partner University ${index + 1}`,
        isStatic: true,
        universityId: null,
        campusId: null
      }));
    }

    if (!partnersData?.data) return [];

    const logos: PartnerLogo[] = [];

    partnersData.data.forEach((group) => {
      const universityId = group.university._id;
      const universityLogo = group.university.logo_url;

      // Only get the first campus from the array
      const firstCampus = group?.campuses?.[0];
      if (!firstCampus) return;

      // Use university logo_url for display, fallback to placeholder
      const logoUrl = universityLogo || PLACEHOLDER_LOGO;
      const alt = firstCampus.name || group.university.name;
      const campusSlug = firstCampus?.slug ?? null;

      const cityRaw =
        (firstCampus as { city?: string }).city ??
        (firstCampus as { address?: { city?: string } }).address?.city;
      const citySlug = cityRaw || null;

      logos.push({
        url: logoUrl,
        alt,
        isStatic: false,
        universityId,
        universitySlug: campusSlug ?? null,
        // universitySlug: group.university.slug ?? null,
        campusId: firstCampus._id,
        citySlug
      });
    });

    return logos;
  }, [partnersData, shouldUseFallback]);

  // Show loading state only if we don't have fallback data ready
  if (isLoading && !shouldUseFallback) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If no logos available (shouldn't happen with fallback, but safety check)
  if (!partnerLogos.length) {
    return null;
  }

  return <PartnerUniversitiesGrid partnerLogos={partnerLogos} />;
};

export default PartnerLogosDataFetcher;
