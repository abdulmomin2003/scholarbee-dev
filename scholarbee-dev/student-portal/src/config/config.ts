// Check if RELEASE_ENV is explicitly set to 'true' (case-insensitive)
// If RELEASE_ENV is 'true' → use production config
// If RELEASE_ENV is undefined, null, false, or any other value → use development config
// Use NEXT_PUBLIC_RELEASE_ENV for client-side access, fallback to RELEASE_ENV for server-side
export const releaseEnv =
  process.env.NEXT_PUBLIC_RELEASE_ENV || process.env.RELEASE_ENV;
export const isProduction = releaseEnv?.toLowerCase() === 'true';

const isLocalEnv =
  String(
    process.env.NEXT_PUBLIC_IS_LOCAL || process.env.IS_LOCAL
  ).toLowerCase() === 'true';

// Common configuration values (shared across environments)
const commonConfig = {
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'AIzaSyDY8zremlhKI-hmpJwNMLdnlcTX2vnvHGk',
  NEXT_PUBLIC_API_CMS_URL: 'https://api.scholarbee.pk/api',
  NEXT_PUBLIC_S3_URL: 'https://scolarbee-s3-bucket.s3.us-east-1.amazonaws.com/'
} as const;

// Environment-specific configuration values
const environmentConfig = {
  local: {
    NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3010/api',
    NEXT_PUBLIC_CHAT_SOCKET_URL: 'ws://localhost:3010/chat',
    NEXT_PUBLIC_NOTIFICATION_SOCKET_URL: 'ws://localhost:3010/notifications'
  },
  development: {
    NEXT_PUBLIC_API_BASE_URL: 'https://api-dev.scholarbee.pk/api',
    NEXT_PUBLIC_CHAT_SOCKET_URL: 'wss://ws.api-dev.scholarbee.pk/chat',
    NEXT_PUBLIC_NOTIFICATION_SOCKET_URL:
      'wss://ws.api-dev.scholarbee.pk/notifications'
  },
  production: {
    NEXT_PUBLIC_API_BASE_URL: 'https://api-prod.scholarbee.pk/api',
    NEXT_PUBLIC_CHAT_SOCKET_URL: 'wss://ws.api-prod.scholarbee.pk/chat',
    NEXT_PUBLIC_NOTIFICATION_SOCKET_URL:
      'wss://ws.api-prod.scholarbee.pk/notifications'
  }
} as const;

// Type for config keys
type ConfigKey =
  | keyof typeof commonConfig
  | keyof typeof environmentConfig.development;

// Get config value: prioritize env var, then fallback to environment-specific config
const getConfig = (key: ConfigKey): string => {
  const envVar = process.env[key];
  if (envVar) return envVar;

  // Check common config first
  if (key in commonConfig) {
    return commonConfig[key as keyof typeof commonConfig];
  }

  // Then check environment-specific config
  const env = isProduction
    ? 'production'
    : isLocalEnv
      ? 'local'
      : 'development';
  return environmentConfig[env][
    key as keyof typeof environmentConfig.development
  ];
};

// Export configuration values
export const config = {
  GOOGLE_MAPS_API_KEY: getConfig('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'),
  API_CMS_URL: getConfig('NEXT_PUBLIC_API_CMS_URL'),
  API_BASE_URL: getConfig('NEXT_PUBLIC_API_BASE_URL'),
  API_BASE_URL_DEV: (() => {
    // Local full-stack dev wins over RELEASE_ENV (login can still use prod via RELEASE_ENV + prod cookies).
    if (isLocalEnv) {
      return environmentConfig.local.NEXT_PUBLIC_API_BASE_URL;
    }
    return isProduction
      ? environmentConfig.production.NEXT_PUBLIC_API_BASE_URL
      : environmentConfig.development.NEXT_PUBLIC_API_BASE_URL;
  })(),
  CHAT_SOCKET_URL: getConfig('NEXT_PUBLIC_CHAT_SOCKET_URL'),
  NOTIFICATION_SOCKET_URL: getConfig('NEXT_PUBLIC_NOTIFICATION_SOCKET_URL'),
  S3_URL: getConfig('NEXT_PUBLIC_S3_URL')
};

// Export individual values for convenience
export const GOOGLE_MAPS_API_KEY = config.GOOGLE_MAPS_API_KEY;
export const API_CMS_URL = config.API_CMS_URL;
export const API_BASE_URL = config.API_BASE_URL;
export const API_BASE_URL_DEV = config.API_BASE_URL_DEV;
export const CHAT_SOCKET_URL = config.CHAT_SOCKET_URL;
export const NOTIFICATION_SOCKET_URL = config.NOTIFICATION_SOCKET_URL;
export const S3_URL = config.S3_URL;
