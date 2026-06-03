'use client';
import {
  formatAdmissionDeadline,
  formatMoney,
  getPaymentScheduleLabel,
  // getProgramDetailPath,
  isDomainAllowed
} from '@/utils/helperFunctions';
import { Box, Typography } from '@mui/material';
import { EllipsisTooltipText } from '@/components/molecules/EllipsisTooltipText';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
// import { ProgramCardData } from '@/types/admission-program.types';
import { useFavoriteProgram } from '@/hooks/useFavoriteProgram';
import { useTrackRecommendationEventMutation } from '@/redux/api/programApi';
import Cookies from 'js-cookie';
import { styles as programCardStyles } from './programCard/styles';
import { ProgramIntakeSessionBadge } from './programCard/IntakeSessionBadge';

// interface ProgramCarouselCardData extends ProgramCardData {
//   badge?: string | null;
//   badgeColor?: { bg: string; text: string } | null;
// }

const ProgramCarouselCard = ({ programCardData }: { programCardData: any }) => {
  const {
    id,
    // slug: docSlug,
    campusImage,
    programTitle,
    universityLogoUrl,
    campusName,
    // universityName,
    campusAddress,
    programTuitionFee,
    modeOfStudy,
    programAdmissionDeadline,
    badge,
    badgeColor,
    isFavorite,
    // programSlug: programSlugSeg,
    // citySlug: citySlugSeg,
    // uniSlug: uniSlugSeg,
    payment_schedule,
    receiving_applications,
    detailsUrl,
    session_term,
    intakeYear
  } = programCardData;

  // const isNotAccepting =
  //   receiving_applications === 'false' || receiving_applications === false;

  // Get user authentication state
  const userId = Cookies.get('userId') ?? null;
  const isLoggedIn = !!userId;

  // Track click/view recommendation event
  const [trackEvent] = useTrackRecommendationEventMutation();

  // Favorite functionality
  const {
    handleAddFavoriteProgram,
    isAddingFavoriteProgram,
    handleRemoveFavoriteProgram,
    isRemovingFavoriteProgram
  } = useFavoriteProgram();

  const isProcessingFavorite =
    isAddingFavoriteProgram || isRemovingFavoriteProgram;

  // Optimistic favorite state
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorite);

  // Sync optimistic state if prop changes
  useEffect(() => {
    setOptimisticFavorite(isFavorite);
  }, [isFavorite]);

  // const programUrl = useMemo(() => {
  //   if (!programSlugSeg || !citySlugSeg || !uniSlugSeg) return undefined;
  //   const path = getProgramDetailPath({
  //     programSlug: programSlugSeg,
  //     citySlug: citySlugSeg,
  //     uniSlug: uniSlugSeg
  //   });
  //   // if (docSlug?.trim()) {
  //   //   return `${path}`;
  //   // }
  //   return path;
  // }, [programSlugSeg, citySlugSeg, uniSlugSeg]);

  const { formattedDate, hasPassed } = formatAdmissionDeadline(
    programAdmissionDeadline || ''
  );

  return (
    <Box sx={styles.card}>
      {/* Badge */}
      {badge && badgeColor && (
        <Box
          sx={{
            ...styles.badge,
            background: badgeColor.bg,
            color: badgeColor.text
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            {badge}
          </Typography>
        </Box>
      )}

      {/* Program Image */}
      <Box sx={styles.imageContainer}>
        <Image
          src={
            isDomainAllowed(campusImage)
              ? campusImage
              : '/assets/png/university_placeholder.png'
          }
          alt="programImage"
          fill
          style={styles.programImage as React.CSSProperties}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
        <ProgramIntakeSessionBadge
          label={`${session_term?.trim()} ${intakeYear?.toString().trim()}`}
        />
      </Box>

      {/* Program Title and Rating */}
      <Box sx={styles.titleRow}>
        <EllipsisTooltipText
          tooltipTitle={programTitle ?? ''}
          variant="h6"
          sx={styles.programTitle}
        >
          {programTitle}
        </EllipsisTooltipText>
        {/* Rating commented out for now */}
        {/* <Box sx={styles.ratingContainer}>
          <Image
            src="/assets/svg/star.svg"
            alt="star"
            width={24}
            height={24}
            style={{ width: '24px', height: '24px' }}
          />
          <Typography sx={styles.rating}>4</Typography>
        </Box> */}
      </Box>

      {/* University and Location */}
      <Box sx={styles.universityInfo}>
        <Box sx={styles.universityRow}>
          <Image
            src={
              isDomainAllowed(universityLogoUrl)
                ? universityLogoUrl
                : '/assets/png/university_placeholder.png'
            }
            alt="university logo"
            width={24}
            height={24}
            style={{
              width: '24px',
              height: '24px',
              objectFit: 'contain'
            }}
          />
          <Typography variant="body2" sx={styles.universityName}>
            {campusName || 'Campus'}
          </Typography>
        </Box>
        <Box sx={styles.locationRow}>
          <Image
            src="/assets/svg/location.svg"
            alt="location"
            width={24}
            height={24}
            style={{ width: '24px', height: '24px' }}
          />
          <Typography variant="body2" sx={styles.locationText}>
            {campusAddress}
          </Typography>
        </Box>
      </Box>

      {/* Program Details */}
      <Box sx={styles.programDetails}>
        {receiving_applications !== 'false' &&
          receiving_applications !== false && (
            <Box sx={styles.detailRow}>
              <Typography variant="body2" sx={styles.detailLabel}>
                Deadline:
              </Typography>
              <Typography variant="body2" sx={styles.detailValue(hasPassed)}>
                {formattedDate || 'Coming Soon'}
              </Typography>
            </Box>
          )}
        <Box sx={styles.detailRow}>
          <Typography variant="body2" sx={styles.detailLabel}>
            Fee ({getPaymentScheduleLabel(payment_schedule)}):
          </Typography>
          <Typography variant="body2" sx={styles.detailValue(false)}>
            {programTuitionFee
              ? formatMoney(programTuitionFee)
              : 'Will Update Soon'}
          </Typography>
        </Box>
        <Box sx={styles.detailRow}>
          <Typography variant="body2" sx={styles.detailLabel}>
            Study Mode:
          </Typography>
          <Typography variant="body2" sx={styles.detailValue(false)}>
            {modeOfStudy || 'N/A'}
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={styles.actionButtons}>
        {/* {detailsUrl && !isNotAccepting ? ( */}
        {detailsUrl ? (
          <Link
            href={detailsUrl}
            prefetch
            style={{ textDecoration: 'none', flex: 1 }}
            onClick={() => {
              if (id) {
                trackEvent({
                  event_type: 'click',
                  resource_type: 'admission_program',
                  resource_id: id,
                  metadata: { clicked_at: new Date().toISOString() }
                }).catch((err: any) => console.error('Failed to track click event:', err));
              }
            }}
          >
            <Box sx={styles.applyButton}>
              <Typography variant="body2" sx={styles.applyButtonText}>
                Let&apos;s Explore
              </Typography>
            </Box>
          </Link>
        ) : (
          <Box
            sx={{
              ...styles.applyButton,
              opacity: 0.6,
              cursor: 'not-allowed'
            }}
            aria-disabled="true"
          >
            <Typography variant="body2" sx={styles.applyButtonText}>
              Apply Now
            </Typography>
          </Box>
        )}
        {isLoggedIn && id && (
          <Box
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isProcessingFavorite || !id) return;

              const previousFavorite = optimisticFavorite;
              // Optimistic update
              setOptimisticFavorite(!previousFavorite);

              try {
                if (previousFavorite) {
                  await handleRemoveFavoriteProgram(id);
                } else {
                  await handleAddFavoriteProgram(id);
                }
              } catch (error) {
                // Revert optimistic update on error
                setOptimisticFavorite(previousFavorite);
                console.error('Error toggling program favorite:', error);
              }
            }}
            sx={programCardStyles.favoriteButton({
              isDisabled: isProcessingFavorite,
              isFavorite: Boolean(optimisticFavorite)
            })}
          >
            <Image
              src={`/assets/svg/${optimisticFavorite ? 'heart-red' : 'heart-outlined'}.svg`}
              alt="favorite"
              width={24}
              height={24}
              style={programCardStyles.favoriteIcon(isProcessingFavorite)}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProgramCarouselCard;

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
  badge: {
    position: 'absolute',
    left: '0px',
    top: '37px',
    padding: '6px 12px',
    borderRadius: '0px',
    zIndex: 1
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: { xs: '200px', md: '232px' },
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))'
  },
  programImage: {
    objectFit: 'cover',
    borderRadius: '8px'
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
    minWidth: 0
  },
  programTitle: {
    fontWeight: 600,
    fontSize: { xs: '0.875rem', md: '1rem' },
    lineHeight: { xs: '1.25rem', md: '1.5rem' },
    color: '#070808',
    flex: 1
  },
  ratingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px'
  },
  rating: {
    fontFamily: "'Inter', sans-serif",
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: '18px',
    lineHeight: '24px',
    color: '#252525'
  },
  universityInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px'
  },
  universityRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px'
  },
  universityName: {
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: '#444850'
  },
  locationRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px'
  },
  locationText: {
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: '#444850'
  },
  programDetails: {
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
  detailValue: (isError: boolean) => ({
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    textAlign: 'center',
    color: isError ? '#E00000' : '#070808'
  }),
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
  applyButtonText: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    textAlign: 'center',
    color: '#FFFFFF'
  }
};
