'use client';
import React, { Suspense } from 'react';
import { Box, Button, Typography, CircularProgress, Link } from '@mui/material';
import AuthLayout from '@/components/layouts/AuthLayout';
import { styles } from './styles';
import { useResetPassword } from './useResetPassword';
import AuthPasswordInput from '@/components/molecules/AuthPasswordInput';

const ResetPasswordContent: React.FC = () => {
  const { control, handleSubmit, onSubmit, errors, loading } =
    useResetPassword();

  return (
    <AuthLayout>
      <Box sx={styles.formContainer}>
        {/* Header */}
        <Box sx={styles.headerBox}>
          <Typography sx={styles.title}>Reset your password</Typography>
          <Typography sx={styles.subtitle}>
            Please enter a new password for your account.
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          noValidate
          sx={styles.form}
          onSubmit={handleSubmit(onSubmit)}
        >
          <AuthPasswordInput
            name="newPassword"
            control={control}
            placeholder="New Password"
            autoComplete="new-password"
            errors={errors}
          />
          <AuthPasswordInput
            name="confirmPassword"
            control={control}
            placeholder="Confirm Password"
            autoComplete="new-password"
            errors={errors}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Create Password'
            )}
          </Button>
        </Box>

        {/* Back to Login */}
        <Box sx={styles.loginPromptBox}>
          <Typography sx={styles.loginPromptText}>
            Remember Password?{' '}
            <Link href="/login" sx={styles.loginLink}>
              Login
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthLayout>
  );
};

const ResetPassword: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPassword;
