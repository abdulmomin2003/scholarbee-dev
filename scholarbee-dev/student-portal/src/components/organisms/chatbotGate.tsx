'use client';

import React, { useCallback, useEffect, useState } from 'react';
import nextDynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { getAuthStatus } from '@/utils/cookieManager';

const DynamicChatbotWidget = nextDynamic(
  () => import('@/components/organisms/chatbotWidget'),
  { ssr: false },
);

/**
 * Renders BeeBot only for logged-in students (valid session), not on auth pages.
 */
export default function ChatbotGate() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const verifyAuth = useCallback(() => {
    const status = getAuthStatus();
    setIsLoggedIn(
      (status.hasToken && !status.isTokenExpired) ||
        (status.hasRefreshToken && !status.isRefreshTokenExpired),
    );
  }, []);

  useEffect(() => {
    setMounted(true);
    verifyAuth();

    const handleReverify = () => verifyAuth();
    window.addEventListener('focus', handleReverify);
    window.addEventListener('visibilitychange', handleReverify);
    window.addEventListener('authLogout', handleReverify);

    return () => {
      window.removeEventListener('focus', handleReverify);
      window.removeEventListener('visibilitychange', handleReverify);
      window.removeEventListener('authLogout', handleReverify);
    };
  }, [verifyAuth]);

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/sign-up' ||
    pathname?.startsWith('/auth') ||
    pathname === '/forgot-password';

  if (!mounted || isAuthPage || !isLoggedIn) {
    return null;
  }

  return <DynamicChatbotWidget />;
}
