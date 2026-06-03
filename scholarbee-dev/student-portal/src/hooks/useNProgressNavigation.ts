'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import NProgress from 'nprogress';

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200
});

export const useNProgressNavigation = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigateWithProgress = (url: string) => {
    NProgress.start();

    startTransition(() => {
      router.push(url);
      // setTimeout(() => {
      //   NProgress.done();
      // }, 100);
    });
  };

  const replaceWithProgress = (url: string) => {
    NProgress.start();

    startTransition(() => {
      router.replace(url);
      setTimeout(() => {
        NProgress.done();
      }, 100);
    });
  };

  return {
    navigateWithProgress,
    replaceWithProgress,
    isPending,
    router
  };
};
