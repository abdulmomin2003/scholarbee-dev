import React, { memo, useState, useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import {
  ArrowRight as ArrowRightIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { JsonTreeProps } from './types';

interface JsonNodeProps {
  data: unknown;
  depth?: number;
  initialExpanded?: boolean;
  searchQuery?: string;
}

const highlight = (text: string, query: string) => {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <Box
        component="mark"
        sx={{
          bgcolor: '#fbbf24',
          color: '#020617',
          borderRadius: '2px',
          px: '1px'
        }}
      >
        {text.slice(idx, idx + query.length)}
      </Box>
      {text.slice(idx + query.length)}
    </>
  );
};

const primitiveColor = (val: unknown): string => {
  if (val === null || val === undefined) return '#64748b';
  if (typeof val === 'string') return '#34d399';
  if (typeof val === 'number') return '#fbbf24';
  if (typeof val === 'boolean') return '#a78bfa';
  return '#94a3b8';
};

const Primitive = ({
  value,
  searchQuery
}: {
  value: unknown;
  searchQuery?: string;
}) => {
  const isStr = typeof value === 'string';
  const display = isStr ? `"${value}"` : String(value);
  return (
    <Typography
      component="span"
      sx={{
        color: primitiveColor(value),
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: 'inherit',
        wordBreak: 'break-all'
      }}
    >
      {searchQuery ? highlight(display, searchQuery) : display}
    </Typography>
  );
};

function generateJsPreview(data: unknown, maxLen = 120): string {
  if (data === null) return 'null';
  if (data === undefined) return 'undefined';
  if (typeof data === 'string') return `"${data}"`;
  if (typeof data === 'number' || typeof data === 'boolean')
    return String(data);

  if (Array.isArray(data)) {
    let str = '[';
    for (let i = 0; i < data.length; i++) {
      if (i > 0) str += ', ';
      str += generateJsPreview(data[i], maxLen - str.length);
      if (str.length >= maxLen) {
        return str + '...';
      }
    }
    str += ']';
    return str;
  }

  if (typeof data === 'object') {
    let str = '{';
    const keys = Object.keys(data as Record<string, unknown>);
    for (let i = 0; i < keys.length; i++) {
      if (i > 0) str += ', ';
      const key = keys[i];
      const val = (data as Record<string, unknown>)[key];
      const needsQuotes = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
      const keyStr = needsQuotes ? `"${key}"` : key;
      str += `${keyStr}: ${generateJsPreview(val, maxLen - str.length)}`;
      if (str.length >= maxLen) {
        return str + '...';
      }
    }
    str += '}';
    return str;
  }

  return String(data);
}

const JsonNode = memo(
  ({
    data,
    depth = 0,
    initialExpanded = false,
    searchQuery = ''
  }: JsonNodeProps) => {
    const autoExpand = depth < 1 || initialExpanded;
    const [isExpanded, setIsExpanded] = useState(autoExpand);
    const previewText = useMemo(() => generateJsPreview(data), [data]);

    if (data === null || data === undefined) {
      return <Primitive value={data} searchQuery={searchQuery} />;
    }

    if (typeof data !== 'object') {
      return <Primitive value={data} searchQuery={searchQuery} />;
    }

    const isArray = Array.isArray(data);
    const typedData = data as Record<string, unknown>;
    const keys = Object.keys(typedData);

    if (keys.length === 0) {
      return (
        <Typography
          component="span"
          sx={{
            color: '#475569',
            fontFamily: 'monospace',
            fontSize: 'inherit'
          }}
        >
          {isArray ? '[ ]' : '{ }'}
        </Typography>
      );
    }

    const closeBracket = isArray ? ']' : '}';

    return (
      <Box sx={{ display: 'inline-block', width: '100%' }}>
        <Stack
          direction="row"
          spacing={0.3}
          alignItems="center"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ cursor: 'pointer', display: 'inline-flex', userSelect: 'none' }}
        >
          {isExpanded ? (
            <ArrowDropDownIcon
              sx={{ fontSize: 16, color: '#64748b', flexShrink: 0 }}
            />
          ) : (
            <ArrowRightIcon
              sx={{ fontSize: 16, color: '#64748b', flexShrink: 0 }}
            />
          )}
          <Typography
            component="span"
            sx={{
              color: '#cbd5e1',
              fontSize: 'inherit',
              fontFamily: '"JetBrains Mono", monospace',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '700px'
            }}
          >
            {searchQuery ? highlight(previewText, searchQuery) : previewText}
          </Typography>
        </Stack>

        {isExpanded && (
          <>
            <Box
              sx={{
                ml: 2,
                borderLeft: '1px solid rgba(255,255,255,0.04)',
                pl: 1.5,
                mt: 0.3
              }}
            >
              {keys.map((key, i) => {
                const val = typedData[key];
                const isNestedObj = val !== null && typeof val === 'object';
                const isLast = i === keys.length - 1;
                const needsQuotes = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
                const keyLabel = needsQuotes ? `"${key}"` : key;

                return (
                  <Box
                    key={key}
                    sx={{
                      mb: 0.25,
                      display: 'flex',
                      flexWrap: 'nowrap',
                      alignItems: 'flex-start'
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        color: isArray ? '#94a3b8' : '#93c5fd',
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 'inherit',
                        mr: 0.5,
                        flexShrink: 0
                      }}
                    >
                      {searchQuery
                        ? highlight(keyLabel, searchQuery)
                        : keyLabel}
                      <Typography
                        component="span"
                        sx={{ color: '#475569', mx: 0.3 }}
                      >
                        :
                      </Typography>
                    </Typography>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <JsonNode
                        data={val}
                        depth={depth + 1}
                        searchQuery={searchQuery}
                      />
                      {!isNestedObj && !isLast && (
                        <Typography
                          component="span"
                          sx={{
                            color: '#475569',
                            fontFamily: 'monospace',
                            fontSize: 'inherit'
                          }}
                        >
                          ,
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Typography
              component="span"
              sx={{
                color: '#64748b',
                fontFamily: 'monospace',
                fontSize: 'inherit',
                display: 'block',
                ml: 2
              }}
            >
              {closeBracket}
            </Typography>
          </>
        )}
      </Box>
    );
  }
);

JsonNode.displayName = 'JsonNode';

/**
 * Public wrapper — keeps the same API as before (JsonTreeProps) but
 * now accepts an optional searchQuery for in-tree highlighting.
 */
const JsonTree = memo(
  ({
    data,
    depth = 0,
    initialExpanded = false,
    searchQuery = ''
  }: JsonTreeProps & { searchQuery?: string }) => {
    return (
      <JsonNode
        data={data}
        depth={depth}
        initialExpanded={initialExpanded}
        searchQuery={searchQuery}
      />
    );
  }
);

JsonTree.displayName = 'JsonTree';
export default JsonTree;
