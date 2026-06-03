import { CssBaseline } from '@mui/material';
import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import 'slick-carousel/slick/slick.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-phone-number-input/style.css';
import './nprogress.css';
import { GoogleAnalytics } from '@next/third-parties/google';
// Import SSR-safe providers directly (no dynamic import needed)
import ThemeProviderWrapper from '@/components/providers/ThemeProviderWrapper';
import ReduxProvider from '../redux/reduxProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import NProgressProviderWrapper from '@/components/providers/NProgressProviderWrapper';
import ClientWidgets from './layout/ClientWidgets';
import QAInspector from '@/components/dev/QAInspector';
import { initGlobalFetchLogging } from '@/packages/next-network-debugger/src/server';

export const metadata: Metadata = {
  title:
    'Apply to Top Universities & Find Scholarships - Pakistan | ScholarBee.pk',
  description:
    "Discover Pakistan's first smart platform where students can explore top universities, apply with ease, and find verified scholarships—all in one place.",
  keywords:
    'universities Pakistan, scholarships Pakistan, student applications, higher education Pakistan, university admissions, scholarship opportunities, study in Pakistan',
  authors: [{ name: 'ScholarBee' }],
  creator: 'ScholarBee',
  publisher: 'ScholarBee',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  metadataBase: new URL('https://scholarbee.pk'),
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      ur: '/',
      'x-default': '/'
    }
  },
  openGraph: {
    title:
      'Apply to Top Universities & Find Scholarships - Pakistan | ScholarBee.pk',
    description:
      "Discover Pakistan's first smart platform where students can explore top universities, apply with ease, and find verified scholarships—all in one place.",
    url: 'https://scholarbee.pk',
    siteName: 'ScholarBee',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'ScholarBee – Apply to top universities and find scholarships in Pakistan'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Apply to Top Universities & Find Scholarships - Pakistan | ScholarBee',
    description:
      "Discover Pakistan's first smart platform where students can explore top universities, apply with ease, and find verified scholarships—all in one place.",
    images: [
      {
        url: '/og-image.jpeg',
        alt: 'ScholarBee – Apply to top universities and find scholarships in Pakistan'
      }
    ]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}
export default function RootLayout({
  children,
  params: { locale }
}: Readonly<RootLayoutProps>) {
  // Enable server-side fetch instrumentation for local dev when explicitly allowed
  try {
    if (
      process.env.NEXT_PUBLIC_ENABLE_INSTRUMENTATION === 'true' &&
      process.env.NEXT_PUBLIC_IS_LOCAL === 'true'
    ) {
      initGlobalFetchLogging();
    }
  } catch (err) {
    // ignore errors in instrumentation initialization
  }
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://scholarbee.pk/#organization',
        name: 'ScholarBee',
        url: 'https://scholarbee.pk',
        logo: 'https://scholarbee.pk/assets/svg/logo.svg',
        description:
          "Pakistan's first smart platform where students can explore top universities, apply with ease, and find verified scholarships.",
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'info@scholarbee.pk',
          contactType: 'customer service',
          areaServed: 'PK'
        }
      },
      {
        '@type': 'WebSite',
        '@id': 'https://scholarbee.pk/#website',
        url: 'https://scholarbee.pk',
        name: 'ScholarBee – Find Universities & Scholarships in Pakistan',
        description:
          "Discover Pakistan's first smart platform where students can explore top universities, apply with ease, and find verified scholarships.",
        publisher: { '@id': 'https://scholarbee.pk/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate:
              'https://scholarbee.pk/programs?search={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  };

  return (
    <html lang={locale || 'en'}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ThemeProviderWrapper>
            <ReduxProvider>
              <LanguageProvider>
                <CssBaseline />
                <NProgressProviderWrapper>{children}</NProgressProviderWrapper>
                <ClientWidgets />
              </LanguageProvider>
            </ReduxProvider>
            <ToastContainer />
          </ThemeProviderWrapper>
        </AppRouterCacheProvider>
        <GoogleAnalytics gaId="G-3WVJ1XV971" />
        <QAInspector />
      </body>
    </html>
  );
}
