import { COLORS } from '@/constants/colors';
import ProgramCardSkeleton from '@/components/organisms/programCardSkelton';
import { Skeleton, Grid, Container, Box } from '@mui/material';
import React from 'react';

const ScholarshipsLoadingSkeleton = () => (
  <Box bgcolor={COLORS.bgColor}>
    <Box bgcolor="white">
      <Container>
        <Skeleton variant="text" width="60%" height={40} />
        <Box mt={5} pb={3}>
          <Skeleton variant="text" width="80%" height={60} />
          <Skeleton variant="text" width="70%" height={40} />
        </Box>
      </Container>
    </Box>
    <Container>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <Box sx={{ borderRadius: 2, backgroundColor: 'white', padding: 2 }}>
            <Skeleton variant="text" width="100%" height={60} />
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 9 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <ProgramCardSkeleton key={`loading-skeleton-${index}`} />
          ))}
        </Grid>
      </Grid>
    </Container>
  </Box>
);

export default ScholarshipsLoadingSkeleton;
