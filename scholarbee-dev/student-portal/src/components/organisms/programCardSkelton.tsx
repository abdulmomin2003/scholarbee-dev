import React from 'react';
import { Box, Grid, Skeleton, Divider } from '@mui/material';

const ProgramCardSkeleton = () => {
  return (
    <Box sx={styles.card} mb={3}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={209}
            sx={{ borderRadius: '12px' }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box>
            <Skeleton variant="text" width="60%" height={40} />
            <Box sx={styles.infoRow}>
              <Skeleton variant="rectangular" width={90} height={25} />
              <Box sx={styles.rating}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width={40} height={24} />
              </Box>
            </Box>
            <Box sx={styles.infoRow}>
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" width="40%" height={24} />
            </Box>
            <Box sx={styles.infoRow}>
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" width="60%" height={24} />
            </Box>
          </Box>
          <Box gap={1} sx={styles.programDetails}>
            <Box sx={styles.detailRow}>
              <Skeleton variant="circular" width={24} height={24} />
              <Box>
                <Skeleton variant="text" width={60} height={20} />
                <Skeleton variant="text" width={80} height={24} />
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem sx={styles.divider} />
            <Box sx={styles.detailRow}>
              <Skeleton variant="circular" width={24} height={24} />
              <Box>
                <Skeleton variant="text" width={60} height={20} />
                <Skeleton variant="text" width={80} height={24} />
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem sx={styles.divider} />
            <Box sx={styles.detailRow}>
              <Skeleton variant="circular" width={24} height={24} />
              <Box>
                <Skeleton variant="text" width={60} height={20} />
                <Skeleton variant="text" width={80} height={24} />
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProgramCardSkeleton;

const styles = {
  card: {
    borderRadius: 2,
    backgroundColor: 'white',
    padding: 2
  },
  cardInfo: {},
  cardDetails: {
    display: 'flex',
    flex: 1,
    width: '100%',
    flexDirection: 'column'
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 2,
    mt: 2
  },
  rating: {
    display: 'flex',
    flexDirection: 'row',
    gap: 1
  },
  programDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: {
      xs: 'column',
      sm: 'row'
    }
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    mt: 1
  },
  divider: {
    margin: { xs: 0.5, lg: 1 },
    display: {
      xs: 'none',
      md: 'block'
    }
  }
};
