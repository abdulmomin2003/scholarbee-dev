'use client';
import {
  formatAdmissionDeadline,
  formatMoney,
  getPaymentScheduleLabel,
  getProgramDetailPath,
  isDomainAllowed
} from '@/utils/helperFunctions';
import { Box, Button, Typography } from '@mui/material';
import { EllipsisTooltipText } from '@/components/molecules/EllipsisTooltipText';
import Image from 'next/image';
import Link from 'next/link';

import { COLORS } from '@/constants/colors';
import { useState, useEffect, useMemo } from 'react';
import { ProgramCardData } from '@/types/admission-program.types';
import { styles } from '../(pageComponents)/programCard/styles';
import { ProgramIntakeSessionBadge } from '../(pageComponents)/programCard/IntakeSessionBadge';
import { getAuthStatus } from '@/utils/cookieManager';
import FavoriteButtonClient from './FavoriteButtonClient';

const ProgramCardServer = ({
  programCardData,
  isLoading = false
}: {
  programCardData: ProgramCardData;
  isLoading?: boolean;
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const authStatus = useMemo(() => getAuthStatus(), [mounted]);
  const isLoggedIn = Boolean(
    mounted && authStatus.hasToken && !authStatus.isTokenExpired
  );

  const isProcessingOrRemoving = false;

  const {
    slug: docSlug,
    campusId,
    campusImage,
    programTitle,
    universityLogoUrl,
    programTuitionFee,
    programAdmissionDeadline,
    programAdmissionStartDate,
    admission_startdate,
    payment_schedule,
    status,
    campusName,
    universityName,
    programSlug: programSlugSeg,
    citySlug: citySlugSeg,
    uniSlug: uniSlugSeg,
    universityAbbreviation,
    receiving_applications,
    session_term,
    session_year
  } = programCardData;

  const isNotReceivingApplications =
    receiving_applications === 'false' || receiving_applications === false;
  const hasStartDate = Boolean(
    programAdmissionStartDate || admission_startdate
  );
  const hasEndDate = Boolean(programAdmissionDeadline);
  // Hide dates only when not receiving applications AND neither
  // start nor end date is available.
  const shouldHideDates =
    isNotReceivingApplications && !hasStartDate && !hasEndDate;

  const programUrl = (() => {
    if (!programSlugSeg || !citySlugSeg || !uniSlugSeg) return undefined;
    const path = getProgramDetailPath({
      programSlug: programSlugSeg,
      citySlug: citySlugSeg.toLowerCase(),
      uniSlug: uniSlugSeg,
      sessionSegment: session_term?.toLowerCase() ?? '',
      sessionYear: session_year?.toString()?.trim()?.toLowerCase() ?? ''
    });
    if (docSlug?.trim()) {
      return `${path}?slug=${encodeURIComponent(docSlug.trim())}`;
    }
    return path;
  })();

  const chatHref = campusId
    ? `/chat?campusId=${encodeURIComponent(campusId)}`
    : '/chat';

  const { formattedDate, hasPassed } = formatAdmissionDeadline(
    programAdmissionDeadline || ''
  );

  const shortUniName = () => {
    if (universityAbbreviation) return universityAbbreviation;
    return '';
  };

  // Determine status text and color
  const statusLabel = useMemo(() => {
    if (receiving_applications === 'false' || receiving_applications === false)
      return 'Not Accepting Applications';

    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus.includes('open')) return 'Open';
    if (lowerStatus.includes('closing')) return 'Closing Soon';
    if (lowerStatus.includes('upcoming') || lowerStatus.includes('starting'))
      return 'Opening Soon';
    if (lowerStatus.includes('closed')) return 'Closed';

    return hasPassed ? 'Closed' : 'Open';
  }, [status, hasPassed, receiving_applications]);

  const statusColor = useMemo(() => {
    if (statusLabel === 'Open') return COLORS.statusOpen;
    if (statusLabel === 'Closed') return COLORS.statusClosed;
    if (statusLabel === 'Closing Soon') return COLORS.statusClosingSoon;
    if (statusLabel === 'Opening Soon') return COLORS.statusOpeningSoon;
    return COLORS.statusNotAccepting;
  }, [statusLabel]);

  // }, [statusLabel]);

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
            label={`${session_term?.trim() ?? ''} ${session_year?.toString()?.trim() ?? ''}`}
          />

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
          {shortUniName() && (
            <Typography sx={styles.universityTextOnImage}>
              {shortUniName()}
            </Typography>
          )}
        </Box>

        {/* Content Section */}
        <Box sx={styles.cardDetails}>
          {programCardData.ml_score !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, backgroundColor: '#f0f9ff', padding: '4px 8px', borderRadius: '4px', width: 'fit-content', border: '1px solid #bae6fd' }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#0369a1' }}>
                ✨ AI Match Score: {(programCardData.ml_score * 100).toFixed(1)}%
              </Typography>
            </Box>
          )}
          <EllipsisTooltipText
            tooltipTitle={programTitle}
            variant="h3"
            sx={{
              ...styles.title,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block'
            }}
          >
            {programTitle}
          </EllipsisTooltipText>
          <Typography sx={styles.universityName}>
            {campusName || universityName || ''}
          </Typography>

          {/* Program Details row */}
          <Box sx={styles.programDetails}>
            <Box sx={styles.detailItem}>
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

            {!shouldHideDates && (
              <>
                <Box sx={styles.verticalDivider} />

                <Box sx={styles.detailItem}>
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

            <Box sx={styles.verticalDivider} />

            <Box sx={styles.detailItem}>
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
                  {programTuitionFee ? formatMoney(programTuitionFee) : 'PKR 0'}
                </Typography>
              </Box>
            </Box>

            <Box sx={styles.verticalDivider} />

            <Box sx={styles.detailItem}>
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
              Chat with University
            </Button>
          </Box>
        </Box>

        {/* Favorite Section */}
        {isLoggedIn && (
          <Box sx={styles.favoriteButtonContainerDesktop}>
            <FavoriteButtonClient
              programId={programCardData.id ?? ''}
              isFavorite={programCardData.isFavorite}
            />
            <Typography sx={styles.favoriteText}>Favorite</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProgramCardServer;
