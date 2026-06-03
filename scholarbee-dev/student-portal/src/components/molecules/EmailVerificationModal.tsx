/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { toast } from 'react-toastify';
import {
  useGetUserQuery,
  useResendVerificationEmailMutation
} from '@/redux/api/userApi';

export default function EmailVerificationModal({
  open,
  onClose,
  onVerified
}: {
  open: boolean;
  onClose: () => void;
  onVerified?: () => void;
}) {
  const {
    data: userData,
    isLoading: isLoadingUser,
    refetch: refetchUser
  } = useGetUserQuery();
  const [resendVerificationEmail, { isLoading: isResending }] =
    useResendVerificationEmailMutation();

  const [emailSentSuccessfully, setEmailSentSuccessfully] = useState(false);

  const isVerified = userData?._verified;

  useEffect(() => {
    if (open) return;
    // Reset when modal closes so next open is fresh.
    setEmailSentSuccessfully(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (isVerified) {
      setEmailSentSuccessfully(false);
      onClose();
      onVerified?.();
    }
  }, [isVerified, onClose, onVerified, open]);

  const handleVerifyEmail = async () => {
    if (!userData?.email) {
      toast.error('Email not found. Please contact support.');
      return;
    }

    // If email was already sent, check verification status
    if (emailSentSuccessfully) {
      try {
        const { data: updatedUserData } = await refetchUser();
        if (updatedUserData?._verified) {
          toast.success('Email verified successfully!');
          setEmailSentSuccessfully(false);
          onClose();
          onVerified?.();
          return;
        }
        toast.info('Email not verified yet. Please check your inbox.');
      } catch (error) {
        console.error('Error refetching user data:', error);
        toast.error('Failed to check verification status');
      }
      return;
    }

    // Send verification email
    try {
      const response = await resendVerificationEmail({
        email: userData.email
      }).unwrap();
      toast.success(
        response.message ||
          'Verification email sent successfully. Please check your inbox.'
      );
      setEmailSentSuccessfully(true);
    } catch (error: unknown) {
      console.error('Error resending verification email:', error);
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message
          : undefined;
      toast.error(
        errorMessage || 'An error occurred while sending the verification email'
      );
    }
  };

  const getButtonText = () => {
    if (isResending || isLoadingUser) {
      return emailSentSuccessfully ? 'Checking...' : 'Sending...';
    }
    return emailSentSuccessfully ? 'Verify Now' : 'Get Verify Link';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="email-verification-dialog-title"
      PaperProps={{ sx: modalStyles.dialog }}
    >
      <DialogContent sx={modalStyles.dialogContent}>
        <Box sx={modalStyles.iconContainer}>
          <EmailIcon sx={modalStyles.emailIcon} />
        </Box>
        <Typography component="h2" variant="h6" sx={modalStyles.title}>
          Email Verification
        </Typography>
        <Typography variant="body2" sx={modalStyles.message}>
          Your Email is not verified yet. Please verify your email to continue.
        </Typography>
      </DialogContent>
      <DialogActions sx={modalStyles.dialogActions}>
        <Button
          onClick={handleVerifyEmail}
          variant="contained"
          disabled={isResending || isLoadingUser}
          sx={modalStyles.verifyButton}
        >
          {getButtonText()}
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={modalStyles.cancelButton}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const modalStyles = {
  dialog: {
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%'
  },
  dialogContent: {
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: '50%',
    width: '80px',
    height: '80px',
    marginBottom: '16px'
  },
  emailIcon: {
    fontSize: '48px',
    color: 'primary.main'
  },
  title: {
    fontWeight: 600,
    color: 'text.primary',
    marginBottom: '12px'
  },
  message: {
    color: 'text.secondary',
    marginBottom: '24px',
    textAlign: 'center'
  },
  dialogActions: {
    flexDirection: 'column',
    gap: '12px',
    padding: '0 24px 24px'
  },
  verifyButton: {
    backgroundColor: 'primary.main',
    color: 'white',
    width: '100%',
    '&:hover': {
      backgroundColor: 'primary.dark'
    },
    borderRadius: '8px',
    padding: '10px 24px',
    textTransform: 'none',
    fontWeight: 500
  },
  cancelButton: {
    width: '100%',
    borderColor: 'grey.300',
    color: 'text.secondary',
    borderRadius: '8px',
    padding: '10px 24px',
    textTransform: 'none',
    '&:hover': {
      borderColor: 'grey.400',
      backgroundColor: 'grey.50'
    }
  }
};
