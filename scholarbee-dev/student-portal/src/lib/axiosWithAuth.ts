import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios';
import Cookies from 'js-cookie';
import { AuthApi } from '@/endpoints/auth';
import { RefreshTokenResponse } from '@/types/authTypes';
import { clearSocketInstances } from './socket';
import { setAuthTokens, clearAuthCookies } from '@/utils/cookieManager';
import { API_BASE_URL_DEV } from '@/config/config';

// Create an instance of AuthApi
const authApi = new AuthApi();

// Token refresh promise holder
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let refreshTokenPromise: Promise<any> | null = null;

let shouldReconnectSocketsAfterRefresh = false;

let socketReconnectionScheduled = false;

let isPageLoadRefresh = true;

// Create an axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL_DEV,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to handle logout and redirect to login page
const handleLogoutAndRedirect = (isCritical = true) => {
  if (typeof window !== 'undefined') {
    try {
      clearSocketInstances();
    } catch (e) {
      console.error('Error clearing socket instances:', e);
    }
  }

  // Use the cookie manager to clear cookies properly
  clearAuthCookies();

  // Notify all components (e.g. navbar) that auth has been cleared
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('authLogout'));
  }

  if (isCritical && typeof window !== 'undefined') {
    setTimeout(() => {
      const currentPath = window.location.pathname + window.location.search;

      if (!window.location.pathname.includes('/login')) {
        console.log('Redirecting to login page due to authentication failure');
        // Force redirect to login page with the current path as redirect parameter
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }, 0);
  }
};

// Function to refresh token that can be shared across multiple requests
const refreshTokenFn = async () => {
  const refreshToken = Cookies.get('refresh_token');

  if (!refreshToken) {
    console.log('No refresh token available');
    throw new Error('No refresh token available');
  }

  const refreshResponse = await authApi.refreshToken(refreshToken);

  if (refreshResponse?.success && refreshResponse.data) {
    console.log('Token refreshed successfully, updating cookies');

    // Save the new tokens
    const tokenData = refreshResponse.data as RefreshTokenResponse;

    if (!tokenData.token || !tokenData.refreshToken) {
      throw new Error('Invalid token response format');
    }

    // Use proper cookie configuration
    setAuthTokens({
      token: tokenData.token,
      refreshToken: tokenData.refreshToken
    });

    shouldReconnectSocketsAfterRefresh = isPageLoadRefresh;
    isPageLoadRefresh = false;

    // Optional: Dispatch Redux update event if you want to keep some sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tokenRefreshed', {
          detail: tokenData
        })
      );
    }

    return tokenData;
  } else {
    console.error('Token refresh failed:', refreshResponse);
    throw new Error('Token refresh failed');
  }
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const isCritical =
        originalRequest.headers?.['X-Critical-Request'] !== 'false';

      // Check if we have a refresh token before attempting refresh
      const hasRefreshToken = Cookies.get('refresh_token');

      // Only attempt token refresh if we have a refresh token
      // If no refresh token exists, user was never logged in, so don't redirect
      if (hasRefreshToken) {
        try {
          if (!refreshTokenPromise) {
            refreshTokenPromise = refreshTokenFn();
          }

          try {
            const tokenData = await refreshTokenPromise;

            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] =
                `Bearer ${tokenData.token}`;
            }

            if (
              shouldReconnectSocketsAfterRefresh &&
              !socketReconnectionScheduled
            ) {
              socketReconnectionScheduled = true;

              setTimeout(() => {
                import('./socket')
                  .then((socketModule) => {
                    if (
                      typeof socketModule.reconnectWithNewToken === 'function'
                    ) {
                      console.log(
                        'Reconnecting sockets after token refresh on page load'
                      );
                      socketModule.reconnectWithNewToken(
                        false,
                        isPageLoadRefresh
                      );
                    }
                    shouldReconnectSocketsAfterRefresh = false;
                    socketReconnectionScheduled = false;
                  })
                  .catch((err) => {
                    console.error(
                      'Failed to import socket module for reconnection:',
                      err
                    );
                    socketReconnectionScheduled = false;
                  });
              }, 1000);
            }

            return axiosInstance(originalRequest);
          } finally {
            refreshTokenPromise = null;
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);

          handleLogoutAndRedirect(isCritical);

          return Promise.reject(error);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const makeNonCriticalRequest = (config: AxiosRequestConfig) => {
  const newConfig = {
    ...config,
    headers: {
      ...config.headers,
      'X-Critical-Request': 'false' // Use custom header instead
    }
  };
  return axiosInstance(newConfig);
};

const resetPageLoadFlag = () => {
  isPageLoadRefresh = false;
};

// Export the refreshTokenFn for use in other parts of the app
export const refreshToken = async () => {
  resetPageLoadFlag();

  if (!refreshTokenPromise) {
    refreshTokenPromise = refreshTokenFn();
  }

  try {
    const result = await refreshTokenPromise;

    if (typeof window !== 'undefined' && !socketReconnectionScheduled) {
      socketReconnectionScheduled = true;

      setTimeout(() => {
        console.log(
          'Token refreshed successfully, existing socket connections will use the new token automatically'
        );
        socketReconnectionScheduled = false;
      }, 500);
    }

    return result;
  } finally {
    refreshTokenPromise = null;
  }
};

export const logoutAndRedirect = handleLogoutAndRedirect;

export default axiosInstance;
