import Image from 'next/image';
import React from 'react';
import graphIcon from '@public/assets/svg/graph.svg';
import blogIllustration from '@public/assets/svg/blog-illustration.svg';
import { Box, Container, Typography } from '@mui/material';
import FollowUs from '@/components/atoms/followUs';
import { CustomTypography } from '@/components/atoms/customTypography';
import Title from '@/components/atoms/title';
import { HeroSectionInterface } from '@/types';

const HeroSection = ({
  illustrationImage,
  heading,
  upperHeading,
  upperHeadingIcon,
  lowerText,
  illustrationSize
}: HeroSectionInterface) => {
  return (
    <Box sx={styles.heroSection} data-test-id="hero-section">
      <Container sx={styles.container} data-test-id="container">
        <Box sx={styles.leftContent} data-test-id="left-content">
          <Box>
            <Box
              display="flex"
              gap={2}
              sx={{
                justifyContent: {
                  xs: 'center',
                  sm: 'flex-start'
                }
              }}
              data-test-id="upper-heading"
            >
              <Image
                src={upperHeadingIcon || graphIcon}
                alt="pie chart icon"
                data-test-id="upper-heading-icon"
              />
              <Typography component="h2" variant="h6">
                {upperHeading}
              </Typography>
            </Box>
            <Title title={heading} data-test-id="heading" />
            <CustomTypography
              fontSize={20}
              smallFont={14}
              mt={2}
              data-test-id="lower-text"
            >
              {lowerText}
            </CustomTypography>
          </Box>
          <Box data-test-id="cta-buttons">
            {/* <Button
              variant="contained"
              sx={styles.getStartedButton}
              data-test-id="get-started-button"
            >
              Get Started
            </Button> */}
            <FollowUs />
          </Box>
        </Box>
        <Box sx={styles.rightContent} data-test-id="right-content">
          <Image
            src={illustrationImage || blogIllustration}
            alt="contact illustration"
            width={illustrationSize || 450}
            height={illustrationSize || 450}
            style={{ maxWidth: '100%', height: 'auto', objectFit: 'cover' }}
            data-test-id="illustration-image"
          />
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;

const styles = {
  heroSection: {
    pt: 8,
    pb: 8
  },
  container: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    justifyContent: 'space-between',
    alignItems: 'center',
    px: { xs: 2, lg: 0 }
  },
  leftContent: {
    maxWidth: '580px',
    textAlign: { xs: 'center', sm: 'left' },
    mb: { xs: 4, md: 0 }
  },
  getStartedButton: {
    mb: { xs: 2, md: 0 },
    mt: 2
  },
  socialMedia: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    mt: 2
  },
  socialIcons: {
    display: 'flex',
    gap: 2
  },
  rightContent: {
    maxWidth: { xs: '100%', md: '50%' },
    textAlign: 'center'
  }
};
