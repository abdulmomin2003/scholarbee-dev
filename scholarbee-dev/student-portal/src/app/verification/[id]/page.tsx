'use client';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { styles } from './styles';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@public/assets/svg/logo.svg';
import { COLORS } from '@/constants/colors';
import { AuthApi } from '@/endpoints/auth';
import AuthLayout from '@/components/layouts/AuthLayout';

const authApi = new AuthApi();

const Verification = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const verifyEmail = async () => {
    setLoading(true);
    try {
      console.log('id', id);
      const response = await authApi.verifyEmail(id);
      console.log('response on verify email Page', response);
      if (response.success) {
        setIsVerified(true);
        toast.success(response.data.message || 'Email verified successfully');
      } else {
        toast.error(response?.data?.message || 'Failed to verify email');
      }
    } catch (error) {
      console.log('error while verification', error);
      toast.error('An error occurred while verifying the email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
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

        {/* Title */}
        <Box sx={styles.headerBox}>
          <Typography sx={styles.title}>
            {isVerified ? 'Email Verified!' : 'Verify Your Email'}
          </Typography>
          <Typography sx={styles.subtitle}>
            {isVerified
              ? 'Your email has been successfully verified. You can now log in to your account.'
              : 'Click the button below to verify your email address.'}
          </Typography>
        </Box>

        {/* Success Message */}
        {isVerified && (
          <Box sx={styles.successBox}>
            <Typography sx={styles.successText}>
              ✓ Verification successful! You can now access all features.
            </Typography>
          </Box>
        )}

        {/* Verify Button */}
        {!isVerified && (
          <Box component="form" noValidate sx={styles.form}>
            <Button
              fullWidth
              className="mt-0"
              variant="contained"
              sx={styles.verifyButton}
              onClick={verifyEmail}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: COLORS.white }} />
              ) : (
                'Verify'
              )}
            </Button>
          </Box>
        )}

        {/* Login Link */}
        <Box sx={styles.loginPromptBox}>
          <Typography sx={styles.loginPromptText}>
            {isVerified ? 'Ready to get started?' : 'Already verified?'}
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Typography component="span" sx={styles.loginLink}>
                {isVerified ? 'Go to Login' : 'Login here'}
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Verification;
