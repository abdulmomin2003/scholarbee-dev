'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { setAuthTokens, setUserData } from '@/utils/cookieManager';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth } from '@/redux/slices/authSlice';
import { userApi } from '@/redux/api/userApi';

function OAuthCallbackContent() {
  const params = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleAuth = async () => {
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');
      const userId = params.get('userId');
      const redirect = params.get('redirect') || '/';

      if (accessToken && refreshToken) {
        setAuthTokens({ token: accessToken, refreshToken });
        if (userId) setUserData(userId);
        dispatch(setAuth({ token: accessToken, refreshToken, user: null }));

        // Ensure redirect is a relative path to prevent open redirect vulnerabilities
        const safeRedirect =
          redirect && redirect.startsWith('/') && !redirect.startsWith('//')
            ? redirect
            : '/';

        try {
          // Fetch user profile to check if onboarding is needed
          const result = await dispatch(
            userApi.endpoints.getUser.initiate({ isCritical: false })
          ).unwrap();

          if (result?.onboarding_preferences?.degree_goal) {
            // Already onboarded
            window.location.href = safeRedirect;
          } else {
            // Needs onboarding
            sessionStorage.setItem('from_signup', 'true');
            const onboardUrl =
              safeRedirect && safeRedirect !== '/'
                ? `/onboarding?redirect=${encodeURIComponent(safeRedirect)}`
                : '/onboarding';
            window.location.href = onboardUrl;
          }
        } catch (error) {
          console.error('Error fetching user profile during OAuth:', error);
          // Fallback to onboarding if we can't determine status
          sessionStorage.setItem('from_signup', 'true');
          window.location.href = '/onboarding';
        }
      } else {
        window.location.href = '/login';
      }
    };

    handleAuth();
  }, [dispatch, params]);

  return null;
}

export default function OAuthCallback() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
