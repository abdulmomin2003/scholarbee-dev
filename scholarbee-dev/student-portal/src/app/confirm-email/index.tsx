'use client';
import React, { useEffect } from 'react';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import AuthSideImage from '@/components/organisms/authSideImage';
import createPasswordIllustration from '@public/assets/svg/forgot-password.svg';
import AuthTitleAndSubheading from '@/components/molecules/authTitleAndSubheading';
import AuthFooter from '@/components/molecules/authFooter';
import { useGetUserQuery } from '@/redux/api/userApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@public/assets/svg/logo.svg';

const ConfirmEmail = () => {
  const { data: userData, isLoading: isLoadingUser } = useGetUserQuery();
  const router = useRouter();

  useEffect(() => {
    if (userData?.user?._verified) {
      router.push('/');
    }
  }, [userData?.user?._verified, router]);

  return (
    <Grid container component="main" sx={styles.mainGrid}>
      <AuthSideImage
        imageHeight={370}
        imageWidth={450}
        sideImage={createPasswordIllustration}
        text="Discover a world of academic potential with a single click on ScholarBee."
      />
      <Grid size={{ xs: 12, md: 6 }} sx={styles.rightGrid}>
        <Box sx={styles.innerBox}>
          {/* <AuthNav /> */}
          <Box sx={styles.formContainer}>
            <Box my={2} display="flex" justifyContent="center">
              <Link
                href="/"
                style={{ textDecoration: 'none' }}
                data-test-id="auth-nav-link"
              >
                <Box sx={{ px: { xs: 2, sm: 5 }, py: 2 }}>
                  <Image src={logo} height={44} width={235} alt="logo" />
                </Box>
              </Link>
            </Box>
            <AuthTitleAndSubheading title="Confirm Email" subHeading="" />

            {isLoadingUser ? (
              <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress />
              </Box>
            ) : (
              <Typography
                variant="body1"
                color="primary.main"
                align="center"
                sx={{ mt: 2 }}
              >
                Please check your inbox to confirm your email.
              </Typography>
            )}
          </Box>
        </Box>
        <AuthFooter />
      </Grid>
    </Grid>
  );
};

export default ConfirmEmail;

const styles = {
  mainGrid: {
    height: '100vh'
  },
  rightGrid: {
    display: 'flex',
    flexDirection: 'column',
    height: { xs: 'auto', md: '100vh' },
    overflowY: { xs: 'unset', md: 'auto' },
    '&::-webkit-scrollbar': {
      width: '0.4em'
    },
    '&::-webkit-scrollbar-track': {
      boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,.2)',
      borderRadius: '8px'
    }
  },
  innerBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    px: 2
  },
  formContainer: {
    my: 7,
    mx: 4,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '404px',
    width: '100%',
    alignSelf: 'center',
    textAlign: 'center'
  },
  form: {
    mt: 4
  }
};
