'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getAuthStatus } from '@/utils/cookieManager';
import { refreshToken } from '@/lib/axiosWithAuth';

// Component to check token validity and refresh if needed before rendering children
export default function TokenRefreshCheck({
  children
}: {
  children: React.ReactNode;
}) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const { hasRefreshToken, isTokenExpired } = getAuthStatus();

        // If we have a refresh token but the access token is expired
        if (hasRefreshToken && isTokenExpired) {
          console.log('Access token expired, trying to refresh');
          await refreshToken();
        }
      } catch (error) {
        console.error('Error during token validation on profile page:', error);
        // No need to redirect here as the API calls will trigger 401 errors
        // which will be handled by our interceptors
      } finally {
        setIsChecking(false);
      }
    };

    checkToken();
  }, []);

  if (isChecking) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
