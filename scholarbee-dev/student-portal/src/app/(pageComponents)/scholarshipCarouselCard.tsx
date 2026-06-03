'use client';
import React, { useCallback, useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import {
  formatAdmissionDeadline,
  isDomainAllowed
} from '@/utils/helperFunctions';
import { Scholarship } from '@/types/scholarship';
import {
  useAddScholarshipToFavoriteMutation,
  useRemoveScholarshipFromFavoriteMutation
} from '@/redux/api/scholarshipApi';
import Cookies from 'js-cookie';
import { COLORS } from '@/constants/colors';

interface ScholarshipCarouselCardProps {
  scholarship: Scholarship;
}

const ScholarshipCarouselCard = ({
  scholarship
}: ScholarshipCarouselCardProps) => {
  const { formattedDate } = formatAdmissionDeadline(
    scholarship?.application_deadline || ''
  );

  const scholarshipId = scholarship?._id;
  const scholarshipUrl = scholarshipId
    ? `/scholarship-details/${scholarshipId}`
    : '';

  // Get user authentication state
  const userId = Cookies.get('userId') ?? null;
  const isLoggedIn = !!userId;

  // Check if scholarship is favorited
  const initialIsFavorite = userId
    ? (scholarship?.favouriteBy?.includes(userId) ?? false)
    : false;

  // Optimistic favorite state
  const [optimisticFavorite, setOptimisticFavorite] =
    useState(initialIsFavorite);

  // Sync optimistic state if scholarship prop changes
  useEffect(() => {
    const currentIsFavorite = userId
      ? (scholarship?.favouriteBy?.includes(userId) ?? false)
      : false;
    setOptimisticFavorite(currentIsFavorite);
  }, [scholarship?.favouriteBy, userId]);

  // Favorite functionality
  const [addScholarshipToFavoriteMutation, { isLoading: isAddingToFavorite }] =
    useAddScholarshipToFavoriteMutation();
  const [
    removeScholarshipFromFavoriteMutation,
    { isLoading: isRemovingFromFavorite }
  ] = useRemoveScholarshipFromFavoriteMutation();

  const isProcessingFavorite = isAddingToFavorite || isRemovingFromFavorite;

  const handleToggleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!scholarshipId || isProcessingFavorite || !userId) return;

      const previousFavorite = optimisticFavorite;
      // Optimistic update
      setOptimisticFavorite(!previousFavorite);

      try {
        if (previousFavorite) {
          await removeScholarshipFromFavoriteMutation(scholarshipId).unwrap();
        } else {
          await addScholarshipToFavoriteMutation(scholarshipId).unwrap();
        }
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticFavorite(previousFavorite);
        console.error('Error toggling scholarship favorite:', error);
      }
    },
    [
      scholarshipId,
      optimisticFavorite,
      isProcessingFavorite,
      userId,
      addScholarshipToFavoriteMutation,
      removeScholarshipFromFavoriteMutation
    ]
  );

  // Get scholarship type for tag styling
  const scholarshipType = scholarship?.scholarship_type || '';
  const getTagStyle = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('merit')) {
      return {
        bg: '#EDFDED',
        color: '#00E000'
      };
    }
    if (typeLower.includes('need')) {
      return {
        bg: '#EDEDFD',
        color: '#0000E0'
      };
    }
    if (typeLower.includes('international')) {
      return {
        bg: '#FDFDED',
        color: '#BABA00'
      };
    }
    return {
      bg: '#F4F5F6',
      color: '#676D79'
    };
  };

  const tagStyle = getTagStyle(scholarshipType);
  const isInternational = scholarshipType
    ?.toLowerCase()
    .includes('international');
  const isLocal = !isInternational;

  const organizationName =
    scholarship?.organization_id?.organization_name || '';
  const regionName = scholarship?.region?.region_name || '';
  const offeredByText = [organizationName, regionName]
    .filter(Boolean)
    .join(', ');

  const imageUrl = scholarship?.image_url || '';
  const displayImage = isDomainAllowed(imageUrl)
    ? imageUrl
    : '/assets/png/scholarship_placeholder.png';

  // Format fee and study mode
  const feeText = scholarship?.amount
    ? `PKR ${scholarship.amount.toLocaleString('en-US')}`
    : 'Not Disclosed';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const studyModeText = (scholarship as any)?.study_mode || 'Online';

  return (
    <Box sx={styles.card}>
      {/* Scholarship Image */}
      <Box sx={styles.imageContainer}>
        <Image
          src={displayImage}
          alt={scholarship?.scholarship_name || 'Scholarship'}
          fill
          style={styles.scholarshipImage as React.CSSProperties}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </Box>

      {/* Scholarship Title */}
      <Box sx={styles.titleRow}>
        <Typography variant="h6" sx={styles.scholarshipTitle}>
          {scholarship?.scholarship_name || 'Scholarship Name'}
        </Typography>
      </Box>

      {/* Tags */}
      <Box sx={styles.tagsContainer}>
        {scholarshipType && (
          <Chip
            label={scholarshipType}
            sx={{
              ...styles.tag,
              backgroundColor: tagStyle.bg,
              color: tagStyle.color,
              fontSize: '0.75rem',
              height: '28px',
              padding: '4px 12px',
              '& .MuiChip-label': {
                padding: 0,
                fontWeight: 400,
                fontSize: '0.75rem',
                lineHeight: '1rem'
              }
            }}
          />
        )}
        {isInternational && (
          <Chip
            label="International"
            sx={{
              ...styles.tag,
              backgroundColor: '#FDFDED',
              color: '#BABA00',
              fontSize: '14px',
              height: '32px',
              padding: '6px 16px',
              '& .MuiChip-label': {
                padding: 0,
                fontWeight: 400,
                fontSize: '0.75rem',
                lineHeight: '1rem'
              }
            }}
          />
        )}
        {isLocal && !isInternational && (
          <Chip
            label="Local"
            sx={{
              ...styles.tag,
              backgroundColor: '#F4F5F6',
              color: '#676D79',
              fontSize: '14px',
              height: '32px',
              padding: '6px 16px',
              '& .MuiChip-label': {
                padding: 0,
                fontWeight: 400,
                fontSize: '0.75rem',
                lineHeight: '1rem'
              }
            }}
          />
        )}
      </Box>

      {/* Offered By */}
      {offeredByText && (
        <Box sx={styles.offeredByContainer}>
          <Typography variant="body2" sx={styles.offeredBy}>
            {offeredByText}
          </Typography>
        </Box>
      )}

      {/* Details Section */}
      <Box sx={styles.detailsContainer}>
        {/* Deadline */}
        <Box sx={styles.detailRow}>
          <Typography variant="body2" sx={styles.detailLabel}>
            Deadline:
          </Typography>
          <Typography variant="body2" sx={styles.deadlineValue}>
            {formattedDate}
          </Typography>
        </Box>

        {/* Fee */}
        <Box sx={styles.detailRow}>
          <Typography variant="body2" sx={styles.detailLabel}>
            Fee:
          </Typography>
          <Typography variant="body2" sx={styles.detailValue}>
            {feeText}
          </Typography>
        </Box>

        {/* Study Mode */}
        <Box sx={styles.detailRow}>
          <Typography variant="body2" sx={styles.detailLabel}>
            Study Mode:
          </Typography>
          <Typography variant="body2" sx={styles.detailValue}>
            {studyModeText}
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={styles.actionButtons}>
        {scholarshipUrl && (
          <Link
            href={scholarshipUrl}
            style={{ textDecoration: 'none', flex: 1 }}
          >
            <Box sx={styles.applyButton}>
              <Typography variant="body2" sx={styles.applyButtonText}>
                View
              </Typography>
            </Box>
          </Link>
        )}
        {isLoggedIn && scholarshipId && (
          <Box
            onClick={handleToggleFavorite}
            sx={styles.favoriteButton({
              isDisabled: isProcessingFavorite,
              isFavorite: Boolean(optimisticFavorite)
            })}
          >
            <Image
              src={`/assets/svg/${optimisticFavorite ? 'heart-red' : 'heart-outlined'}.svg`}
              alt="favorite"
              width={24}
              height={24}
              style={{
                width: '24px',
                height: '24px',
                opacity: isProcessingFavorite ? 0.5 : 1,
                cursor: isProcessingFavorite ? 'not-allowed' : 'pointer'
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

const styles = {
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '464px',
    margin: '0 auto',
    background: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 4px 80px rgba(0, 0, 0, 0.12)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%',
    minHeight: { xs: 'auto', md: '580px' }
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: { xs: '200px', md: '232px' },
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))'
  },
  scholarshipImage: {
    objectFit: 'cover',
    borderRadius: '8px'
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px'
  },
  scholarshipTitle: {
    fontWeight: 600,
    fontSize: { xs: '0.875rem', md: '1rem' },
    lineHeight: { xs: '1.25rem', md: '1.5rem' },
    color: '#070808',
    flex: 1
  },
  tagsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  tag: {
    borderRadius: '40px'
  },
  offeredByContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px'
  },
  offeredBy: {
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: '#444850'
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    width: '100%',
    flex: 1
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  detailLabel: {
    fontWeight: 500,
    fontSize: '0.813rem',
    lineHeight: '1.125rem',
    textAlign: 'center',
    color: '#32353B'
  },
  deadlineValue: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    textAlign: 'center',
    color: '#E00000'
  },
  detailValue: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    textAlign: 'center',
    color: '#070808'
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: '12px',
    marginTop: 'auto'
  },
  applyButton: {
    flex: 1,
    height: '56px',
    background: '#004AE0',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
    '&:hover': {
      background: '#0038B0'
    }
  },
  favoriteButton: ({
    isDisabled,
    isFavorite
  }: {
    isDisabled: boolean;
    isFavorite: boolean;
  }) => ({
    width: '56px',
    height: '56px',
    background: isFavorite
      ? `linear-gradient(0deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), ${COLORS.globalReachGlow}`
      : `linear-gradient(0deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), ${COLORS.primary}`,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    pointerEvents: isDisabled ? 'none' : 'auto',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      background: isDisabled
        ? isFavorite
          ? `linear-gradient(0deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), ${COLORS.globalReachGlow}`
          : `linear-gradient(0deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), ${COLORS.primary}`
        : isFavorite
          ? `linear-gradient(0deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), ${COLORS.globalReachGlow}`
          : `linear-gradient(0deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), ${COLORS.primary}`,
      transform: isDisabled ? 'scale(1)' : 'scale(1.05)'
    },
    '&:active': {
      transform: isDisabled ? 'scale(1)' : 'scale(0.95)'
    }
  }),
  applyButtonText: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    textAlign: 'center',
    color: '#FFFFFF'
  }
};

export default ScholarshipCarouselCard;
