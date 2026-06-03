import React from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { Scholarship } from '@/types/scholarship';
import {
  formatAdmissionDeadline,
  isDomainAllowed
} from '@/utils/helperFunctions';

export default function ScholarshipCardServer({
  scholarship
}: {
  scholarship: Scholarship;
}) {
  const { formattedDate } = formatAdmissionDeadline(
    scholarship?.application_deadline || ''
  );

  const scholarshipId = scholarship?._id;
  const scholarshipUrl = scholarshipId
    ? `/scholarship-details/${scholarshipId}`
    : undefined;

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

  const feeText = scholarship?.amount
    ? `PKR ${scholarship.amount.toLocaleString('en-US')}`
    : 'Not Disclosed';

  const scholarshipType = scholarship?.scholarship_type || '';

  return (
    <Box sx={cardStyles.card}>
      <Box sx={cardStyles.imageContainer}>
        <Image
          src={displayImage}
          alt={scholarship?.scholarship_name || 'Scholarship'}
          fill
          style={{ objectFit: 'cover', borderRadius: '8px' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
      </Box>

      <Box sx={cardStyles.titleRow}>
        <Typography component="h3" variant="h6" sx={cardStyles.title}>
          {scholarship?.scholarship_name || 'Scholarship Name'}
        </Typography>
      </Box>

      {scholarshipType && (
        <Box sx={cardStyles.tag}>
          <Typography variant="body2" sx={cardStyles.tagText}>
            {scholarshipType}
          </Typography>
        </Box>
      )}

      {offeredByText && (
        <Typography variant="body2" sx={cardStyles.offeredBy}>
          {offeredByText}
        </Typography>
      )}

      <Box sx={cardStyles.detailsContainer}>
        <Box sx={cardStyles.detailRow}>
          <Typography variant="body2" sx={cardStyles.detailLabel}>
            Deadline:
          </Typography>
          <Typography variant="body2" sx={cardStyles.deadlineValue}>
            {formattedDate || 'TBA'}
          </Typography>
        </Box>
        <Box sx={cardStyles.detailRow}>
          <Typography variant="body2" sx={cardStyles.detailLabel}>
            Amount:
          </Typography>
          <Typography variant="body2" sx={cardStyles.detailValue}>
            {feeText}
          </Typography>
        </Box>
      </Box>

      {scholarshipUrl && (
        <Box sx={cardStyles.actionButtons}>
          <Link
            href={scholarshipUrl}
            style={{ textDecoration: 'none', flex: 1 }}
          >
            <Box sx={cardStyles.viewButton}>
              <Typography variant="body2" sx={cardStyles.viewButtonText}>
                View Scholarship
              </Typography>
            </Box>
          </Link>
        </Box>
      )}
    </Box>
  );
}

const cardStyles = {
  card: {
    width: '100%',
    maxWidth: '464px',
    background: '#FFFFFF',
    boxShadow: '0px 4px 80px rgba(0, 0, 0, 0.12)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%'
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: { xs: '160px', md: '200px' },
    borderRadius: '8px',
    overflow: 'hidden'
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  title: {
    fontWeight: 600,
    fontSize: { xs: '0.875rem', md: '1rem' },
    color: '#070808',
    flex: 1
  },
  tag: {
    display: 'inline-flex',
    borderRadius: '40px',
    backgroundColor: '#F4F5F6',
    padding: '4px 12px'
  },
  tagText: {
    fontWeight: 400,
    fontSize: '0.75rem',
    color: '#676D79'
  },
  offeredBy: {
    fontWeight: 400,
    fontSize: '0.875rem',
    color: '#444850'
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailLabel: {
    fontWeight: 500,
    fontSize: '0.813rem',
    color: '#32353B'
  },
  deadlineValue: {
    fontWeight: 500,
    fontSize: '0.875rem',
    color: '#E00000'
  },
  detailValue: {
    fontWeight: 500,
    fontSize: '0.875rem',
    color: '#070808'
  },
  actionButtons: {
    display: 'flex',
    marginTop: 'auto'
  },
  viewButton: {
    height: '48px',
    background: '#004AE0',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  viewButtonText: {
    fontWeight: 500,
    fontSize: '0.875rem',
    color: '#FFFFFF'
  }
};
