import React, { memo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  InputAdornment,
  ListItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  PublicOutlined as PublicIcon,
  Terminal as CurlIcon,
  ContentCopy as CopyIcon,
  SecurityOutlined as HeadersIcon,
  TerminalOutlined as PayloadIcon,
  CodeOutlined as CodeIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { QADataLog } from './types';
import { METHOD_FILTERS, PageIcon } from './constants';
import { formatUrlTitle, generateCurlCommand, isLogError } from './utils';
import JsonTree from './JsonTree';

interface LogItemProps {
  log: QADataLog;
  copiedId: string | null;
  setCopiedId: (id: string | null) => void;
  formatSize: (data: unknown) => string;
}

const LogItem = memo(
  ({ log, copiedId, setCopiedId, formatSize }: LogItemProps) => {
    const [expanded, setExpanded] = useState(false);
    const [responseSearch, setResponseSearch] = useState('');
    const isError = isLogError(log);

    const handleCopyAsCurl = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent accordion from toggling twice or weird behavior
      const curl = generateCurlCommand(log);
      navigator.clipboard.writeText(curl);
      setCopiedId(`${log.id}-curl`);
      setTimeout(() => setCopiedId(null), 2000);
    };

    const sColor = isError
      ? '#fb7185'
      : typeof log.status === 'number' && log.status < 400
        ? '#34d399'
        : '#fbbf24';

    const methodConfig = METHOD_FILTERS.find(
      (m) => m.key === log.method?.toUpperCase()
    );

    return (
      <ListItem disablePadding>
        <Accordion
          elevation={0}
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
          sx={{
            width: '100%',
            borderRadius: '12px !important',
            bgcolor: '#0f172a',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: '0.1s',
            '&:hover': {
              borderColor: 'rgba(56, 189, 248, 0.3)',
              bgcolor: '#11192d'
            },
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#334155' }} />}
            sx={{
              px: 2,
              '& .MuiAccordionSummary-content': {
                my: '12px !important',
                gap: 2,
                alignItems: 'center'
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 54
              }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                  color: sColor,
                  fontSize: '0.9rem',
                  lineHeight: 1.1
                }}
              >
                {log.status}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.55rem',
                  fontWeight: 800,
                  color: '#475569',
                  mt: 0.2
                }}
              >
                {log.duration}ms
              </Typography>
            </Box>

            <Box
              sx={{
                px: 1,
                py: 0.4,
                borderRadius: '4px',
                bgcolor:
                  log.source === 'client'
                    ? 'rgba(56, 189, 248, 0.1)'
                    : 'rgba(167, 139, 250, 0.1)',
                color: log.source === 'client' ? '#38bdf8' : '#a78bfa',
                fontSize: '0.6rem',
                fontWeight: 900,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {log.source.toUpperCase()}
            </Box>

            <Box
              sx={{
                px: 1,
                py: 0.4,
                borderRadius: '4px',
                bgcolor: methodConfig?.bg || '#1e293b',
                color: methodConfig?.color || '#94a3b8',
                fontSize: '0.6rem',
                fontWeight: 900,
                minWidth: 44,
                textAlign: 'center'
              }}
            >
              {log.method}
            </Box>

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: '#f1f5f9',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {formatUrlTitle(log.url)}
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails
            sx={{
              bgcolor: '#020617',
              p: 3,
              borderTop: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '0 0 12px 12px'
            }}
          >
            {expanded && (
              <Stack spacing={3.5}>
                <Box
                  sx={{
                    pb: 1,
                    borderBottom: '1px solid rgba(255,255,255,0.04)'
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Typography
                      sx={{
                        color: '#475569',
                        fontWeight: 900,
                        fontSize: '0.65rem',
                        letterSpacing: '0.05em'
                      }}
                    >
                      TARGET URL
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Copy Absolute Path">
                        <IconButton
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(log.url);
                            setCopiedId(`${log.id}-url`);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          sx={{
                            color:
                              copiedId === `${log.id}-url`
                                ? '#34d399'
                                : '#334155'
                          }}
                        >
                          {copiedId === `${log.id}-url` ? (
                            <CheckIcon sx={{ fontSize: 16 }} />
                          ) : (
                            <PublicIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy cURL Command">
                        <IconButton
                          size="small"
                          onClick={handleCopyAsCurl}
                          sx={{
                            color:
                              copiedId === `${log.id}-curl`
                                ? '#34d399'
                                : '#334155'
                          }}
                        >
                          {copiedId === `${log.id}-curl` ? (
                            <CheckIcon sx={{ fontSize: 16 }} />
                          ) : (
                            <CurlIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Typography
                    sx={{
                      color: '#38bdf8',
                      fontSize: '0.75rem',
                      wordBreak: 'break-all',
                      fontWeight: 500,
                      fontFamily: '"JetBrains Mono", monospace'
                    }}
                  >
                    {log.url}
                  </Typography>
                </Box>

                {log.pageUrl && (
                  <Box
                    sx={{
                      pb: 1,
                      borderBottom: '1px solid rgba(255,255,255,0.04)'
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 1 }}
                    >
                      <Typography
                        sx={{
                          color: '#475569',
                          fontWeight: 900,
                          fontSize: '0.65rem',
                          letterSpacing: '0.05em'
                        }}
                      >
                        SOURCE PAGE (CALLER)
                      </Typography>
                      <IconButton
                        size="small"
                        component="a"
                        href={log.pageUrl}
                        target="_blank"
                        sx={{ color: '#334155' }}
                      >
                        <PageIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Stack>
                    <Typography
                      sx={{
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        wordBreak: 'break-all',
                        fontWeight: 500,
                        fontFamily: '"JetBrains Mono", monospace'
                      }}
                    >
                      {log.pageUrl}
                    </Typography>
                  </Box>
                )}

                {(
                  [
                    {
                      label: 'Headers',
                      icon: <HeadersIcon />,
                      content: log.headers,
                      color: '#818cf8',
                      isResponse: false as const
                    },
                    {
                      label: 'Payload',
                      icon: <PayloadIcon />,
                      content: log.params,
                      color: '#fbbf24',
                      show: !!log.params,
                      isResponse: false as const
                    },
                    {
                      label: 'Response',
                      icon: <CodeIcon />,
                      content: log.response,
                      color: '#34d399',
                      isResponse: true as const
                    }
                  ] as {
                    label: string;
                    icon: React.ReactElement;
                    content: unknown;
                    color: string;
                    show?: boolean;
                    isResponse: boolean;
                  }[]
                ).map(
                  (s, idx) =>
                    s.show !== false && (
                      <Box key={idx}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 1.2 }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.2}
                          >
                            <Box sx={{ color: s.color, display: 'flex' }}>
                              {s.icon}
                            </Box>
                            <Typography
                              sx={{
                                fontSize: '0.7rem',
                                fontWeight: 900,
                                color: '#64748b',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}
                            >
                              {s.label}{' '}
                              {!!s.content && (
                                <Typography
                                  component="span"
                                  sx={{
                                    ml: 1,
                                    opacity: 0.5,
                                    fontSize: '0.6rem'
                                  }}
                                >
                                  ({formatSize(s.content as unknown)})
                                </Typography>
                              )}
                            </Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                          >
                            {s.isResponse &&
                              !!(s.content as unknown) &&
                              typeof (s.content as unknown) === 'object' && (
                                <TextField
                                  size="small"
                                  placeholder="Search response..."
                                  value={responseSearch}
                                  onChange={(e) =>
                                    setResponseSearch(e.target.value)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  sx={{
                                    width: 180,
                                    '& .MuiOutlinedInput-root': {
                                      height: 26,
                                      fontSize: '0.65rem',
                                      color: '#f8fafc',
                                      bgcolor: '#0f172a',
                                      borderRadius: '6px',
                                      '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.08)'
                                      },
                                      '&:hover fieldset': {
                                        borderColor: 'rgba(56,189,248,0.4)'
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: '#38bdf8',
                                        borderWidth: '1px'
                                      }
                                    },
                                    '& .MuiInputBase-input': { py: 0, px: 1 }
                                  }}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <SearchIcon
                                          sx={{
                                            color: '#475569',
                                            fontSize: 14
                                          }}
                                        />
                                      </InputAdornment>
                                    )
                                  }}
                                />
                              )}
                            <IconButton
                              size="small"
                              onClick={() => {
                                const text =
                                  typeof s.content === 'object'
                                    ? JSON.stringify(s.content, null, 2)
                                    : String(s.content);
                                navigator.clipboard.writeText(text);
                                setCopiedId(`${log.id}-sec-${idx}`);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              sx={{
                                color:
                                  copiedId === `${log.id}-sec-${idx}`
                                    ? '#34d399'
                                    : '#334155'
                              }}
                            >
                              {copiedId === `${log.id}-sec-${idx}` ? (
                                <CheckIcon sx={{ fontSize: 14 }} />
                              ) : (
                                <CopyIcon sx={{ fontSize: 14 }} />
                              )}
                            </IconButton>
                          </Stack>
                        </Stack>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: '10px',
                            bgcolor: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.03)',
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            overflow: 'auto',
                            maxHeight: 450,
                            fontFamily: '"JetBrains Mono", monospace'
                          }}
                        >
                          <JsonTree
                            data={s.content}
                            initialExpanded
                            searchQuery={s.isResponse ? responseSearch : ''}
                          />
                        </Box>
                      </Box>
                    )
                )}

                {log.error && (
                  <Paper
                    sx={{
                      p: 2.5,
                      bgcolor: 'rgba(244, 63, 94, 0.03)',
                      border: '1px solid rgba(244, 63, 94, 0.2)',
                      borderRadius: '10px'
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#f43f5e',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        mb: 1
                      }}
                    >
                      CRITICAL EXCEPTION
                    </Typography>
                    <Typography
                      sx={{
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        fontFamily: '"JetBrains Mono", monospace'
                      }}
                    >
                      {log.error}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      </ListItem>
    );
  }
);

LogItem.displayName = 'LogItem';
export default LogItem;
