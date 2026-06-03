'use client';
import React from 'react';
import {
  Box,
  // Button,
  Grid,
  Paper,
  // Typography,
  Link
  // TextField
} from '@mui/material';
import Image from 'next/image';
import circleBg from '@public/assets/png/comming-soon-cover.jpeg';
import logo from '@public/assets/svg/logo.svg';
import Title from '@/components/atoms/title';

const CommingSoon: React.FC = () => {
  return (
    <Grid container sx={styles.mainContainer}>
      <Grid
        size={{ xs: 12, md: 7 }}
        component={Paper}
        elevation={6}
        square
        sx={styles.rightGrid}
      >
        <Box sx={styles.rightBox}>
          <Box sx={styles.innerBox}>
            <Link
              href="/"
              style={{ textDecoration: 'none' }}
              data-test-id="auth-nav-link"
            >
              <Image src={logo} height={44} width={235} alt="logo" />
            </Link>

            <Box mt={15}>
              {/* <Typography
                variant="body2"
                color="primary.main"
                sx={styles.comingSoonBadge}
              >
                COMING SOON
              </Typography> */}

              <Title title="404 Page not found" />

              {/* <Typography
                variant="body1"
                color="text.secondary"
                sx={styles.mainText}
              >
                {
                  "We're putting the finishing touches on our website and getting ready to launch. Sign up for updates and be the first to know when we go live."
                }
              </Typography>

              <Box component="form" sx={styles.formContainer}>
                <TextField
                  placeholder="Email address"
                  fullWidth
                  InputProps={styles.inputProps}
                />
                <Button variant="contained" sx={styles.subscribeButton}>
                  Subscribe
                </Button>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={styles.captionText}
              >
                Sign up for updates to be the first to know when we launch. No
                spam, just important information and exclusive offers.
              </Typography> */}
            </Box>
          </Box>
        </Box>
      </Grid>

      <Grid size={{ xs: false, sm: 12, md: 5 }} sx={styles.leftGrid}>
        <Image
          src={circleBg}
          alt="circle bg image"
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'cover'
          }}
        />
      </Grid>
    </Grid>
  );
};

export default CommingSoon;

export const styles = {
  mainContainer: { height: '100vh' },
  leftGrid: {
    background: 'linear-gradient(174deg, #4A9DE0 2.64%, #0B3B95 92.87%)',
    display: { xs: 'none', md: 'flex' },
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightGrid: {
    display: 'flex',
    flexDirection: 'column'
  },
  rightBox: {
    display: 'flex',
    flex: 1,
    width: '100%',
    justifyContent: 'center'
  },
  innerBox: {
    width: '100%',
    maxWidth: '570px',
    paddingX: '20px',
    mt: 9
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(11, 60, 149, 0.10)',
    fontWeight: 'bold',
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    mb: 2
  },
  mainText: {
    mb: 4,
    fontSize: '18px',
    mt: 2
  },
  formContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 3
  },
  inputProps: {
    sx: {
      borderRadius: '8px',
      paddingRight: '0px'
    }
  },
  subscribeButton: {
    color: '#fff',
    height: '100%',
    padding: '12px 24px',
    borderRadius: '8px'
  },
  captionText: {
    fontSize: '12px'
  }
};
