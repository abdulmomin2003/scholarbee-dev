import React from 'react';
import { Box, Button, Grid, Stack } from '@mui/material';
import AuthSideImage from '@/components/organisms/authSideImage';
import loginIllustration from '@public/assets/svg/otp-illustration.svg';
import OTPInput from '@/components/molecules/otpFields';
import AuthNav from '@/components/molecules/authNav';
import AuthFooter from '@/components/molecules/authFooter';
import AuthTitleAndSubheading from '@/components/molecules/authTitleAndSubheading';

const OTP = () => {
  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <AuthSideImage
        sideImage={loginIllustration}
        text="Discover a world of academic potential with a single click on ScholarBee."
      />
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
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
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            px: 2
          }}
        >
          <AuthNav />
          <Box
            sx={{
              my: 7,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '404px',
              width: '100%',
              alignSelf: 'center',
              textAlign: 'center'
            }}
          >
            <AuthTitleAndSubheading
              title="OTP Code"
              subHeading="Type the code we have sent you on your registered email"
            />
            <Box component="form" noValidate sx={{ mt: 4 }}>
              <Stack spacing={2} sx={{ width: '100%' }} alignItems="center">
                <OTPInput />
              </Stack>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  borderRadius: '12px',
                  maxWidth: '100%',
                  mt: 3,
                  mb: 2
                }}
              >
                Submit Code
              </Button>
              {/* <Typography variant="body1" align="center" mt={3}>
                {`Code can be resend in 00:35`}
              </Typography>
              <Typography variant="body2" align="center" mt={3}>
                {`Send`}
              </Typography> */}
            </Box>
          </Box>
        </Box>

        <AuthFooter />
      </Grid>
    </Grid>
  );
};

export default OTP;
