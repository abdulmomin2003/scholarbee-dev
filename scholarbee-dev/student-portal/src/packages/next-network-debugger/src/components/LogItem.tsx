import { memo, useMemo, useState } from 'react';
import {
  CheckIcon,
  ChevronDown,
  CodeIcon,
  CopyIcon,
  ExternalLinkIcon,
  GlobeIcon,
  ShieldIcon,
  TerminalIcon
} from './icons';
import { QADataLog } from '../lib/types';
import {
  formatSize,
  formatUrlTitle,
  generateCurlCommand,
  isLogError
} from '../lib/utils';
import JsonTree from './JsonTree';
import { METHOD_FILTERS } from '../lib/constants';

interface LogItemProps {
  log: QADataLog;
  copiedId: string | null;
  setCopiedId: (id: string | null) => void;
}

const LogItem = memo(({ log, copiedId, setCopiedId }: LogItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const { statusColor, methodStyle } = useMemo(() => {
    const isErr = isLogError(log);
    const m = METHOD_FILTERS.find((f) => f.key === log.method?.toUpperCase());
    return {
      statusColor: isErr ? '#fb7185' : '#34d399',
      methodStyle: m || { color: '#94a3b8', bg: '#1e293b' }
    };
  }, [log]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const sections = useMemo(
    () => [
      {
        label: 'Headers',
        icon: <ShieldIcon size={14} />,
        content: log.headers,
        color: '#818cf8',
        show: true
      },
      {
        label: 'Payload',
        icon: <TerminalIcon size={14} />,
        content: log.params,
        color: '#fbbf24',
        show: !!log.params
      },
      {
        label: 'Response',
        icon: <CodeIcon size={14} />,
        content: log.response,
        color: '#34d399',
        show: true
      }
    ],
    [log]
  );

  const urlTitle = useMemo(() => formatUrlTitle(log.url), [log.url]);

  return (
    <div className={`nnd-log ${expanded ? 'open' : ''}`}>
      <div className="nnd-log-header" onClick={() => setExpanded(!expanded)}>
        <div className="nnd-log-status">
          <span className="nnd-log-status-code" style={{ color: statusColor }}>
            {log.status}
          </span>
          <span className="nnd-log-status-ms">{log.duration}ms</span>
        </div>

        <div className="nnd-row" style={{ gap: 6 }}>
          <span
            className="nnd-badge"
            style={{
              background:
                log.source === 'client'
                  ? 'rgba(56,189,248,0.1)'
                  : 'rgba(167,139,250,0.1)',
              color: log.source === 'client' ? '#38bdf8' : '#a78bfa'
            }}
          >
            {log.source.toUpperCase()}
          </span>
          <span
            className="nnd-badge"
            style={{ background: methodStyle.bg, color: methodStyle.color }}
          >
            {log.method}
          </span>
        </div>

        <span className="nnd-log-url">{urlTitle}</span>

        <span className={`nnd-log-expand ${expanded ? 'open' : ''}`}>
          <ChevronDown size={16} />
        </span>
      </div>

      {expanded && (
        <div className="nnd-log-details">
          <div className="nnd-separator">
            <div className="nnd-row-between" style={{ marginBottom: 6 }}>
              <span className="nnd-section-label">TARGET URL</span>
              <div className="nnd-row" style={{ gap: 4 }}>
                <button
                  className="nnd-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    copy(log.url, `${log.id}-url`);
                  }}
                >
                  {copiedId === `${log.id}-url` ? (
                    <CheckIcon size={14} color="#34d399" />
                  ) : (
                    <GlobeIcon size={14} />
                  )}
                </button>
                <button
                  className="nnd-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    copy(generateCurlCommand(log), `${log.id}-curl`);
                  }}
                >
                  {copiedId === `${log.id}-curl` ? (
                    <CheckIcon size={14} color="#34d399" />
                  ) : (
                    <TerminalIcon size={14} />
                  )}
                </button>
              </div>
            </div>
            <span className="nnd-mono nnd-url-display">{log.url}</span>
          </div>

          {log.pageUrl && (
            <div className="nnd-separator">
              <div className="nnd-row-between" style={{ marginBottom: 6 }}>
                <span className="nnd-section-label">SOURCE PAGE (CALLER)</span>
                <a
                  href={log.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nnd-icon-btn"
                >
                  <ExternalLinkIcon size={14} />
                </a>
              </div>
              <span className="nnd-mono nnd-page-display">{log.pageUrl}</span>
            </div>
          )}

          {sections.map(
            (s, idx) =>
              s.show && (
                <div key={idx} style={{ marginBottom: 20 }}>
                  <div className="nnd-section-header">
                    <div className="nnd-section-icon-label">
                      <span style={{ color: s.color, display: 'flex' }}>
                        {s.icon}
                      </span>
                      <span className="nnd-section-label">
                        {s.label}
                        {s.content && (
                          <span className="nnd-size-hint">
                            ({formatSize(s.content)})
                          </span>
                        )}
                      </span>
                    </div>
                    <button
                      className="nnd-icon-btn"
                      onClick={() =>
                        copy(
                          typeof s.content === 'object'
                            ? JSON.stringify(s.content, null, 2)
                            : String(s.content || ''),
                          `${log.id}-s${idx}`
                        )
                      }
                    >
                      {copiedId === `${log.id}-s${idx}` ? (
                        <CheckIcon size={12} color="#34d399" />
                      ) : (
                        <CopyIcon size={12} />
                      )}
                    </button>
                  </div>
                  <div className="nnd-section-box">
                    <JsonTree
                      data={s.content}
                      initialExpanded={s.label !== 'Headers'}
                    />
                  </div>
                </div>
              )
          )}

          {log.error && (
            <div className="nnd-error-box">
              <div className="nnd-error-title">ERROR</div>
              <span className="nnd-mono" style={{ color: '#fda4af' }}>
                {log.error}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

LogItem.displayName = 'LogItem';
export default LogItem;
