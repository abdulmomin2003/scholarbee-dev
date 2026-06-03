import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import PartnerLogosDataFetcher from './partnerUniversitiesSection/partnerLogosDataFetcher';

const styles = {
  root: {
    position: 'relative',
    width: '100%',
    background: '#F8F8F9',
    py: { xs: 6, md: 8 }
  },
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    width: '100%',
    maxWidth: '100%',
    px: 0
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1.5,
    mb: { xs: 4, md: 6 },
    px: { xs: 2, md: 4 },
    maxWidth: '820px',
    margin: '0 auto'
  },
  title: {
    fontWeight: 600,
    color: '#0F1012',
    textAlign: 'center',
    fontSize: { xs: '32px', md: '40px' },
    lineHeight: { xs: '42px', md: '56px' }
  },
  subtitle: {
    fontWeight: 400,
    color: '#555A64',
    textAlign: 'center',
    fontSize: { xs: '18px', md: '22px' },
    lineHeight: { xs: '28px', md: '32px' }
  }
};

// Header component
const SectionHeader = () => (
  <Box sx={styles.headerContainer}>
    <Typography component="h2" variant="h4" sx={styles.title}>
      Our Partner Universities
    </Typography>
    <Typography variant="body1" sx={styles.subtitle}>
      We work with HEC recognized universities of Pakistan. We help get priority
      placement and confirmed admission into your chosen program
    </Typography>
  </Box>
);

const PartnerUniversitiesSection = () => {
  return (
    <Box sx={styles.root}>
      <Container maxWidth="xl" sx={styles.container}>
        <SectionHeader />
        {/* Render the unified full-width grid of partners directly here */}
        <PartnerLogosDataFetcher />
      </Container>
    </Box>
  );
};

export default PartnerUniversitiesSection;
