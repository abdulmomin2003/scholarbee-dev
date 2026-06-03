import fs from 'fs';
import path from 'path';
import { isProduction } from '@/config/config';

const LOG_FILE_PATH = path.join(process.cwd(), '.qa-logs.json');

// Memory cache for non-persistent environments (like Vercel)
if (!(global as any)._qa_logs) {
  (global as any)._qa_logs = [];
}

export function logServerRequest(entry: any) {
  if (isProduction) return;

  try {
    const freshEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...entry
    };

    // Primary: Global memory cache
    (global as any)._qa_logs.unshift(freshEntry);
    if ((global as any)._qa_logs.length > 50) {
      (global as any)._qa_logs = (global as any)._qa_logs.slice(0, 50);
    }

    // Secondary: File system backup (if available)
    try {
      let fileLogs: any[] = [];
      if (fs.existsSync(LOG_FILE_PATH)) {
        fileLogs = JSON.parse(fs.readFileSync(LOG_FILE_PATH, 'utf-8'));
      }
      fileLogs.unshift(freshEntry);
      if (fileLogs.length > 50) fileLogs = fileLogs.slice(0, 50);
      fs.writeFileSync(
        LOG_FILE_PATH,
        JSON.stringify(fileLogs, null, 2),
        'utf-8'
      );
    } catch {
      // Ignore FS errors in serverless
    }
  } catch (err) {
    console.error('[QA] Log write error:', err);
  }
}

/**
 * A global patch for fetch on the server to log all API calls for QA.
 * Call this once in the root layout or early server-side entry point.
 */
export function initGlobalFetchLogging() {
  if (
    typeof window !== 'undefined' ||
    isProduction ||
    (global as any)._fetchPatched
  ) {
    return;
  }

  const originalFetch = global.fetch || globalThis.fetch;

  const patchedFetch = async function (
    url: string | URL | Request,
    init?: RequestInit
  ) {
    const fetchUrl = url instanceof Request ? url.url : String(url);
    const start = Date.now();
    const method = init?.method || 'GET';
    const requestHeaders = init?.headers || {};
    const body = init?.body || null;

    // Skip self-logging or internal log API
    if (fetchUrl.includes('/api/qa-logs')) {
      return originalFetch(url, init);
    }

    const pageUrl = 'Global Fetch Patch';
    // Removed headers() call to avoid context-errors in many next.js environments

    try {
      const response = await originalFetch(url, init);
      const duration = Date.now() - start;

      // Clone response to read it
      const clone = response.clone();
      let responseData: any = null;
      try {
        const text = await clone.text();
        try {
          responseData = JSON.parse(text);
        } catch {
          responseData = text;
        }
      } catch (e) {
        responseData = 'Could not read response body';
      }

      logServerRequest({
        url: fetchUrl,
        pageUrl,
        method,
        headers: requestHeaders,
        params: body ? String(body) : null,
        status: response.status,
        response: responseData,
        duration
      });

      console.log(
        `[QA Inspector] LOGGED: ${method} ${fetchUrl} (${response.status})`
      );

      return response;
    } catch (error: any) {
      const duration = Date.now() - start;
      logServerRequest({
        url: fetchUrl,
        pageUrl,
        method,
        headers: requestHeaders,
        params: body ? String(body) : null,
        status: 'GLOBAL_FETCH_ERROR',
        error: error?.message || String(error),
        duration
      });
      console.error(
        `[QA Inspector] FAILED: ${method} ${fetchUrl} - ${error?.message}`
      );
      throw error;
    }
  };

  global.fetch = patchedFetch;
  globalThis.fetch = patchedFetch;
  (global as any)._fetchPatched = true;
  console.log(
    '✅ QA Inspector: Global fetch logging initialized server-side (patched global and globalThis)'
  );
}

/**
 * A manual wrapper for fetch to log server-side API calls for QA.
 * Use this in place of global fetch in server components/utility files.
 */
export async function fetchWithLogging(url: string, init?: RequestInit) {
  return fetch(url, init); // Global patch handles it now
}
