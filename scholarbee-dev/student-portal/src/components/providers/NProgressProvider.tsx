'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

// Configure NProgress globally
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200
});

export default function NProgressProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleStart = () => {
      // Disable NProgress on contact us page
      if (pathname === '/contact-us') {
        return;
      }
      NProgress.start();
    };
    const handleComplete = () => NProgress.done();

    window.addEventListener('beforeunload', handleStart);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
      handleComplete();
    };
  }, [pathname]);

  return <>{children}</>;
}
