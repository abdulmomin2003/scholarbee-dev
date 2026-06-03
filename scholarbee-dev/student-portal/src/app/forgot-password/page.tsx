'use client';
import AuthLayout from '@/components/layouts/AuthLayout';
import AuthInput from '@/components/molecules/AuthInput';
import { AuthApi } from '@/endpoints/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';
import ConfirmEmail from '../sign-up/confirmEmail';
import { styles } from './styles';
import mailIcon from '@public/assets/svg/login-mail.svg';

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(254, 'Email address is too long')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address ')
});

type FormData = z.infer<typeof schema>;

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showConfirmMessage, setShowConfirmMessage] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const authApi = new AuthApi();

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await authApi.forgotPassword(data);
      console.log('response in forgot password', response);
      if (response.success) {
        toast.success('Password reset link sent to your email');
        setSubmittedEmail(data.email);
        setShowConfirmMessage(true);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log('error white forgot password', error);
      toast.error('Something went wrong, please try again later');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmMessage) {
    return <ConfirmEmail onForgetPage email={submittedEmail} />;
  }

  return (
    <AuthLayout>
      <Box sx={styles.formContainer}>
        {/* Header */}
        <Box sx={styles.headerBox}>
          <Typography sx={styles.title}>Reset Password</Typography>
          <Typography sx={styles.subtitle}>
            Type your registered email to reset your password
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          sx={styles.form}
        >
          <AuthInput
            name="email"
            control={control}
            placeholder="Email"
            errors={errors}
            startIcon={mailIcon}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={styles.submitButton}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Reset Password'
            )}
          </Button>
        </Box>

        {/* Back to Login */}
        <Box sx={styles.loginPromptBox}>
          <Typography sx={styles.loginPromptText}>
            Remember Password?{' '}
            <Link href="/login" sx={styles.loginLink}>
              Login Now
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default ForgotPassword;
