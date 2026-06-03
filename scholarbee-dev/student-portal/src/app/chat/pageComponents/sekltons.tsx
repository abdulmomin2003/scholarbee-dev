import { COLORS } from '@/constants/colors';
import { Box, Skeleton } from '@mui/material';

export const SentMessageSkeleton = () => {
  return (
    <Box>
      <Skeleton width={60} height={20} />
      <Box display="flex">
        <Skeleton
          variant="rounded"
          sx={{
            mt: 1.5,
            py: 2.5,
            px: 2,
            width: 200,
            height: 60,
            // backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '0 24px 24px 24px'
          }}
        />
      </Box>
      <Skeleton width={40} height={16} sx={{ mt: 0.75 }} />
    </Box>
  );
};

export const ReceivedMessageSkeleton = () => {
  return (
    <Box
      display={'flex'}
      mr={2}
      flexDirection={'column'}
      alignItems={'flex-end'}
    >
      <Skeleton width={60} height={20} sx={{ alignSelf: 'flex-end' }} />
      <Box display="flex">
        <Skeleton
          variant="rounded"
          sx={{
            mt: 1.5,
            py: 2.5,
            px: 2,
            width: 220,
            height: 60,
            backgroundColor: `${COLORS.primary}20`,
            borderRadius: ' 24px 0 24px 24px'
          }}
        />
      </Box>
      <Skeleton width={40} height={16} sx={{ mt: 0.75 }} />
    </Box>
  );
};

export const ChatSectionBodySkeleton = () => {
  return (
    <Box
      sx={{
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 2,
        backgroundColor: COLORS.bgColor,
        borderRadius: 2
      }}
    >
      <Box sx={{ overflowY: 'auto' }}>
        <SentMessageSkeleton />
        <Box sx={{ height: 20 }} />
        <ReceivedMessageSkeleton />
        <Box sx={{ height: 20 }} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Skeleton
          variant="rounded"
          sx={{
            flex: 1,
            height: 72,
            borderRadius: '8px'
          }}
        />
        <Skeleton
          variant="rounded"
          sx={{
            height: 72,
            width: 72,
            ml: 1,
            borderRadius: '8px',
            backgroundColor: `${COLORS.primary}40`
          }}
        />
      </Box>
    </Box>
  );
};
