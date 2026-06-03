'use client';
import React from 'react';
import { useGetUserQuery } from '@/redux/api/userApi';
import Cookies from 'js-cookie';
import ExploreButton from './ExploreButton';

interface UserStatusFetcherProps {
  styles: any;
  initialLoggedIn?: boolean;
}

const UserStatusFetcher: React.FC<UserStatusFetcherProps> = ({
  styles,
  initialLoggedIn = false
}) => {
  // Use a local state for immediate cookie check to prevent flicker
  const [hasToken, setHasToken] = React.useState<boolean>(initialLoggedIn);
  const [mounted, setMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Re-verify cookie on mount to handle edge cases/client-only state
    const verify = () => {
      const token = Cookies.get('access_token');
      setHasToken(!!token);
    };

    verify();
    setMounted(true);

    window.addEventListener('focus', verify);
    window.addEventListener('visibilitychange', verify);
    return () => {
      window.removeEventListener('focus', verify);
      window.removeEventListener('visibilitychange', verify);
    };
  }, []);

  // Check if user is logged in via API for more robust check
  const {
    data: userData,
    currentData: currentUserData,
    isLoading: isLoadingUser
  } = useGetUserQuery(
    { isCritical: false },
    {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: true, // Also allow RTK Query to re-verify on focus
      refetchOnReconnect: true
    }
  );

  // Consider logged in if:
  // 1. Pre-mount: use initialLoggedIn (from server cookies)
  // 2. Post-mount: use detected hasToken (client cookies) OR the API result
  const isLoggedIn = mounted
    ? hasToken || (!isLoadingUser && (currentUserData || userData))
    : initialLoggedIn;

  return <ExploreButton isLoggedIn={!!isLoggedIn} styles={styles} />;
};

export default UserStatusFetcher;
