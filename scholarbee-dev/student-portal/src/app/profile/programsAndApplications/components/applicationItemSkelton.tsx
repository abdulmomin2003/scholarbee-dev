import { Box, Skeleton, Stack } from '@mui/material';
import { styles } from '../../styles';
import React from 'react';

export const ApplicationItemSkeleton = () => {
  return (
    <Box sx={styles.sectionContent}>
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
        alignItems="center"
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Skeleton
            variant="text"
            width="70%"
            height={24}
            animation="wave"
            sx={{ mb: 0.5 }}
          />
          <Skeleton variant="text" width="40%" height={20} animation="wave" />
        </Box>
        <Skeleton
          variant="rounded"
          width={80}
          height={28}
          animation="wave"
          sx={{ borderRadius: '16px' }}
        />
      </Stack>
    </Box>
  );
};

export default ApplicationItemSkeleton;
