import { Box, Skeleton } from '@mui/material';
import { styles } from '../styles';

const ApplicationSkeleton = () => (
  <Box sx={styles.sectionContent}>
    <Box sx={styles.applicationRow}>
      <Box sx={{ flex: 1 }}>
        <Skeleton height={24} width="60%" sx={{ mb: 1 }} />
        <Skeleton height={20} width="40%" />
      </Box>
      <Skeleton
        height={24}
        width={80}
        sx={{
          borderRadius: '10px'
        }}
      />
    </Box>
  </Box>
);

export default ApplicationSkeleton;
