import { QADataLog } from './types';

export const isLogError = (log: QADataLog) => {
  if (log.error) return true;
  if (typeof log.status === 'number' && log.status >= 400) return true;
  if (typeof log.status === 'string' && log.status !== 'OK' && log.status !== '200') return true;
  return false;
};

export const formatSize = (data: any) => {
  const str = typeof data === 'string' ? data : JSON.stringify(data || '');
  const bytes = new TextEncoder().encode(str).length;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

export const generateCurlCommand = (log: QADataLog) => {
  const { method, url, headers, params } = log;
  let curl = `curl -X ${method} '${url}'`;
  
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      curl += ` -H '${key}: ${value}'`;
    });
  }
  
  if (params) {
    const body = typeof params === 'object' ? JSON.stringify(params) : params;
    curl += ` -d '${body}'`;
  }
  
  return curl;
};

export const formatUrlTitle = (url: string) => {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname + parsed.search;
    return path.length > 50 ? '...' + path.substring(path.length - 47) : path;
  } catch {
    return url.length > 50 ? '...' + url.substring(url.length - 47) : url;
  }
};
