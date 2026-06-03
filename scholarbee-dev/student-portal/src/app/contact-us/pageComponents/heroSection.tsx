import Image from 'next/image';
import React from 'react';
import callIcon from '@public/assets/svg/call.svg';
import contactIllustration from '@public/assets/svg/contact-illuctration.svg';
import { Box, Button, Container, Typography } from '@mui/material';
import FollowUs from '@/components/atoms/followUs';

const HeroSection = ({
  noGetStartedButton
}: {
  noGetStartedButton?: boolean;
}) => {
  return (
    <Box sx={styles.heroSection}>
      <Container sx={styles.container}>
        <Box sx={styles.leftContent}>
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
            >
              <Image src={callIcon} alt="call icon" />
              <Typography component="h2" variant="h6">
                {"Let's Start a Conversation"}
              </Typography>
            </Box>
            <Typography
              component="h1"
              variant="h4"
              mt={2}
              mb={2}
              fontWeight="bold"
            >
              Reach Out to Us Today
            </Typography>
            <Typography variant="body1" mb={4}>
              Our experts are available to answer any questions you might have.
              We’ve got the answers.
            </Typography>
          </Box>
          {!noGetStartedButton && (
            <Box>
              <Button variant="contained" sx={styles.getStartedButton}>
                Get Started
              </Button>
              <FollowUs />
            </Box>
          )}
        </Box>
        <Box sx={styles.rightContent}>
          <Image
            src={contactIllustration}
            alt="contact illustration"
            layout="responsive"
            width={500}
            height={400}
            style={{ maxWidth: '100%', height: 'auto', objectFit: 'cover' }}
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
    maxWidth: { xs: 400, sm: 500, md: 450 },
    textAlign: { xs: 'center', sm: 'left' },
    mb: { xs: 4, md: 0 }
  },
  getStartedButton: {
    mb: { xs: 2, md: 0 }
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
