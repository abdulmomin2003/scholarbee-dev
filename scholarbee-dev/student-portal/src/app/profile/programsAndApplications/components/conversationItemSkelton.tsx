import { Skeleton, Box } from '@mui/material';

import { COLORS } from '@/constants/colors';

const ConversationItemSkeleton = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{
        borderRadius: '200px',
        p: 2.5,
        border: `1px solid ${COLORS.applicationItemBorder}`,
        transition: 'background-color 0.2s ease'
      }}
    >
      <Box flexShrink={0} mr={1}>
        <Skeleton variant="circular" width={64} height={64} animation="wave" />
      </Box>

      <Box flexGrow={1} overflow="hidden">
        <Skeleton
          variant="text"
          width="60%"
          height={32}
          animation="wave"
          sx={{ mb: 0.5 }}
        />
        <Skeleton variant="text" width="80%" height={24} animation="wave" />
      </Box>

      <Box flexShrink={0}>
        <Skeleton variant="circular" width={32} height={32} animation="wave" />
      </Box>
    </Box>
  );
};

export default ConversationItemSkeleton;
