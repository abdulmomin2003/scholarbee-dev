import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import logo from '@public/assets/svg/logo.svg';
import React, { useState, useEffect } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { AuthApi } from '@/endpoints/auth';
import { toast } from 'react-toastify';
import { COLORS } from '@/constants/colors';
import AuthLayout from '@/components/layouts/AuthLayout';

interface ConfirmEmailProps {
  email?: string;
  onForgetPage?: boolean;
}

const ConfirmEmail: React.FC<ConfirmEmailProps> = ({ email, onForgetPage }) => {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const authApi = new AuthApi();

  // Start cooldown automatically when component mounts for forget password page
  useEffect(() => {
    if (onForgetPage) {
      setResendCooldown(60);
      const countdown = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup interval on unmount
      return () => clearInterval(countdown);
    }
  }, [onForgetPage]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email not provided. Please try again.');
      return;
    }

    setResendLoading(true);
    try {
      let response;
      if (onForgetPage) {
        // For password reset
        response = await authApi.resendPasswordResetEmail(email);
      } else {
        // For email verification
        response = await authApi.resendVerificationEmail(email);
      }

      if (response.success) {
        toast.success(
          response.message ||
            (onForgetPage
              ? 'Password reset email sent successfully'
              : 'Verification email sent successfully')
        );
        // Set cooldown for 60 seconds
        setResendCooldown(60);
        const countdown = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(countdown);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(
          response?.data?.message ||
            (onForgetPage
              ? 'Failed to resend password reset email'
              : 'Failed to resend verification email')
        );
      }
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error('An error occurred while resending the email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={styles.container}>
        {/* Logo */}
        <Box sx={styles.logoContainer}>
          <Link
            href="/"
            style={{ textDecoration: 'none' }}
            data-test-id="auth-nav-link"
          >
            <Image src={logo} height={44} width={235} alt="logo" />
          </Link>
        </Box>

        {/* Title */}
        <Box sx={styles.headerBox}>
          <Typography sx={styles.title}>
            {onForgetPage ? 'Check Your Email' : 'Confirm Email'}
          </Typography>
          <Typography sx={styles.subtitle}>
            {onForgetPage
              ? "We've sent a password reset link to your email address."
              : 'Please check your inbox to confirm your email.'}
          </Typography>
        </Box>

        {/* Email Display */}
        {email && (
          <Box sx={styles.emailBox}>
            <Typography sx={styles.emailText}>{email}</Typography>
          </Box>
        )}

        {/* Instructions */}
        <Box sx={styles.instructionsBox}>
          <Typography sx={styles.instructionsText}>
            Didn&apos;t receive the email? Check your spam folder or click the
            button below to resend.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleResendEmail}
          disabled={resendLoading || resendCooldown > 0}
          sx={styles.resendButton}
        >
          {resendLoading ? (
            <CircularProgress size={20} sx={{ color: COLORS.white }} />
          ) : resendCooldown > 0 ? (
            `Resend in ${resendCooldown}s`
          ) : (
            'Resend Email'
          )}
        </Button>

        {/* Back to Login */}
        <Box sx={styles.loginPromptBox}>
          <Typography sx={styles.loginPromptText}>
            Remember your password?
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Typography component="span" sx={styles.loginLink}>
                Back to Login
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default ConfirmEmail;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: { xs: 2, md: 3 }
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    mb: { xs: 2, md: 3 }
  },
  headerBox: {
    textAlign: 'center',
    mb: { xs: 1, md: 0 }
  },
  title: {
    fontWeight: 700,
    fontSize: { xs: '24px', sm: '28px', md: '32px' },
    lineHeight: { xs: '32px', sm: '36px', md: '40px' },
    color: COLORS.textPrimary,
    mb: { xs: 1, md: 1.5 }
  },
  subtitle: {
    fontWeight: 400,
    fontSize: { xs: '14px', md: '16px' },
    lineHeight: { xs: '20px', md: '24px' },
    color: 'rgba(37, 37, 37, 0.7)'
  },
  emailBox: {
    bgcolor: '#F8F9FB',
    borderRadius: { xs: '10px', md: '12px' },
    p: { xs: 2, md: 2.5 },
    border: `1px solid ${COLORS.borderColor}`,
    mt: 1
  },
  emailText: {
    fontSize: { xs: '14px', md: '16px' },
    fontWeight: 600,
    color: '#004AE0',
    textAlign: 'center',
    wordBreak: 'break-all'
  },
  instructionsBox: {
    mt: { xs: 1, md: 2 }
  },
  instructionsText: {
    fontSize: { xs: '13px', md: '14px' },
    lineHeight: { xs: '18px', md: '20px' },
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  resendButton: {
    height: { xs: '48px', md: '56px' },
    bgcolor: '#004AE0',
    borderRadius: { xs: '10px', md: '12px' },
    textTransform: 'none',
    fontSize: { xs: '14px', md: '16px' },
    fontWeight: 600,
    mt: { xs: 1, md: 2 },
    '&:hover': {
      bgcolor: '#003BB5'
    },
    '&.Mui-disabled': {
      bgcolor: 'rgba(0, 74, 224, 0.3)',
      color: COLORS.white
    }
  },
  loginPromptBox: {
    textAlign: 'center',
    mt: { xs: 2, md: 3 }
  },
  loginPromptText: {
    fontSize: { xs: '14px', md: '16px' },
    color: COLORS.textPrimary
  },
  loginLink: {
    color: '#004AE0',
    fontWeight: 600,
    textDecoration: 'none',
    ml: 0.5,
    '&:hover': {
      textDecoration: 'underline'
    }
  }
};
