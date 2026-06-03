export type StatusTab = 'all' | 'success' | 'failed';
export type MethodFilter = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type SourceFilter = 'all' | 'client' | 'server';

export interface QADataLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status: number | string;
  duration: number;
  pageUrl?: string;
  source: 'client' | 'server';
  headers?: Record<string, string>;
  params?: any;
  response?: any;
  error?: string;
}

export interface StatusTabConfig {
  key: StatusTab;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  filter: (log: QADataLog) => boolean;
}
