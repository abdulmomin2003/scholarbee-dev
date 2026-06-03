'use client';

import React, { useState } from 'react';
import { useQAInterceptor } from './lib/useQAInterceptor';
import {
  STATUS_TABS,
  METHOD_FILTERS,
  BugIcon,
  FilterIcon,
  CloseIcon,
  SearchIcon,
  HistoryIcon
} from './lib/constants';
import { DEBUGGER_CSS } from './lib/styles';
import LogItem from './components/LogItem';

interface NetworkDebuggerProps {
  enabled?: boolean;
  pollInterval?: number;
  maxLogs?: number;
  apiRoute?: string;
  position?: 'left' | 'right';
}

export const NetworkDebugger: React.FC<NetworkDebuggerProps> = ({
  enabled = process.env.NODE_ENV !== 'production',
  pollInterval = 5000,
  maxLogs = 100,
  apiRoute = '/api/qa-logs',
  position = 'left'
}) => {
  const {
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
  } = useQAInterceptor(enabled, pollInterval, maxLogs, apiRoute);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  if (!enabled) return null;

  return (
    <div className="nnd-root">
      <style dangerouslySetInnerHTML={{ __html: DEBUGGER_CSS }} />

      {!isOpen && (
        <button 
          className="nnd-fab" 
          onClick={() => setIsOpen(true)}
          style={{ [position]: 24, right: position === 'right' ? 24 : 'auto', left: position === 'left' ? 24 : 'auto' }}
        >
          <BugIcon size={28} />
          <div className="nnd-dot" />
        </button>
      )}

      {isOpen && (
        <>
          <div className="nnd-backdrop" onClick={() => setIsOpen(false)} />
          <div className={`nnd-drawer nnd-${position}`}>
            <div className="nnd-header">
              <div className="nnd-row-between" style={{ marginBottom: 20 }}>
                <div className="nnd-row" style={{ gap: 12 }}>
                  <div
                    style={{
                      background: 'rgba(56,189,248,0.1)',
                      padding: 10,
                      borderRadius: 10,
                      color: '#38bdf8'
                    }}
                  >
                    <BugIcon size={22} />
                  </div>
                  <div>
                    <h1 className="nnd-title">Next Debugger</h1>
                    <p className="nnd-subtitle">NETWORK TELEMETRY ENGINE</p>
                  </div>
                </div>

                <div className="nnd-row" style={{ gap: 8 }}>
                  <button className="nnd-icon-btn nnd-danger" onClick={handleClear} title="Clear Logs">
                    <HistoryIcon size={18} />
                  </button>
                  <button className="nnd-icon-btn" onClick={() => setShowFilters(!showFilters)} title="Config">
                    <FilterIcon size={18} />
                  </button>
                  <button className="nnd-icon-btn" onClick={() => setIsOpen(false)}>
                    <CloseIcon size={18} />
                  </button>
                </div>
              </div>

              <div className="nnd-row-between" style={{ gap: 12, marginBottom: 16 }}>
                <div className="nnd-tabs">
                  {STATUS_TABS.map((t) => (
                    <button
                      key={t.key}
                      className={`nnd-tab${activeTab === t.key ? ' active' : ''}`}
                      style={
                        {
                          '--nnd-tab-color': t.color,
                          '--nnd-tab-bg': t.bgColor
                        } as React.CSSProperties
                      }
                      onClick={() => setActiveTab(t.key)}
                    >
                      {t.icon} {t.label.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="nnd-row" style={{ gap: 6 }}>
                  {(['all', 'client', 'server'] as const).map((s) => (
                    <button
                      key={s}
                      className={`nnd-source-btn${activeSource === s ? ' active' : ''}`}
                      onClick={() => setActiveSource(s)}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="nnd-search-container">
                <div className="nnd-search-icon">
                  <SearchIcon size={18} />
                </div>
                <input
                  className="nnd-search-input"
                  placeholder="Filter APIs, status codes, or payload fragments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {showFilters && (
                <div style={{ padding: '12px 0 0 0', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 12 }}>
                  <label className="nnd-row" style={{ gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={showNextNoise}
                      onChange={(e) => setShowNextNoise(e.target.checked)}
                      style={{ width: 14, height: 14, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Show Framework Traffic (_next, prefetch)</span>
                  </label>
                </div>
              )}
            </div>

            <div
              className="nnd-row"
              style={{
                background: '#020617',
                padding: '10px 24px',
                gap: 8,
                flexWrap: 'wrap',
                borderBottom: '1px solid rgba(255,255,255,0.04)'
              }}
            >
              <span className="nnd-subtitle" style={{ marginRight: 8 }}>METHODS</span>
              <button
                className={`nnd-source-btn${activeMethod === null ? ' active' : ''}`}
                onClick={() => setActiveMethod(null)}
              >
                ANY ({methodCounts.ANY})
              </button>
              {METHOD_FILTERS.map((m) => {
                const isSelected = activeMethod === m.key;
                const count = methodCounts[m.key] || 0;
                return (
                  <button
                    key={m.key}
                    className="nnd-source-btn"
                    style={{
                      background: isSelected ? m.color : m.bg,
                      color: isSelected ? '#000' : m.color,
                      borderColor: 'transparent',
                      opacity: count === 0 ? 0.3 : 1
                    }}
                    onClick={() => setActiveMethod(isSelected ? null : m.key)}
                  >
                    {m.key} ({count})
                  </button>
                );
              })}
            </div>

            <div className="nnd-content">
              {filteredLogs.length === 0 ? (
                <div className="nnd-empty">
                  <HistoryIcon size={64} color="rgba(255,255,255,0.05)" />
                  <p className="nnd-subtitle">STAYING QUIET</p>
                </div>
              ) : (
                filteredLogs.slice(0, 40).map((log) => (
                  <LogItem
                    key={log.id}
                    log={log}
                    copiedId={copiedId}
                    setCopiedId={setCopiedId}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
