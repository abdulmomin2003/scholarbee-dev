'use client';
import AuthLayout from '@/components/layouts/AuthLayout';
import AuthInput from '@/components/molecules/AuthInput';
import AuthPasswordInput from '@/components/molecules/AuthPasswordInput';
import { API_BASE_URL_DEV } from '@/config/config';
import { Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { styles } from './styles';
import { useLogin } from './useLogin';
import googleIcon from '@public/assets/svg/google_ic.svg';
import logo from '@public/assets/svg/logo.svg';
import mailIcon from '@public/assets/svg/mail-outlined.svg';

const LoginFormContent: React.FC = () => {
  const searchParams = useSearchParams();
  const { loading, errors, control, handleSubmit } = useLogin(searchParams);
  const toastShownRef = useRef(false);

  // Check if user was redirected due to authentication requirement
  useEffect(() => {
    const authRequired = searchParams.get('auth_required');
    const oauthError = searchParams.get('oauth_error');
    if (authRequired === 'true' && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.info('Please log in to access this page', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
    if (oauthError && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.error(oauthError, {
        position: 'top-right',
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth initiation endpoint
    const redirectUrl = searchParams.get('redirect');
    const googleAuthUrl = `${API_BASE_URL_DEV}/auth/google${
      redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''
    }`;
    window.location.href = googleAuthUrl;
  };

  return (
    <AuthLayout
      staticText="Smart Admissions"
      animatedWords={['Platform', 'Journey', 'Made Easy']}
    >
      <Box sx={styles.formContainer}>
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: { xs: 2, md: 3 }
          }}
        >
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Image src={logo} height={44} width={235} alt="logo" />
          </Link>
        </Box>

        {/* Header */}
        <Box sx={styles.headerBox}>
          <Typography sx={styles.title}>Sign in to your account</Typography>
          <Typography sx={styles.subtitle}>
            Welcome Back! Please enter your details
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          noValidate
          sx={styles.form}
          onSubmit={handleSubmit}
        >
          {/* Email */}
          <AuthInput
            name="email"
            control={control}
            placeholder="Email"
            autoComplete="email"
            autoFocus
            errors={errors}
            startIcon={mailIcon}
          />

          {/* Password */}
          <AuthPasswordInput
            name="password"
            control={control}
            placeholder="Password"
            errors={errors}
          />

          {/* Forgot Password Link */}
          <Box sx={styles.forgotPasswordBox}>
            <Link href="/forgot-password" sx={styles.forgotPasswordLink}>
              Forgot password?
            </Link>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={styles.submitButton}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </Box>

        {/* Divider */}
        <Box sx={styles.dividerBox}>
          <Box sx={styles.dividerLine} />
          <Typography sx={styles.dividerText}>Or Sign up with</Typography>
          <Box sx={styles.dividerLine} />
        </Box>

        {/* Google Login */}
        <Button
          variant="outlined"
          fullWidth
          sx={styles.googleButton}
          onClick={handleGoogleLogin}
        >
          <Image src={googleIcon} alt="Google" width={20} height={20} />
          <Box component="span" sx={{ ml: 1 }}>
            Google
          </Box>
        </Button>

        {/* Sign Up Prompt */}
        <Box sx={styles.signUpPromptBox}>
          <Typography sx={styles.signUpPromptText}>
            Don&apos;t have an account yet?
            <Link href="/sign-up" sx={styles.signUpLink}>
              Create New Account
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthLayout>
  );
};

const LoginForm: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
};

const LoginIn: React.FC = () => {
  return <LoginForm />;
};

export default LoginIn;
