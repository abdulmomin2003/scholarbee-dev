import { QADataLog } from './types';
import { ReactNode } from 'react';
import {
  BugReport as BugIcon,
  Check as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  CodeOutlined as CodeIcon,
  ContentCopy as CopyIcon,
  Terminal as CurlIcon,
  DeleteOutline as DeleteIcon,
  ErrorOutline as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  SecurityOutlined as HeadersIcon,
  HistoryOutlined as HistoryIcon,
  TerminalOutlined as PayloadIcon,
  PublicOutlined as PublicIcon,
  Search as SearchIcon,
  CheckCircleOutline as SuccessIcon,
  LaunchOutlined as PageIcon
} from '@mui/icons-material';

export type StatusTab = 'all' | 'success' | 'failed';
export type MethodFilter = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type SourceFilter = 'all' | 'client' | 'server';

export const STATUS_TABS: {
  key: StatusTab;
  label: string;
  icon: ReactNode;
  color: string;
  bgColor: string;
  filter: (log: QADataLog) => boolean;
}[] = [
  {
    key: 'all',
    label: 'All Activity',
    icon: <HistoryIcon sx={{ fontSize: 16 }} />,
    color: '#818cf8',
    bgColor: 'rgba(129, 140, 248, 0.1)',
    filter: () => true
  },
  {
    key: 'success',
    label: 'Success',
    icon: <SuccessIcon sx={{ fontSize: 16 }} />,
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.1)',
    filter: (log) =>
      (typeof log.status === 'number' &&
        log.status >= 200 &&
        log.status < 400) ||
      (typeof log.status === 'string' && log.status.startsWith('2'))
  },
  {
    key: 'failed',
    label: 'Errors',
    icon: <ErrorIcon sx={{ fontSize: 16 }} />,
    color: '#fb7185',
    bgColor: 'rgba(251, 113, 133, 0.1)',
    filter: (log) =>
      (typeof log.status === 'number' && log.status >= 400) ||
      log.status.toString().includes('ERROR') ||
      !!log.error
  }
];

export const METHOD_FILTERS: {
  key: MethodFilter;
  color: string;
  bg: string;
}[] = [
  { key: 'GET', color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' },
  { key: 'POST', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
  { key: 'PUT', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' },
  { key: 'PATCH', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
  { key: 'DELETE', color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' }
];

export {
  BugIcon,
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  CodeIcon,
  CopyIcon,
  CurlIcon,
  DeleteIcon,
  ErrorIcon,
  ExpandMoreIcon,
  FilterIcon,
  HeadersIcon,
  HistoryIcon,
  PayloadIcon,
  PublicIcon,
  SearchIcon,
  SuccessIcon,
  PageIcon
};
