import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

const CampusCardSkeleton = () => {
  return (
    <Box sx={styles.cardContainer}>
      <Box sx={styles.backgroundContainer}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>

      <Box sx={styles.contentContainer}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={styles.topRow}
        >
          <Box />
          <Skeleton
            variant="rectangular"
            width={100}
            height={36}
            sx={styles.messageButton}
          />
        </Stack>

        <Box sx={styles.centerContent}>
          <Skeleton variant="circular" sx={styles.logoContainer} />

          <Skeleton
            variant="text"
            width="60%"
            height={40}
            sx={styles.campusName}
          />

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            justifyContent="center"
            sx={styles.locationContainer}
          >
            <Skeleton variant="circular" width={18} height={18} />
            <Skeleton variant="text" width="40%" height={24} />
          </Stack>
        </Box>

        <Box sx={styles.bottomSpacer} />
      </Box>
    </Box>
  );
};

export default CampusCardSkeleton;

const styles: Record<string, SxProps<Theme>> = {
  cardContainer: {
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    height: '260px',
    mb: 2,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    bgcolor: 'rgba(255, 255, 255, 0.8)'
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    '& .MuiSkeleton-root': {
      transform: 'scale(1)',
      bgcolor: 'rgba(210, 210, 210, 0.4)'
    }
  },
  contentContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '20px',
    justifyContent: 'space-between'
  },
  topRow: {
    mt: 1
  },
  messageButton: {
    borderRadius: '8px',
    bgcolor: 'rgba(210, 210, 210, 0.7)'
  },
  centerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    textAlign: 'center'
  },
  logoContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    bgcolor: 'rgba(210, 210, 210, 0.7)',
    mb: 2
  },
  campusName: {
    bgcolor: 'rgba(210, 210, 210, 0.7)'
  },
  locationContainer: {
    mt: 1
  },
  locationIcon: {
    fontSize: '18px'
  },
  locationText: {
    fontWeight: 'medium'
  },
  bottomSpacer: {
    height: '10px'
  }
};
