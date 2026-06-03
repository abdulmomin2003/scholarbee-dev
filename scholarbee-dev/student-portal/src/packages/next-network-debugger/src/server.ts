import fs from 'fs';
import path from 'path';

const LOG_FILE_PATH = path.join(process.cwd(), '.network-debugger-logs.json');

export function initGlobalFetchLogging() {
  if (typeof window !== 'undefined') return;

  const originalFetch = global.fetch;

  global.fetch = async (url: string | URL | Request, init?: RequestInit) => {
    // Avoid logging our own polling calls
    const urlStr = url.toString();
    if (urlStr.includes('/api/qa-logs') || urlStr.includes('/api/network-debugger')) {
      return originalFetch(url, init);
    }

    const start = Date.now();
    let pageUrl = 'Server Fetch';

    // Try to get context from next/headers if possible
    try {
      const { headers } = await import('next/headers');
      const h = headers();
      pageUrl = h.get('x-url') || h.get('referer') || 'Server-side Fetch';
    } catch {
      // Not in request context
    }

    try {
      const response = await originalFetch(url, init);
      const duration = Date.now() - start;
      const clone = response.clone();

      let responseData: any = null;
      try {
        const text = await clone.text();
        try {
          responseData = JSON.parse(text);
        } catch {
          responseData = text;
        }
      } catch {
        responseData = 'Unreadable stream';
      }

      const logEntry = {
        id: `server-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString(),
        method: init?.method || 'GET',
        url: urlStr,
        status: response.status,
        duration,
        pageUrl,
        source: 'server',
        headers: init?.headers || {},
        params: init?.body || null,
        response: responseData
      };

      saveLog(logEntry);
      return response;
    } catch (err: any) {
      const duration = Date.now() - start;
      const logEntry = {
        id: `server-err-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString(),
        method: init?.method || 'GET',
        url: urlStr,
        status: 'FETCH_ERROR',
        duration,
        pageUrl,
        source: 'server',
        error: err?.message || String(err)
      };

      saveLog(logEntry);
      throw err;
    }
  };
}

function saveLog(log: any) {
  const g = global as any;
  if (!g._qa_logs) g._qa_logs = [];
  g._qa_logs.unshift(log);
  if (g._qa_logs.length > 200) g._qa_logs.pop();

  // Try to persist to file for local dev environments
  try {
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(g._qa_logs.slice(0, 100), null, 2));
  } catch {
    // Ignore FS errors
  }
}

export function createLogHandler() {
  return {
    async GET() {
      const g = global as any;
      let logs = g._qa_logs || [];
      
      if (fs.existsSync(LOG_FILE_PATH)) {
        try {
          const fileLogs = JSON.parse(fs.readFileSync(LOG_FILE_PATH, 'utf-8'));
          const memoryIds = new Set(logs.map((l: any) => l.id));
          fileLogs.forEach((l: any) => {
            if (!memoryIds.has(l.id)) logs.push(l);
          });
        } catch {}
      }

      return new Response(JSON.stringify(logs.slice(0, 100)), {
        headers: { 'Content-Type': 'application/json' }
      });
    },
    async DELETE() {
      (global as any)._qa_logs = [];
      if (fs.existsSync(LOG_FILE_PATH)) {
        try { fs.writeFileSync(LOG_FILE_PATH, '[]'); } catch {}
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}
