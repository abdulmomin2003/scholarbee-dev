import React from 'react';
import { Box, Container, Grid, Skeleton, Stack } from '@mui/material';
import { COLORS } from '@/constants/colors';

const DetailPageSkeleton = () => {
  return (
    <Box bgcolor={COLORS.bgColor} minHeight="100vh">
      <Box bgcolor="white">
        <Container sx={{ py: 2 }}>
          <Skeleton variant="text" width={300} />
        </Container>
      </Box>

      {/* Hero section skeleton */}
      <Box bgcolor="white" pb={4}>
        <Container>
          <Skeleton variant="rectangular" width="100%" height={120} />
        </Container>
      </Box>

      {/* Info section skeleton */}
      <Container sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Box
              bgcolor="white"
              p={2}
              borderRadius={1}
              height={100}
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width="70%" />
              </Stack>
              <Skeleton variant="text" width="90%" sx={{ mt: 1 }} />
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Container sx={{ mt: 3, mb: 5 }}>
        <Grid size={{ xs: 12 }}>
          <Box bgcolor="white" p={3} borderRadius={1}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="90%" />

            <Box mt={4}>
              <Skeleton variant="text" width="40%" height={30} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="95%" />
            </Box>

            <Box mt={4}>
              <Skeleton variant="text" width="40%" height={30} />
              <Grid container spacing={2} mt={1}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={item}>
                    <Skeleton variant="rectangular" width="100%" height={50} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};

export default DetailPageSkeleton;
