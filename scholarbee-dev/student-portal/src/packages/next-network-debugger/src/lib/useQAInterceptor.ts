import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { METHOD_FILTERS, STATUS_TABS } from './constants';
import { MethodFilter, QADataLog, SourceFilter, StatusTab } from './types';

export function useQAInterceptor(
  enabled: boolean,
  pollInterval = 5000,
  maxLogs = 100,
  apiRoute = '/api/qa-logs'
) {
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
    if (!enabled) return;
    try {
      const res = await fetch(apiRoute);
      if (res.ok) {
        const data = await res.json();
        const logsWithSource = (Array.isArray(data) ? data : []).map(
          (l: any) => ({
            ...l,
            source: 'server' as const
          })
        ) as QADataLog[];
        setServerLogs(logsWithSource);
      }
    } catch (err) {
      console.error('Next Debugger server fetch error:', err);
    }
  }, [enabled, apiRoute]);

  const handleClear = async () => {
    try {
      await fetch(apiRoute, { method: 'DELETE' });
      setServerLogs([]);
      setClientLogs([]);
    } catch (err) {
      console.error('Next Debugger clear error:', err);
    }
  };

  // Client-side interceptor
  useEffect(() => {
    if (!enabled || clientPatched.current) return;
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const url = args[0] instanceof Request ? args[0].url : String(args[0]);
      
      // Avoid intercepting our own polling calls
      if (url.includes(apiRoute)) return originalFetch(...args);

      const start = Date.now();
      const method = (args[1]?.method || 'GET').toUpperCase();
      
      try {
        const response = await originalFetch(...args);
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

        const logEntry: QADataLog = {
          id: `client-${Math.random().toString(36).substring(7)}`,
          timestamp: new Date().toISOString(),
          method,
          url,
          status: response.status,
          duration,
          pageUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
          source: 'client',
          headers: args[1]?.headers as Record<string, string>,
          params: args[1]?.body as string | null,
          response: responseData
        };
        
        setClientLogs((prev) => [logEntry, ...prev].slice(0, maxLogs));
        return response;
      } catch (err: any) {
        const duration = Date.now() - start;
        const logEntry: QADataLog = {
          id: `client-err-${Math.random().toString(36).substring(7)}`,
          timestamp: new Date().toISOString(),
          method,
          url,
          status: 'FETCH_ERROR',
          duration,
          pageUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
          source: 'client',
          error: err?.message || String(err)
        };
        
        setClientLogs((prev) => [logEntry, ...prev].slice(0, maxLogs));
        throw err;
      }
    };
    
    clientPatched.current = true;
  }, [enabled, apiRoute, maxLogs]);

  // Polling server logs
  useEffect(() => {
    if (!enabled || !isOpen) return;
    fetchServerLogs();
    const interval = setInterval(fetchServerLogs, pollInterval);
    return () => clearInterval(interval);
  }, [isOpen, enabled, fetchServerLogs, pollInterval]);

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
