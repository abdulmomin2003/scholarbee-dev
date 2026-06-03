import React, { memo, useState } from 'react';
import { ChevronRight } from './icons';

interface JsonTreeProps {
  data: any;
  depth?: number;
  initialExpanded?: boolean;
}

const JsonTree = memo(function JsonTree({
  data,
  depth = 0,
  initialExpanded = false
}: JsonTreeProps) {
  const [expanded, setExpanded] = useState(depth === 0 || initialExpanded);

  if (data === null) {
    return <span className="nnd-json-null nnd-mono">null</span>;
  }
  if (data === undefined) {
    return <span className="nnd-json-null nnd-mono">undefined</span>;
  }

  if (typeof data !== 'object') {
    if (typeof data === 'number') {
      return <span className="nnd-json-number nnd-mono">{data}</span>;
    }
    if (typeof data === 'boolean') {
      return <span className="nnd-json-boolean nnd-mono">{String(data)}</span>;
    }
    return (
      <span className="nnd-json-string nnd-mono">
        &quot;{String(data)}&quot;
      </span>
    );
  }

  const isArray = Array.isArray(data);
  const keys = Object.keys(data);

  if (keys.length === 0) {
    return (
      <span className="nnd-json-null nnd-mono">{isArray ? '[]' : '{}'}</span>
    );
  }

  return (
    <span style={{ display: 'inline-block', width: '100%' }}>
      <button
        className="nnd-json-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <ChevronRight
          size={14}
          color="#475569"
          style={{
            transition: 'transform .15s',
            transform: expanded ? 'rotate(90deg)' : 'none',
            flexShrink: 0
          }}
        />
        <span className="nnd-json-summary nnd-mono">
          {isArray ? `Array(${keys.length})` : `Object {${keys.length}}`}
        </span>
      </button>
      {expanded && (
        <div className="nnd-json-children">
          {keys.map((key) => (
            <div
              key={key}
              style={{
                display: 'flex',
                gap: 4,
                marginBottom: 1,
                alignItems: 'flex-start'
              }}
            >
              <span
                className="nnd-json-key nnd-mono"
                style={{ opacity: 0.8, flexShrink: 0 }}
              >
                {key}:
              </span>
              <JsonTree data={data[key]} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </span>
  );
});

export default JsonTree;
