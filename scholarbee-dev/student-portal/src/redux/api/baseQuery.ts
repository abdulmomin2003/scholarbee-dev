import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery
} from '@reduxjs/toolkit/query';
import Cookies from 'js-cookie';
import { API_BASE_URL, API_BASE_URL_DEV } from '@/config/config';

type ExtendedFetchArgs = FetchArgs & {
  meta?: {
    isCritical?: boolean;
    useOldApi?: boolean;
  };
};

const createBaseQuery = (useOldApi: boolean = false) =>
  fetchBaseQuery({
    baseUrl: useOldApi ? API_BASE_URL : API_BASE_URL_DEV,
    prepareHeaders: (headers) => {
      const token = Cookies.get('access_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  });

const createBaseQueryWithReauth = (
  useOldApi: boolean = false
): BaseQueryFn<string | ExtendedFetchArgs, unknown, FetchBaseQueryError> => {
  const baseQuery = createBaseQuery(useOldApi);

  return async (args, api, extraOptions) => {
    let isCritical = true;

    if (typeof args !== 'string' && args.meta) {
      isCritical = args.meta.isCritical !== false;
    }

    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      // Check if we have a refresh token before attempting refresh
      const Cookies = (await import('js-cookie')).default;
      const hasRefreshToken = Cookies.get('refresh_token');

      // Only attempt token refresh if we have a refresh token
      // If no refresh token exists, user was never logged in, so don't redirect
      if (hasRefreshToken) {
        try {
          console.log('401 error detected, attempting token refresh...');

          const { refreshToken } = await import('@/lib/axiosWithAuth');
          const { setAuthTokens } = await import('@/utils/cookieManager');

          const tokenData = await refreshToken();

          if (tokenData?.token && tokenData?.refreshToken) {
            // Update cookies with proper configuration
            setAuthTokens({
              token: tokenData?.token,
              refreshToken: tokenData?.refreshToken
            });

            console.log(
              'Token refreshed successfully, retrying original request'
            );

            if (typeof args !== 'string') {
              args.headers = {
                ...args.headers,
                Authorization: `Bearer ${tokenData.token}`
              };
            }

            result = await baseQuery(args, api, extraOptions);
          }
        } catch (error) {
          console.error('Error during token refresh in baseQuery:', error);

          // Clear cookies immediately when token refresh fails
          const { clearAuthCookies } = await import('@/utils/cookieManager');
          clearAuthCookies();

          const { logoutAndRedirect } = await import('@/lib/axiosWithAuth');
          logoutAndRedirect(isCritical);
        }
      }
    }

    return result;
  };
};

export const baseQueryWithReauth = createBaseQueryWithReauth();
export const baseQueryWithReauthOld = createBaseQueryWithReauth(true);

// For backwards compatibility with existing code that uses axiosBaseQuery
export const axiosBaseQuery = () => {
  console.warn(
    'axiosBaseQuery is deprecated. Use baseQueryWithReauth instead.'
  );
  return baseQueryWithReauth;
};
