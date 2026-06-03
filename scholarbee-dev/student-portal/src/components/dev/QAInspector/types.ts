export interface QADataLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status: number | string;
  duration: number;
  pageUrl: string;
  source: 'client' | 'server';
  headers?: Record<string, string>;
  params?: Record<string, unknown> | string | null;
  response?: Record<string, unknown> | string | null;
  error?: string;
}

export type StatusTab = 'all' | 'success' | 'failed';
export type MethodFilter = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type SourceFilter = 'all' | 'client' | 'server';

export interface JsonTreeProps {
  data: unknown;
  depth?: number;
  initialExpanded?: boolean;
}
