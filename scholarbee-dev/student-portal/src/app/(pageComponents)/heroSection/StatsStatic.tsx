import React from 'react';
import { Box, Typography } from '@mui/material';

interface StatsStaticProps {
  campuses: number | string;
  programs: number | string;
  scholarships: number | string;
  styles: any;
}

// Server-rendered, non-animated stats section used for SSR fallback.
const StatsStatic: React.FC<StatsStaticProps> = ({
  campuses,
  programs,
  scholarships,
  styles
}) => {
  return (
    <Box sx={styles.statsContainer}>
      <Box sx={styles.statsContent}>
        <Box sx={styles.statGroup}>
          <Typography sx={styles.statNumber}>
            {typeof campuses === 'number'
              ? campuses.toLocaleString()
              : campuses}
            +
          </Typography>
          <Typography sx={styles.statLabel}>Institutes</Typography>
        </Box>

        <Box sx={styles.statGroup}>
          <Typography sx={styles.statNumber}>
            {typeof programs === 'number'
              ? programs.toLocaleString()
              : programs}
            +
          </Typography>
          <Typography sx={styles.statLabel}>Programs</Typography>
        </Box>

        <Box sx={styles.statGroup}>
          <Typography sx={styles.statNumber}>
            {typeof scholarships === 'number'
              ? scholarships.toLocaleString()
              : scholarships}
            +
          </Typography>
          <Typography sx={styles.statLabel}>Scholarships</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StatsStatic;
