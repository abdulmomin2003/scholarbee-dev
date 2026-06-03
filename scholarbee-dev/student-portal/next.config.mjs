import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,

  experimental: {
    instrumentationHook: true,
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'lodash',
      'date-fns'
    ]
  },

  eslint: {
    ignoreDuringBuilds: true
  },

  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_API_CMS_URL: process.env.NEXT_PUBLIC_API_CMS_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_CHATBOT_API_URL: process.env.NEXT_PUBLIC_CHATBOT_API_URL,
    NEXT_PUBLIC_IS_LOCAL: process.env.NEXT_PUBLIC_IS_LOCAL,
    NEXT_PUBLIC_RELEASE_ENV: process.env.NEXT_PUBLIC_RELEASE_ENV,
    NEXT_PUBLIC_CHAT_SOCKET_URL: process.env.NEXT_PUBLIC_CHAT_SOCKET_URL,
    NEXT_PUBLIC_NOTIFICATION_SOCKET_URL:
      process.env.NEXT_PUBLIC_NOTIFICATION_SOCKET_URL,
    NEXT_PUBLIC_S3_URL: process.env.NEXT_PUBLIC_S3_URL,
    NEXT_PUBLIC_ENABLE_SIGN_UP_GOOGLE_SSO:
      process.env.NEXT_PUBLIC_ENABLE_SIGN_UP_GOOGLE_SSO
  },
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'styles')]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        axios: path.resolve(
          process.cwd(),
          'node_modules/axios/dist/browser/axios.cjs'
        ),
        buffer: path.resolve(process.cwd(), 'node_modules/buffer/index.js'),
        ieee754: path.resolve(process.cwd(), 'node_modules/ieee754/index.js'),
        'base64-js': path.resolve(
          process.cwd(),
          'node_modules/base64-js/index.js'
        )
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'scolarbee-bucket.s3.amazonaws.com' },
      {
        protocol: 'https',
        hostname: 'scolarbee-s3-bucket.s3.us-east-1.amazonaws.com'
      },
      { protocol: 'https', hostname: 'storage.googleapis.com' },

      // ⚠️ This one is wrong in your current file (hostname should NOT include https://)
      // You can remove it safely:
      // { protocol: 'https', hostname: 'https://scolarbee-s3-bucket.s3.us-east-1.amazonaws.com' },

      { protocol: 'https', hostname: 'maps.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' }
    ]
  },
  output: 'standalone'
};

export default withNextIntl(nextConfig);
