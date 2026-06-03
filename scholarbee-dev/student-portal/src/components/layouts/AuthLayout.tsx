'use client';
import { Grid, Box } from '@mui/material';
import { ReactNode } from 'react';
import AuthLeftSection from '@/components/organisms/AuthLeftSection';
import { COLORS } from '@/constants/colors';

interface AuthLayoutProps {
  children: ReactNode;
  animatedWords?: string[];
  staticText?: string;
  showLeftSection?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  animatedWords,
  staticText,
  showLeftSection = true
}) => {
  return (
    <Grid container sx={styles.gridContainer}>
      {/* Left Section - Animated Background */}
      {showLeftSection && (
        <AuthLeftSection
          animatedWords={animatedWords}
          staticText={staticText}
        />
      )}

      {/* Right Section - Content */}
      <Grid
        size={{ xs: 12, md: showLeftSection ? 6 : 12 }}
        sx={{
          ...styles.rightGrid,
          width: { xs: '100%', md: showLeftSection ? '50%' : '100%' }
        }}
      >
        <Box sx={styles.innerBox}>
          <Box sx={styles.contentWrapper}>{children}</Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default AuthLayout;

const flexCenter = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const styles = {
  gridContainer: {
    minHeight: { xs: '100vh', md: '100vh' },
    height: { xs: 'auto', md: '100vh' },
    bgcolor: COLORS.white,
    width: '100%',
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    flexWrap: 'nowrap',
    overflow: { xs: 'auto', md: 'hidden' },
    gap: 0
  },

  rightGrid: {
    height: { xs: 'auto', md: '100vh' },
    overflowY: { xs: 'visible', md: 'auto' },
    py: { xs: 3, sm: 4, md: 6 },
    px: { xs: 2, sm: 3, md: 0 },
    ...flexCenter,
    justifyContent: { xs: 'center', md: 'flex-start' }
  },

  innerBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },

  contentWrapper: {
    width: '100%',
    maxWidth: { xs: '100%', sm: '440px', md: '480px' },
    px: { xs: 0, sm: 2 },
    gap: { xs: 2, md: 3 },
    ...flexCenter
  }
};
