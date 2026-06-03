/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react';
import CampusCard from './campusCard';
import CampusCardSkeleton from './campusCardSkeleton';
import { isDomainAllowed } from '@/utils/helperFunctions';

interface CampusesListProps {
  campuses: any[];
  loading?: boolean;
}

const CampusesList = ({ campuses, loading = false }: CampusesListProps) => {
  if (loading) {
    return (
      <Box sx={{ py: 2 }}>
        <CampusCardSkeleton />
      </Box>
    );
  }

  if (campuses?.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No campus found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Stack spacing={3}>
        {campuses?.map((campus: any) => (
          <Link
            key={campus?._id}
            href={`/chat?campusId=${campus?._id}`}
            style={{ textDecoration: 'none' }}
            aria-label={`Start chat with ${campus?.name}`}
          >
            <CampusCard
              name={campus?.name}
              address={`${campus.address?.city ?? ''}, ${campus.address?.country ?? ''}`}
              campusId={campus?._id}
              logoUrl={
                isDomainAllowed(campus?.logo_url)
                  ? campus.logo_url
                  : '/placeholder-logo.png'
              }
            />
          </Link>
        ))}
      </Stack>
    </Box>
  );
};

export default CampusesList;
