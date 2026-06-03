import React from 'react';
import { Box, Typography } from '@mui/material';
import { EllipsisTooltipText } from '@/components/molecules/EllipsisTooltipText';
import Image from 'next/image';
import Link from 'next/link';
import {
  formatAdmissionDeadline,
  formatMoney,
  getPaymentScheduleLabel,
  // getProgramDetailPath,
  isDomainAllowed
  // toUrlSlug
} from '@/utils/helperFunctions';
import { ElasticsearchAdmissionProgramDocument } from '@/types/admission-program.types';
import { ProgramIntakeSessionBadge } from '@/app/(pageComponents)/programCard/IntakeSessionBadge';

/** Server-rendered program card for SEO. No client state (e.g. favorite). */
export default function ProgramCardServer({
  program
}: {
  program: ElasticsearchAdmissionProgramDocument;
}) {
  const {
    program_title,
    study_mode,
    first_semester_fee,
    payment_schedule,
    admission_startdate,
    admission_enddate,
    campus_image,
    university_logo,
    location_details,
    university_name,
    // university_slug,
    campus_slug,
    // slug: docSlug,
    // degree_level,
    // major,
    session_term: intake_period,
    seo_title_key,
    receiving_applications,
    university_abbreviation,
    session_year
  } = program;

  const isNotAccepting =
    receiving_applications === 'false' || receiving_applications === false;
  const hasStartDate = Boolean(admission_startdate);
  const hasEndDate = Boolean(admission_enddate);
  // Hide dates only when not receiving applications AND neither
  // start nor end date is available.
  const shouldHideDates = isNotAccepting && !hasStartDate && !hasEndDate;

  const detailsUrl = `/programs/${seo_title_key}/${location_details?.city?.toLowerCase() ?? ''}/${campus_slug}?session=${intake_period?.toLowerCase() ?? ''}-${session_year?.toString()?.trim()?.toLowerCase() ?? ''}`;

  // const programSlugSeg = `${seo_title_key}-${intake_period?.toLowerCase()}`;
  // const citySlugSeg = location_details?.city.toLowerCase() ?? '';
  // const uniSlugSeg = campus_slug ?? '';
  // const path =
  //   programSlugSeg && citySlugSeg && uniSlugSeg
  //     ? getProgramDetailPath({
  //         programSlug: programSlugSeg,
  //         citySlug: citySlugSeg,
  //         uniSlug: uniSlugSeg
  //       })
  //     : undefined;
  // const programUrl =
  //   path && docSlug?.trim()
  //     ? `${path}?slug=${encodeURIComponent(docSlug.trim())}`
  //     : path;
  const campusAddress =
    `${location_details?.city ?? ''}, ${location_details?.country ?? ''}`.trim() ||
    'N/A';
  const { formattedDate, hasPassed } = formatAdmissionDeadline(
    admission_enddate || ''
  );
  const feeLabel = `Fee (${getPaymentScheduleLabel(payment_schedule)})`;

  const shortUniName = () => {
    if (university_abbreviation) return university_abbreviation;
    return '';
  };

  return (
    <Box sx={cardStyles.card}>
      <Box sx={cardStyles.imageContainer}>
        <Image
          src={
            isDomainAllowed(campus_image)
              ? campus_image
              : '/assets/png/university_placeholder.png'
          }
          alt={program_title || 'Program'}
          fill
          style={{ objectFit: 'cover', borderRadius: '8px' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <ProgramIntakeSessionBadge
          label={`${intake_period?.trim() ?? ''} ${session_year?.toString()?.trim() ?? ''}`}
        />
        {shortUniName() && (
          <Typography sx={cardStyles.universityTextOnImage}>
            {shortUniName()}
          </Typography>
        )}
      </Box>
      <Box sx={{ ...cardStyles.titleRow, minWidth: 0 }}>
        <EllipsisTooltipText
          tooltipTitle={program_title ?? ''}
          variant="h6"
          sx={{
            ...cardStyles.programTitle,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0
          }}
        >
          {program_title}
        </EllipsisTooltipText>
      </Box>
      <Box sx={cardStyles.universityInfo}>
        <Box sx={cardStyles.universityRow}>
          <Image
            src={
              isDomainAllowed(university_logo)
                ? university_logo
                : '/assets/png/university_placeholder.png'
            }
            alt={university_name || 'University'}
            width={24}
            height={24}
            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
          />
          <Typography variant="body2" sx={cardStyles.universityName}>
            {university_name || ''}
          </Typography>
        </Box>
        <Box sx={cardStyles.locationRow}>
          <Image
            src="/assets/svg/location.svg"
            alt=""
            width={24}
            height={24}
            style={{ width: '24px', height: '24px' }}
          />
          <Typography variant="body2" sx={cardStyles.locationText}>
            {campusAddress}
          </Typography>
        </Box>
      </Box>
      <Box sx={cardStyles.programDetails}>
        {!shouldHideDates && (
          <Box sx={cardStyles.detailRow}>
            <Typography variant="body2" sx={cardStyles.detailLabel}>
              Deadline:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                ...cardStyles.detailValue,
                color: hasPassed ? '#E00000' : '#070808'
              }}
            >
              {formattedDate || 'Coming Soon'}
            </Typography>
          </Box>
        )}
        <Box sx={cardStyles.detailRow}>
          <Typography variant="body2" sx={cardStyles.detailLabel}>
            {feeLabel}:
          </Typography>
          <Typography variant="body2" sx={cardStyles.detailValue}>
            {first_semester_fee
              ? formatMoney(first_semester_fee)
              : 'Will Update Soon'}
          </Typography>
        </Box>
        <Box sx={cardStyles.detailRow}>
          <Typography variant="body2" sx={cardStyles.detailLabel}>
            Study Mode:
          </Typography>
          <Typography variant="body2" sx={cardStyles.detailValue}>
            {study_mode || 'N/A'}
          </Typography>
        </Box>
      </Box>
      <Box sx={cardStyles.actionButtons}>
        {detailsUrl && !isNotAccepting ? (
          <Link
            href={detailsUrl}
            prefetch
            style={{ textDecoration: 'none', flex: 1 }}
          >
            <Box sx={cardStyles.applyButton} component="span">
              <Typography variant="body2" sx={cardStyles.applyButtonText}>
                Apply Now
              </Typography>
            </Box>
          </Link>
        ) : (
          <Box
            sx={{
              ...cardStyles.applyButton,
              opacity: 0.6,
              cursor: 'not-allowed'
            }}
            component="span"
          >
            <Typography variant="body2" sx={cardStyles.applyButtonText}>
              Apply Now
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

const cardStyles = {
  card: {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '464px',
    margin: '0 auto',
    background: '#FFFFFF',
    boxShadow: '0px 4px 80px rgba(0, 0, 0, 0.12)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    height: '100%',
    minHeight: { xs: 'auto', md: '580px' }
  },
  imageContainer: {
    position: 'relative' as const,
    width: '100%',
    height: { xs: '200px', md: '232px' },
    borderRadius: '8px',
    overflow: 'hidden' as const,
    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))'
  },
  universityTextOnImage: {
    position: 'absolute' as const,
    bottom: '26px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: '24px',
    lineHeight: '30px',
    textAlign: 'center' as const,
    color: 'white' as const,
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)',
    zIndex: 2
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px'
  },
  programTitle: {
    fontWeight: 600,
    fontSize: { xs: '0.875rem', md: '1rem' },
    lineHeight: { xs: '1.25rem', md: '1.5rem' },
    color: '#070808',
    flex: 1
  },
  universityInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '12px'
  },
  universityRow: {
    display: 'flex',
    flexDirection: 'row' as const,
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
    flexDirection: 'row' as const,
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
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '8px',
    width: '100%',
    flex: 1
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row' as const,
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
  detailValue: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    textAlign: 'center',
    color: '#070808'
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'row' as const,
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
    transition: 'background-color 0.2s ease-in-out'
  },
  applyButtonText: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    textAlign: 'center',
    color: '#FFFFFF'
  }
};
