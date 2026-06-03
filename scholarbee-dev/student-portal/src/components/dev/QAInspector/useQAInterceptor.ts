import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { METHOD_FILTERS, STATUS_TABS } from './constants';
import { MethodFilter, QADataLog, SourceFilter, StatusTab } from './types';

export function useQAInterceptor(showDebugger: boolean) {
  const [serverLogs, setServerLogs] = useState<QADataLog[]>([]);
  const [clientLogs, setClientLogs] = useState<QADataLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Filtering & Search
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [activeMethod, setActiveMethod] = useState<MethodFilter | null>(null);
  const [activeSource, setActiveSource] = useState<SourceFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNextNoise, setShowNextNoise] = useState(false);

  const clientPatched = useRef(false);

  const fetchServerLogs = useCallback(async () => {
    if (!showDebugger) return;
    try {
      const res = await fetch('/api/qa-logs');
      if (res.ok) {
        const data = await res.json();
        const logsWithSource = (Array.isArray(data) ? data : []).map(
          (l: Record<string, unknown>) => ({
            ...l,
            source: 'server' as const
          })
        ) as QADataLog[];
        setServerLogs(logsWithSource);
      }
    } catch (err) {
      console.error('QA Inspector server fetch error:', err);
    }
  }, [showDebugger]);

  const handleClear = async () => {
    try {
      await fetch('/api/qa-logs', { method: 'DELETE' });
      setServerLogs([]);
      setClientLogs([]);
    } catch (err) {
      console.error('QA Inspector clear error:', err);
    }
  };

  // Client-side interceptor
  useEffect(() => {
    if (!showDebugger || clientPatched.current) return;
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] instanceof Request ? args[0].url : String(args[0]);
      if (url.includes('/api/qa-logs')) return originalFetch(...args);

      const start = Date.now();
      const method = (args[1]?.method || 'GET').toUpperCase();
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - start;
        const clone = response.clone();

        let responseData: unknown = null;
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

        const logEntry: QADataLog = {
          id: `client-${Math.random().toString(36).substring(7)}`,
          timestamp: new Date().toISOString(),
          method,
          url,
          status: response.status,
          duration,
          pageUrl: window.location.href,
          source: 'client',
          headers: args[1]?.headers as Record<string, string>,
          params: args[1]?.body as string | null,
          response: responseData as Record<string, unknown> | string | null
        };
        setClientLogs((prev) => [logEntry, ...prev].slice(0, 100));
        return response;
      } catch (err: unknown) {
        const duration = Date.now() - start;
        const logEntry: QADataLog = {
          id: `client-err-${Math.random().toString(36).substring(7)}`,
          timestamp: new Date().toISOString(),
          method,
          url,
          status: 'FETCH_ERROR',
          duration,
          pageUrl: window.location.href,
          source: 'client',
          error: err instanceof Error ? err.message : String(err)
        };
        setClientLogs((prev) => [logEntry, ...prev].slice(0, 100));
        throw err;
      }
    };
    clientPatched.current = true;
  }, [showDebugger]);

  // Polling server logs
  useEffect(() => {
    if (!showDebugger || !isOpen) return;
    fetchServerLogs();
    const interval = setInterval(fetchServerLogs, 5000);
    return () => clearInterval(interval);
  }, [isOpen, showDebugger, fetchServerLogs]);

  const filteredLogs = useMemo(() => {
    let combined = [...clientLogs, ...serverLogs];

    if (!showNextNoise) {
      combined = combined.filter(
        (l) =>
          !l.url.includes('/_next/') &&
          !l.url.includes('webpack') &&
          !l.url.includes('hot-update')
      );
    }

    const tabFilterObj = STATUS_TABS.find((t) => t.key === activeTab);
    if (tabFilterObj) combined = combined.filter(tabFilterObj.filter);

    if (activeSource !== 'all')
      combined = combined.filter((l) => l.source === activeSource);
    if (activeMethod)
      combined = combined.filter(
        (l) => l.method?.toUpperCase() === activeMethod
      );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      combined = combined.filter(
        (l) =>
          l.url.toLowerCase().includes(q) ||
          l.method.toLowerCase().includes(q) ||
          (l.status && l.status.toString().includes(q)) ||
          (l.params && JSON.stringify(l.params).toLowerCase().includes(q)) ||
          (l.response && JSON.stringify(l.response).toLowerCase().includes(q))
      );
    }

    return combined.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [
    clientLogs,
    serverLogs,
    activeTab,
    activeSource,
    activeMethod,
    searchQuery,
    showNextNoise
  ]);

  const methodCounts = useMemo(() => {
    const counts: Record<string, number> = { ANY: filteredLogs.length };
    METHOD_FILTERS.forEach((m) => {
      counts[m.key] = filteredLogs.filter(
        (l) => l.method?.toUpperCase() === m.key
      ).length;
    });
    return counts;
  }, [filteredLogs]);

  return {
    isOpen,
    setIsOpen,
    filteredLogs,
    activeTab,
    setActiveTab,
    activeMethod,
    setActiveMethod,
    activeSource,
    setActiveSource,
    searchQuery,
    setSearchQuery,
    showNextNoise,
    setShowNextNoise,
    handleClear,
    methodCounts
  };
}
