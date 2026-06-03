import { QADataLog } from './types';

/**
 * Robust check for log error status
 */
export const isLogError = (log: QADataLog): boolean => {
  return (
    (typeof log.status === 'number' && log.status >= 400) ||
    log.status.toString().includes('ERROR') ||
    !!log.error
  );
};

/**
 * Format raw data size for readable display
 */
export const formatSize = (data: unknown): string => {
  if (!data) return '0 B';
  try {
    const bytes = new TextEncoder().encode(JSON.stringify(data)).length;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  } catch {
    return 'Size Unknown';
  }
};

/**
 * Clean up URLs for high-density display
 */
export const formatUrlTitle = (url: string): string => {
  try {
    const path = new URL(url).pathname;
    if (path.length <= 40) return path;
    return `...${path.slice(-37)}`;
  } catch {
    return url.length > 40 ? `...${url.slice(-37)}` : url;
  }
};

/**
 * Generate a cURL command for debugging reproduction
 */
export const generateCurlCommand = (log: QADataLog): string => {
  let curl = `curl -X ${log.method} '${log.url}'`;
  if (log.headers) {
    Object.entries(log.headers).forEach(([k, v]) => {
      curl += ` -H '${k}: ${v}'`;
    });
  }
  if (log.params) {
    const body =
      typeof log.params === 'string' ? log.params : JSON.stringify(log.params);
    curl += ` -d '${body}'`;
  }
  return curl;
};
