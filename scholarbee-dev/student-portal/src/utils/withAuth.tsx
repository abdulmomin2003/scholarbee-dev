/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Box, CircularProgress } from '@mui/material';

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  return function ProtectedRoute(props: any) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const token = Cookies.get('access_token');
      if (!token) {
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } else {
        setIsChecking(false);
      }
    }, [router]);

    if (isChecking) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh'
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    // If there's no token, don't render anything
    if (!Cookies.get('access_token')) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
