import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import Image from 'next/image';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';

const styles = {
  root: {
    position: 'relative',
    width: '100%',
    minHeight: { xs: 'auto', md: '802px' },
    background: '#F8F8F9',
    margin: '0 auto',
    py: { xs: 4, md: 5 }
  },
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: { xs: 'center', md: 'flex-start' },
    justifyContent: 'space-between',
    gap: { xs: 3, md: 4 },
    px: { xs: 2, md: 3 }
  },
  leftSection: {
    position: 'relative',
    width: { xs: '100%', md: '50%' },
    maxWidth: { xs: '100%', md: '728px' },
    display: 'flex',
    flexDirection: 'column',
    alignItems: { xs: 'center', md: 'flex-start' },
    gap: 3
  },
  title: {
    color: '#070808',
    textAlign: { xs: 'center', md: 'left' }
  },
  illustrationContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '728px',
    height: { xs: 'auto', md: '542px' },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mt: 2
  },
  rightSection: {
    position: 'relative',
    width: { xs: '100%', md: '50%' },
    maxWidth: { xs: '100%', md: '451px' },
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 3, md: 4 },
    alignItems: { xs: 'center', md: 'flex-start' }
  },
  stepCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2.5,
    width: '100%',
    maxWidth: { xs: '100%', md: '451px' }
  },
  iconContainer: {
    width: '72px',
    height: '72px',
    background: '#FFFFFF',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.06)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5
  },
  stepTitle: {
    color: '#0F1012'
  },
  stepDescription: {
    color: '#555A64'
  },
  subtext: {
    color: '#555A64',
    textAlign: { xs: 'center', md: 'left' },
    maxWidth: { xs: '100%', md: '600px' },
    mt: 1
  },
  button: {
    width: { xs: '100%', sm: 'auto' },
    minWidth: { xs: 'auto', md: '246px' },
    height: '48px',
    background: '#004AE0',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontWeight: 500,
    textTransform: 'none',
    mt: 3,
    '&:hover': {
      background: '#0039B8'
    }
  }
};

const JOURNEY_STEPS = [
  {
    icon: SearchIcon,
    iconColor: '#E0E000',
    title: 'Simplified University Comparison',
    description:
      'We compare universities based on your specific needs, helping you make a confident decision without the stress.'
  },
  {
    icon: AssignmentIcon,
    iconColor: '#004AE0',
    title: 'All Information in One Place',
    description:
      "Access program details and entry requirements on a single platform so you don't have to visit every university website."
  },
  {
    icon: SchoolIcon,
    iconColor: '#00E000',
    title: 'Personal Deadline Trackers',
    description:
      'Create an account to get simple reminders about application dates to ensure you stay on track with your favorite programs.'
  }
];

const YourJourneySection = () => {
  return (
    <Box sx={styles.root}>
      <Container maxWidth="lg" sx={styles.container}>
        {/* Left Section - Title and Illustration */}
        <Box sx={styles.leftSection}>
          <Typography
            component="h2"
            variant="h3"
            fontWeight={500}
            sx={styles.title}
          >
            Plan Your Education Wisely Using ScholarBee
          </Typography>
          <Box sx={styles.illustrationContainer}>
            <Image
              src="/assets/svg/your-journey.svg"
              alt="Your Journey with ScholarBee"
              width={728}
              height={542}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain'
              }}
              priority
            />
          </Box>
        </Box>

        {/* Right Section - Steps */}
        <Box sx={styles.rightSection}>
          {JOURNEY_STEPS.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Box key={index} sx={styles.stepCard}>
                <Box sx={styles.iconContainer}>
                  <IconComponent
                    sx={{
                      fontSize: '40px',
                      color: step.iconColor
                    }}
                  />
                </Box>
                <Box sx={styles.stepContent}>
                  <Typography
                    variant="h5"
                    component="h3"
                    fontWeight={600}
                    sx={styles.stepTitle}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={400}
                    sx={styles.stepDescription}
                  >
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default YourJourneySection;
