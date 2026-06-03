import React from 'react';
import { Box, Skeleton } from '@mui/material';

const ProgramDetailsSkeleton = () => {
  return (
    <Box>
      {/* Hero Section Skeleton */}
      {/* <Box
        sx={{
          width: '100%',
          bgcolor: 'rgba(0, 0, 0, 0.1)',
          height: { xs: '220px', sm: '330px' }
        }}
      >
        <Box
          sx={{
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Skeleton variant="circular" width={92} height={92} />
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>
      </Box> */}

      {/* Info Items Skeleton */}
      {/* <Box
        sx={{
          mt: 4,
          p: 2,
          bgcolor: 'white',
          borderRadius: 2,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          gap: 2
        }}
      >
        {[...Array(5)].map((_, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              minWidth: '200px'
            }}
          >
            <Skeleton variant="circular" width={32} height={32} />
            <Box>
              <Skeleton variant="text" width={100} height={24} />
              <Skeleton variant="text" width={80} height={20} />
            </Box>
          </Box>
        ))}
      </Box> */}

      {/* Main Content Sections Skeleton */}
      {[...Array(4)].map((_, index) => (
        <Box
          key={index}
          sx={{ mt: 2, bgcolor: 'white', p: 2, borderRadius: 2 }}
        >
          {/* <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Skeleton variant="text" width="30%" height={32} />
            {index === 0 && (
              <Skeleton variant="rectangular" width={180} height={36} />
            )}
          </Box> */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rounded" width="100%" height={60} />
            <Skeleton variant="rounded" width="100%" height={100} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ProgramDetailsSkeleton;
