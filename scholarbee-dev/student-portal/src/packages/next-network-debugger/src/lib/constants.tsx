import React from 'react';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  HistoryIcon
} from '../components/icons';
import { QADataLog, StatusTabConfig } from './types';

export const STATUS_TABS: StatusTabConfig[] = [
  {
    key: 'all',
    label: 'All Activity',
    icon: <HistoryIcon size={14} />,
    color: '#94a3b8',
    bgColor: 'rgba(148,163,184,0.1)',
    filter: () => true
  },
  {
    key: 'success',
    label: 'Success',
    icon: <CheckCircleIcon size={14} />,
    color: '#34d399',
    bgColor: 'rgba(52,211,153,0.1)',
    filter: (l: QADataLog) => typeof l.status === 'number' && l.status < 400
  },
  {
    key: 'failed',
    label: 'Errors',
    icon: <AlertCircleIcon size={14} />,
    color: '#f43f5e',
    bgColor: 'rgba(244,63,94,0.1)',
    filter: (l: QADataLog) =>
      (typeof l.status === 'number' && l.status >= 400) ||
      typeof l.status === 'string'
  }
];

export const METHOD_FILTERS = [
  { key: 'GET', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  { key: 'POST', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  { key: 'PUT', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  { key: 'PATCH', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  { key: 'DELETE', color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' }
] as const;

export {
  BugIcon,
  CloseIcon,
  FilterIcon,
  HistoryIcon,
  SearchIcon,
  ChevronDown as ExpandIcon,
  ExternalLinkIcon as PageIcon
} from '../components/icons';
