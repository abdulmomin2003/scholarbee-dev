'use client';

import {
  formatAdmissionDeadline,
  formatMoney,
  getPaymentScheduleLabel,
  getProgramDetailPath,
  isDomainAllowed
} from '@/utils/helperFunctions';
import { Box, Typography, Button } from '@mui/material';
import { EllipsisTooltipText } from '@/components/molecules/EllipsisTooltipText';
import Image from 'next/image';
import Link from 'next/link';

import { COLORS } from '@/constants/colors';
import { useMemo, memo, useState, useEffect } from 'react';
import { styles } from './styles';
import { getAuthStatus } from '@/utils/cookieManager';
// import { ProgramCardData } from '@/types/admission-program.types';
import { useFavoriteProgram } from '@/hooks/useFavoriteProgram';
import { useTrackRecommendationEventMutation } from '@/redux/api/programApi';
import ProgramFavoriteButton from './programFavoriteButton';
import { ProgramIntakeSessionBadge } from './IntakeSessionBadge';

const ProgramCard = memo(
  ({
    programCardData,
    isLoading = false,
    onFavoritePage
  }: {
    programCardData: any;
    isLoading?: boolean;
    onFavoritePage?: boolean;
  }) => {
    const {
      handleAddFavoriteProgram,
      isAddingFavoriteProgram,
      isRemovingFavoriteProgram,
      handleRemoveFavoriteProgram
    } = useFavoriteProgram();

    const [trackEvent] = useTrackRecommendationEventMutation();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
    }, []);

    const authStatus = useMemo(() => getAuthStatus(), [mounted]);
    const isLoggedIn = Boolean(
      mounted && authStatus.hasToken && !authStatus.isTokenExpired
    );

    const isProcessingOrRemoving =
      isAddingFavoriteProgram || isRemovingFavoriteProgram;

    const {
      id,
      // slug:÷ docSlug,
      campusId,
      campusImage,
      programTitle,
      universityLogoUrl,
      programTuitionFee,
      programAdmissionDeadline,
      isFavorite,
      payment_schedule,
      status,
      campusName,
      programSlug: programSlugSeg,
      citySlug: citySlugSeg,
      uniSlug: uniSlugSeg,
      universityAbbreviation,
      campusSlug,
      session_term,
      seo_title_key,
      receiving_applications,
      admission_receiving_applications,
      admission_startdate,
      programAdmissionStartDate,
      intakeYear
    } = programCardData;

    const normalizeReceivingApplications = (value: unknown) => {
      if (typeof value === 'string') {
        return value.trim().toLowerCase();
      }
      return value;
    };

    const normalizedProgramReceivingApplications =
      normalizeReceivingApplications(receiving_applications);
    const normalizedAdmissionReceivingApplications =
      normalizeReceivingApplications(admission_receiving_applications);

    const effectiveReceivingApplications =
      normalizedProgramReceivingApplications === 'inherit'
        ? normalizedAdmissionReceivingApplications
        : normalizedProgramReceivingApplications;

    const isNotReceivingApplications =
      effectiveReceivingApplications === false ||
      effectiveReceivingApplications === 'false';
    const isReceivingApplications =
      effectiveReceivingApplications === true ||
      effectiveReceivingApplications === 'true';

    const displayUniversityAbbreviation = universityAbbreviation || '';

    const programUrl = useMemo(() => {
      const seoSegment = seo_title_key?.trim();
      const sessionSegment = session_term?.trim().toLowerCase();
      const citySegment = citySlugSeg?.trim();
      const campusSegment = campusSlug?.trim();

      if (seoSegment && sessionSegment && citySegment && campusSegment) {
        return `/programs/${seoSegment}/${citySegment}/${campusSegment}?session=${sessionSegment}-${intakeYear?.toString()?.trim()?.toLowerCase() ?? ''}`;
      }

      return getProgramDetailPath({
        programSlug: programSlugSeg ?? '',
        citySlug: citySegment ?? '',
        uniSlug: uniSlugSeg ?? '',
        sessionSegment: sessionSegment ?? '',
        sessionYear: intakeYear?.toString()?.trim()?.toLowerCase() ?? ''
      });
    }, [
      seo_title_key,
      session_term,
      citySlugSeg,
      campusSlug,
      programSlugSeg,
      uniSlugSeg,
      intakeYear
    ]);

    // const programUrl = useMemo(() => {
    //   if (!programSlugSeg || !citySlugSeg || !campusSlug || !session_term)
    //     return undefined;
    //   const path = getProgramDetailPath({
    //     programSlug: programSlugSeg,
    //     citySlug: citySlugSeg.toLowerCase(),
    //     uniSlug: `${campusSlug}-${session_term?.toLowerCase()}`
    //   });
    //   if (docSlug?.trim()) {
    //     return `${path}`;
    //   }
    //   return path;
    // }, [programSlugSeg, citySlugSeg, campusSlug, session_term, docSlug]);

    const chatHref = campusId
      ? `/chat?campusId=${encodeURIComponent(campusId)}`
      : '/chat';

    const isProgramFavorite = onFavoritePage ?? isFavorite;
    const { formattedDate } = formatAdmissionDeadline(
      programAdmissionDeadline || ''
    );

    const parseValidDate = (value?: string) => {
      if (!value) return null;
      const parsedDate = new Date(value);
      return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    // Determine status text and color.
    // Status rules (driven by receiving_applications, then dates):
    //   RA = false  -> 'Opening Soon' (start date in future)
    //                  'Not Accepting Applications' (no/past start date)
    //   RA = true   -> 'Closed' (deadline passed)
    //                  'Closing Soon' (deadline within 10 days)
    //                  'Open' (deadline in future or no deadline)
    // 'Closed' must NEVER apply when RA = false.
    const statusLabel = useMemo(() => {
      const now = new Date();
      const admissionEndDate = parseValidDate(programAdmissionDeadline);
      const admissionStartDate = parseValidDate(
        programAdmissionStartDate || admission_startdate
      );

      if (isNotReceivingApplications) {
        if (admissionStartDate && admissionStartDate >= now) {
          return 'Opening Soon';
        }
        return 'Not Accepting Applications';
      }

      if (isReceivingApplications) {
        if (admissionEndDate && admissionEndDate < now) return 'Closed';
        if (admissionEndDate) {
          const daysUntilDeadline =
            (admissionEndDate.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24);
          if (daysUntilDeadline >= 0 && daysUntilDeadline <= 10) {
            return 'Closing Soon';
          }
        }
        return 'Open';
      }

      // RA unknown – fall back to server-provided status string.
      if (admissionEndDate && admissionEndDate < now) return 'Closed';
      const lowerStatus = status?.toLowerCase() || '';
      if (lowerStatus.includes('open')) return 'Open';
      if (lowerStatus.includes('closing')) return 'Closing Soon';
      if (lowerStatus.includes('upcoming') || lowerStatus.includes('starting'))
        return 'Opening Soon';
      if (lowerStatus.includes('closed')) return 'Closed';

      return 'Not Accepting Applications';
    }, [
      status,
      programAdmissionDeadline,
      programAdmissionStartDate,
      admission_startdate,
      isNotReceivingApplications,
      isReceivingApplications
    ]);

    const statusColor = useMemo(() => {
      if (statusLabel === 'Open') return COLORS.statusOpen;
      if (statusLabel === 'Closed') return COLORS.statusClosed;
      if (statusLabel === 'Closing Soon') return COLORS.statusClosingSoon;
      if (statusLabel === 'Opening Soon') return COLORS.statusOpeningSoon;
      return COLORS.statusNotAccepting;
    }, [statusLabel]);

    return (
      <Box sx={styles.container(isProcessingOrRemoving || isLoading)}>
        <Box sx={styles.card}>
          {/* Image Section */}
          <Box sx={styles.imageGridContainer}>
            <Box sx={styles.imageOverlay} />
            <Box sx={styles.programImageWrapper}>
              <Image
                src={
                  isDomainAllowed(campusImage)
                    ? campusImage
                    : '/assets/png/university_placeholder.png'
                }
                alt="campus"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </Box>

            <ProgramIntakeSessionBadge
              label={`${session_term?.trim() ?? ''} ${intakeYear?.toString()?.trim() ?? ''}`}
            />

            {/* Image Badge */}
            {/* {badgeInfo && (
              <Box sx={styles.imageBadge(badgeInfo.type)}>
                <Box
                  sx={{
                    position: 'relative',
                    width: 14,
                    height: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Image
                    src={badgeInfo.icon}
                    alt={badgeInfo.type}
                    width={badgeInfo.type === 'closed' ? 16 : 14}
                    height={badgeInfo.type === 'closed' ? 16 : 14}
                  />
                </Box>
                <Typography>{badgeInfo.label}</Typography>
              </Box>
            )} */}
            {/* University Logo on Image */}
            <Box sx={styles.universityLogoOnImageWrapper}>
              <Image
                src={
                  isDomainAllowed(universityLogoUrl)
                    ? universityLogoUrl
                    : '/assets/png/university_placeholder.png'
                }
                alt="university logo"
                fill
                style={{ objectFit: 'contain' }}
              />
            </Box>
            {displayUniversityAbbreviation && (
              <Typography sx={styles.universityTextOnImage}>
                {displayUniversityAbbreviation}
              </Typography>
            )}
          </Box>

          {/* Content Section */}
          <Box sx={styles.cardDetails}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                width: '100%'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  flexGrow: 1
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    width: '100%',
                    minWidth: 0,
                    overflow: 'hidden'
                  }}
                >
                  <EllipsisTooltipText
                    tooltipTitle={programTitle ?? ''}
                    variant="h3"
                    sx={{
                      ...styles.title,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block' // Override the webkit-box for manual flex handling
                    }}
                  >
                    {(() => {
                      const match = programTitle?.match(/\s*(\([^)]+\))$/);
                      return match
                        ? programTitle.slice(0, match.index).trim()
                        : programTitle;
                    })()}
                  </EllipsisTooltipText>
                  {(() => {
                    const match = programTitle?.match(/\s*(\([^)]+\))$/);
                    return match ? (
                      <Typography
                        variant="h3"
                        sx={{
                          ...styles.title,
                          flexShrink: 0,
                          ml: 0.5,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {match[1]}
                      </Typography>
                    ) : null;
                  })()}
                </Box>
                <Typography sx={styles.universityName}>
                  {campusName || ''}
                </Typography>
              </Box>

              {/* Mobile Favorite Button */}
              {isLoggedIn && (
                <Box sx={styles.favoriteButtonContainerMobile}>
                  <ProgramFavoriteButton
                    programId={id ?? ''}
                    isFavorite={isProgramFavorite}
                    addProgramToFavorite={handleAddFavoriteProgram}
                    removeProgramFromFavorite={handleRemoveFavoriteProgram}
                    isAddingToFavorite={isAddingFavoriteProgram}
                    isRemovingFromFavorite={isRemovingFavoriteProgram}
                    isProcessingOrRemoving={isProcessingOrRemoving || isLoading}
                  />
                  <Typography sx={styles.favoriteText}>Favorite</Typography>
                </Box>
              )}
            </Box>

            {/* Program Details row */}
            <Box sx={styles.programDetails}>
              <Box
                sx={{
                  ...styles.detailItem,
                  gridColumn: { xs: 1, lg: 'auto' },
                  gridRow: { xs: 1, lg: 'auto' }
                }}
              >
                <Image
                  src="/assets/svg/location.svg"
                  alt="location"
                  width={20}
                  height={20}
                />
                <Box sx={styles.detailText}>
                  <Typography
                    sx={{ ...styles.detailLabel, textTransform: 'capitalize' }}
                  >
                    {citySlugSeg || 'City'}
                  </Typography>
                  <Typography sx={styles.detailValue()}>Pakistan</Typography>
                </Box>
              </Box>

              {!isNotReceivingApplications && (
                <>
                  <Box
                    sx={{
                      ...styles.verticalDivider,
                      gridColumn: { xs: 2, lg: 'auto' },
                      gridRow: { xs: 1, lg: 'auto' },
                      ml: { xs: '16px', lg: 0 },
                      mr: { xs: '23px', lg: 0 }
                    }}
                  />

                  <Box
                    sx={{
                      ...styles.detailItem,
                      gridColumn: { xs: 3, lg: 'auto' },
                      gridRow: { xs: 1, lg: 'auto' }
                    }}
                  >
                    <Image
                      src="/assets/svg/calendar-primary.svg"
                      alt="deadline"
                      width={20}
                      height={20}
                    />
                    <Box sx={styles.detailText}>
                      <Typography sx={styles.detailLabel}>Deadline</Typography>
                      <Typography sx={styles.detailValue(COLORS.primary)}>
                        {formattedDate || 'Coming Soon'}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}

              <Box
                sx={{
                  ...styles.verticalDivider,
                  gridColumn: { xs: 2, lg: 'auto' },
                  gridRow: { xs: 2, lg: 'auto' },
                  ml: { xs: '16px', lg: 0 },
                  mr: { xs: '23px', lg: 0 }
                }}
              />

              <Box
                sx={{
                  ...styles.detailItem,
                  gridColumn: { xs: 1, lg: 'auto' },
                  gridRow: { xs: 2, lg: 'auto' }
                }}
              >
                <Image
                  src="/assets/svg/dollar-circle.svg"
                  alt="fee"
                  width={20}
                  height={20}
                />
                <Box sx={styles.detailText}>
                  <Typography sx={styles.detailLabel}>
                    {`Fee (${getPaymentScheduleLabel(payment_schedule)})`}
                  </Typography>
                  <Typography sx={styles.detailValue()}>
                    {programTuitionFee
                      ? formatMoney(programTuitionFee)
                      : 'PKR 0'}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  ...styles.verticalDivider,
                  display: { xs: 'none', lg: 'block' }
                }}
              />

              <Box
                sx={{
                  ...styles.detailItem,
                  gridColumn: { xs: 3, lg: 'auto' },
                  gridRow: { xs: 2, lg: 'auto' }
                }}
              >
                <Image
                  src="/assets/svg/teacher.svg"
                  alt="admission"
                  width={20}
                  height={20}
                />
                <Box sx={styles.detailText}>
                  <Typography sx={styles.detailLabel}>Admission</Typography>
                  <Typography sx={styles.detailValue(statusColor)}>
                    {statusLabel}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={styles.buttonContainer}>
              <Button
                component={Link}
                href={programUrl || '#'}
                prefetch
                variant="contained"
                sx={styles.primaryButton}
                disableElevation
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
                Let&apos;s Explore
              </Button>
              <Button
                component={Link}
                href={chatHref}
                variant="outlined"
                startIcon={
                  <Image
                    src="/assets/svg/message-icon.svg"
                    alt="chat"
                    width={24}
                    height={24}
                  />
                }
                sx={styles.secondaryButton}
              >
                <Box
                  component="span"
                  sx={{ display: { xs: 'inline', lg: 'none' } }}
                >
                  Chat
                </Box>
                <Box
                  component="span"
                  sx={{ display: { xs: 'none', lg: 'inline' } }}
                >
                  Chat with University
                </Box>
              </Button>
            </Box>
          </Box>

          {/* Favorite Section Desktop */}
          {isLoggedIn && (
            <Box sx={styles.favoriteButtonContainerDesktop}>
              <ProgramFavoriteButton
                programId={id ?? ''}
                isFavorite={isProgramFavorite}
                addProgramToFavorite={handleAddFavoriteProgram}
                removeProgramFromFavorite={handleRemoveFavoriteProgram}
                isAddingToFavorite={isAddingFavoriteProgram}
                isRemovingFromFavorite={isRemovingFavoriteProgram}
                isProcessingOrRemoving={isProcessingOrRemoving || isLoading}
              />
              <Typography sx={styles.favoriteText}>Favorite</Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
  (prevProps, nextProps) => {
    const prevCard = prevProps.programCardData;
    const nextCard = nextProps.programCardData;

    return (
      prevCard.id === nextCard.id &&
      prevCard.isFavorite === nextCard.isFavorite &&
      prevCard.programSlug === nextCard.programSlug &&
      prevCard.citySlug === nextCard.citySlug &&
      prevCard.uniSlug === nextCard.uniSlug &&
      prevCard.campusSlug === nextCard.campusSlug &&
      prevCard.session_term === nextCard.session_term &&
      prevCard.intakeYear === nextCard.intakeYear &&
      prevCard.admission_startdate === nextCard.admission_startdate &&
      prevCard.programAdmissionStartDate ===
        nextCard.programAdmissionStartDate &&
      prevCard.programAdmissionDeadline === nextCard.programAdmissionDeadline &&
      prevCard.seo_title_key === nextCard.seo_title_key &&
      prevCard.universityAbbreviation === nextCard.universityAbbreviation &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.onFavoritePage === nextProps.onFavoritePage
    );
  }
);

ProgramCard.displayName = 'ProgramCard';

export default ProgramCard;
