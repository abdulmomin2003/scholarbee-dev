import {
  API_BASE_URL,
  API_BASE_URL_DEV,
  API_CMS_URL,
  S3_URL as CONFIG_S3_URL
} from '@/config/config';

export const API_URL = API_BASE_URL;
export const API_URL_DEV = API_BASE_URL_DEV;
// export const API_URL = 'http://localhost:3010/api';
// export const API_URL_DEV = 'http://localhost:3010/api';
export const S3_URL = CONFIG_S3_URL;
// Export API_CMS_URL as NEXT_PUBLIC_API_CMS_URL for backward compatibility
export const NEXT_PUBLIC_API_CMS_URL = API_CMS_URL;
