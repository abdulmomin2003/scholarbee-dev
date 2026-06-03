import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { resetAdmissionState } from '@/redux/slices/admissionSlice';
import { AuthApi } from '@/endpoints/auth';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { RefreshTokenResponse } from '@/types/authTypes';
import { clearAuthCookies } from '@/utils/cookieManager';

export const useLogout = () => {
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const authApi = new AuthApi();

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks

    setIsLoggingOut(true);

    try {
      const token = Cookies.get('access_token');
      const refreshToken = Cookies.get('refresh_token');

      if (!token && !refreshToken) {
        // No tokens available, just perform client-side logout
        performClientSideLogout();
        return;
      }

      try {
        if (token) {
          // Try to logout with the current token
          const logoutResponse = await authApi.logout(token);

          if (logoutResponse.success) {
            performClientSideLogout();
            return;
          }
        }

        if (refreshToken) {
          try {
            const refreshResponse = await authApi.refreshToken(refreshToken);

            if (refreshResponse.success && refreshResponse.data) {
              const tokenData = refreshResponse.data as RefreshTokenResponse;

              if (tokenData.token) {
                const logoutResponse = await authApi.logout(tokenData.token);

                if (logoutResponse.success) {
                  console.log('Logout successful after token refresh');
                }
              }
            }
          } catch (refreshError) {
            console.error(
              'Error refreshing token before logout:',
              refreshError
            );
          }
        }
      } catch (error) {
        console.error('Error during logout:', error);
        toast.error('Error during logout. Please try again.');
      }

      performClientSideLogout();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      performClientSideLogout();
    }
  };

  const performClientSideLogout = () => {
    clearAuthCookies();
    dispatch(logout());
    dispatch(resetAdmissionState());

    window.location.href = '/login';
  };

  return { handleLogout, isLoggingOut };
};
