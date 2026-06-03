import { COLORS } from '@/constants/colors';
import { Box, Typography, Link } from '@mui/material';
import React from 'react';

const AuthFooter = () => {
  return (
    <Box sx={{ pb: 2, mt: 'auto' }} data-test-id="auth-footer">
      <Typography variant="body2" color="textSecondary" align="center">
        <Link
          href="/terms-and-conditions"
          sx={{
            '&:hover': {
              color: COLORS.primaryDark,
              fontWeight: '500'
            }
          }}
          data-test-id="terms-and-conditions-link"
        >
          Terms and Conditions
        </Link>
        {' • '}
        <Link
          href="/privacy-policy"
          sx={{
            '&:hover': {
              color: COLORS.primaryDark,
              fontWeight: '500'
            }
          }}
          data-test-id="privacy-policy-link"
        >
          Privacy Policy
        </Link>
      </Typography>
    </Box>
  );
};

export default AuthFooter;
