'use client';
import React, { useMemo, useState, KeyboardEvent } from 'react';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import { useGetPartnerUniversitiesQuery } from '@/redux/api/campusesApi';

// Static partner list as fallback
const STATIC_PARTNERS = [
  'Bahria University',
  'Foundation University',
  'Ibadat University',
  'University of Bolton',
  'NAMAL University Mianwali',
  'Rashid Latif',
  'Urdu University',
  'LLU',
  'NIIT',
  'UCI'
];

// Helper function to remove text after any special character (including the character)
const truncateAtSpecialChar = (text: string): string => {
  // Match any special character (non-alphanumeric, non-space)
  const specialCharRegex = /[^a-zA-Z0-9\s]/;
  const match = text.match(specialCharRegex);
  if (match && match.index !== undefined) {
    return text.substring(0, match.index).trim();
  }
  return text;
};

interface FooterPartnersSectionProps {
  styles: {
    section: any;
    sectionTitle: any;
    sectionList: any;
    sectionItem: any;
  };
}

const FooterPartnersSection: React.FC<FooterPartnersSectionProps> = ({
  styles
}) => {
  const {
    data: partnersData,
    isError,
    error
  } = useGetPartnerUniversitiesQuery();

  const [showAll, setShowAll] = useState(false);

  // Helper function to check if error is 404
  const is404Error = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') return false;
    if ('status' in error) {
      const status = (error as { status: number | string }).status;
      return status === 404 || status === 'FETCH_ERROR';
    }
    return false;
  };

  // Determine if we should use fallback (404 or empty data)
  const shouldUseFallback = useMemo(() => {
    if (isError) {
      return is404Error(error) || !partnersData?.data;
    }
    return !partnersData?.data || partnersData.data.length === 0;
  }, [isError, error, partnersData]);

  // Get partner campuses from API or use static fallback
  // Only show campus names, use university ID and campus ID for redirection
  const partners = useMemo<
    Array<{
      name: string;
      universityId: string | null;
      universitySlug: string | null;
      campusId: string | null;
      citySlug: string | null;
    }>
  >(() => {
    if (shouldUseFallback || !partnersData?.data) {
      return STATIC_PARTNERS.map((name) => ({
        name,
        universityId: null,
        universitySlug: null,
        campusId: null,
        citySlug: null
      }));
    }

    const partnerList: Array<{
      name: string;
      universityId: string | null;
      universitySlug: string | null;
      campusId: string | null;
      citySlug: string | null;
    }> = [];
    partnersData.data.forEach((group) => {
      const universityId = group.university._id;
      const universitySlug = group.campuses[0]?.slug ?? null;
      const firstCampus = group.campuses[0];
      if (firstCampus) {
        partnerList.push({
          name: firstCampus.name,
          universityId,
          universitySlug,
          campusId: firstCampus._id,
          citySlug: firstCampus?.city ?? null
        });
      }
    });

    return partnerList.length > 0
      ? partnerList
      : STATIC_PARTNERS.map((name) => ({
          name,
          universityId: null,
          universitySlug: null,
          campusId: null,
          citySlug: null
        }));
  }, [partnersData, shouldUseFallback]);

  const VISIBLE_COUNT = 4;
  const visiblePartners = showAll ? partners : partners.slice(0, VISIBLE_COUNT);
  const hasToggle = partners.length > VISIBLE_COUNT;

  const handleToggleClick = () => {
    setShowAll((prev) => !prev);
  };

  const handleToggleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setShowAll((prev) => !prev);
    }
  };

  return (
    <Box component="nav" sx={styles.section} aria-label="Partner Universities">
      <Typography variant="h6" component="h2" sx={styles.sectionTitle}>
        Partner Universities
      </Typography>
      <Box
        component="ul"
        sx={{ ...styles.sectionList, p: 0, m: 0, listStyle: 'none' }}
      >
        {visiblePartners.map((partner, index) => {
          const partnerName = partner.name;
          const displayName = truncateAtSpecialChar(partnerName);
          const universityId = partner.universityId;
          const universitySlug = partner.universitySlug;
          // const campusId = partner.campusId;
          let href = '#';
          if (universitySlug ?? universityId) {
            href = `/universities/${partner.citySlug}/${universitySlug ?? universityId}`;
            // href = campusId ? `${baseUrl}?campusId=${campusId}` : baseUrl;
          } else if (partnerName === 'Become Our Partner') {
            href = '/contact-us';
          }
          return (
            <Box component="li" key={index}>
              <Link
                href={href}
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  width: '100%',
                  minWidth: 0,
                  overflow: 'hidden'
                }}
                aria-label={`View ${displayName}`}
                title={partnerName}
              >
                <Typography sx={styles.sectionItem} title={partnerName}>
                  {displayName}
                </Typography>
              </Link>
            </Box>
          );
        })}
        {hasToggle && (
          <Box component="li">
            <Typography
              sx={{
                ...styles.sectionItem,
                cursor: 'pointer',
                color: '#004AE0',
                fontWeight: 500
              }}
              role="button"
              tabIndex={0}
              onClick={handleToggleClick}
              onKeyDown={handleToggleKeyDown}
            >
              {showAll ? 'Show Less' : 'See More'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FooterPartnersSection;
