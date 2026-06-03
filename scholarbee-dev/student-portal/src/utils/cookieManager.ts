import Cookies from 'js-cookie';

interface TokenData {
  token: string;
  refreshToken: string;
}

// Proper cookie configuration
const getCookieOptions = () => ({
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
});

// Set tokens with proper cookie configuration
export const setAuthTokens = (tokenData: TokenData): void => {
  const cookieOptions = getCookieOptions();

  if (tokenData?.token) {
    Cookies.set('access_token', tokenData?.token, cookieOptions);
  }
  if (tokenData?.refreshToken) {
    Cookies.set('refresh_token', tokenData?.refreshToken, cookieOptions);
  }
};

// Set user data with proper cookie configuration
export const setUserData = (userId?: string): void => {
  const cookieOptions = getCookieOptions();

  if (userId) {
    Cookies.set('userId', userId, cookieOptions);
  }
};

// Clear all auth cookies
export const clearAuthCookies = (): void => {
  const cookieOptions = getCookieOptions();

  // Remove cookies with the same options used when setting them
  Cookies.remove('access_token', cookieOptions);
  Cookies.remove('refresh_token', cookieOptions);
  Cookies.remove('userId', cookieOptions);
  Cookies.remove('user', cookieOptions);

  // Also try removing without options as fallback
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  Cookies.remove('userId');
  Cookies.remove('user');
};

// Simple token validation utility (for client-side checks if needed)
export const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    return !payload.exp || payload.exp <= currentTime;
  } catch {
    return true;
  }
};

// Get auth status from cookies
export const getAuthStatus = () => {
  const token = Cookies.get('access_token');
  const refreshToken = Cookies.get('refresh_token');

  // For refresh tokens, they might not be JWTs. If it is a JWT, check its expiration.
  // If it's not a JWT (doesn't contain '.'), assume it's valid as long as it exists.
  const isRefreshExpired = refreshToken
    ? refreshToken.includes('.')
      ? isTokenExpired(refreshToken)
      : false
    : true;

  return {
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    isTokenExpired: token ? isTokenExpired(token) : true,
    isRefreshTokenExpired: isRefreshExpired
  };
};
