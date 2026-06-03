/**
 * Next.js Instrumentation Hook
 * This file runs ONCE when the server starts (before any requests).
 * This is the correct place to initialize server-side global patches.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

const releaseEnv =
  process.env.NEXT_PUBLIC_RELEASE_ENV || process.env.RELEASE_ENV;
const isProduction = releaseEnv?.toLowerCase() === 'true';

export async function register() {
  if (isProduction) return;

  // Only run on the Node.js server runtime (not edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initGlobalFetchLogging } = await import('@/lib/serverLogging');
    initGlobalFetchLogging();
  }
}
