'use client';

import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  Chip,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  Menu,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  Zoom
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import { isProduction } from '@/config/config';
import { useQAInterceptor } from './useQAInterceptor';
import {
  STATUS_TABS,
  METHOD_FILTERS,
  BugIcon,
  FilterIcon,
  CloseIcon,
  SearchIcon,
  HistoryIcon
} from './constants';
import { inspectorStyles, globalStyles } from './styles';
import { formatSize } from './utils';
import LogItem from './LogItem';

export default function QAInspector() {
  const showDebugger = !isProduction;
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
  } = useQAInterceptor(showDebugger);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [drawerWidth, setDrawerWidth] = useState(700);
  const [isResizing, setIsResizing] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(
    null
  );

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = drawerWidth;

    const handleResizeMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      if (newWidth >= 320 && newWidth <= window.innerWidth) {
        setDrawerWidth(newWidth);
      }
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleToggleFullscreen = () => {
    if (drawerWidth >= window.innerWidth - 40) {
      setDrawerWidth(700);
    } else {
      setDrawerWidth(window.innerWidth);
    }
  };

  if (!showDebugger) return null;

  return (
    <>
      <style jsx global>
        {globalStyles}
      </style>

      <Zoom in={!isOpen}>
        <Tooltip
          title={
            <Box sx={{ p: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, display: 'block', color: '#f8fafc' }}
              >
                Network Telemetry
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {filteredLogs.length} requests captured
              </Typography>
            </Box>
          }
          placement="right"
        >
          <IconButton
            onClick={() => setIsOpen(true)}
            sx={inspectorStyles.floatingToggle}
          >
            <BugIcon sx={{ fontSize: 24 }} />
            <Box sx={inspectorStyles.pulseIndicator} />
          </IconButton>
        </Tooltip>
      </Zoom>

      <Drawer
        anchor="left"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            ...inspectorStyles.drawerContainer,
            width: { xs: '100vw', sm: drawerWidth },
            transition: isResizing
              ? 'none'
              : 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative'
          }
        }}
      >
        <Box
          onMouseDown={handleResizeStart}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '8px',
            cursor: 'ew-resize',
            bgcolor: isResizing ? 'rgba(56, 189, 248, 0.3)' : 'transparent',
            '&:hover': {
              bgcolor: 'rgba(56, 189, 248, 0.15)'
            },
            zIndex: 9999,
            transition: 'background-color 0.2s'
          }}
        />
        <Box sx={inspectorStyles.headerBox}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2.5 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  bgcolor: 'rgba(56, 189, 248, 0.08)',
                  p: 1.2,
                  borderRadius: '10px',
                  display: 'flex',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.2)'
                }}
              >
                <BugIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,
                    color: '#f8fafc',
                    lineHeight: 1,
                    fontSize: '1.1rem',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Scholarbee Debugger
                </Typography>
                <Typography
                  sx={{
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    mt: 0.6,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                >
                  Full-Stack Telemetry Engine
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Tooltip title="Wipe Session">
                <IconButton
                  onClick={handleClear}
                  size="small"
                  sx={{
                    color: '#475569',
                    '&:hover': {
                      color: '#f43f5e',
                      bgcolor: 'rgba(244, 63, 94, 0.1)'
                    }
                  }}
                >
                  <HistoryIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={drawerWidth >= 1000 ? 'Compact View' : 'Maximize'}
              >
                <IconButton
                  onClick={handleToggleFullscreen}
                  size="small"
                  sx={{
                    color: drawerWidth >= 1000 ? '#38bdf8' : '#475569',
                    '&:hover': {
                      color: '#38bdf8',
                      bgcolor: 'rgba(56, 189, 248, 0.1)'
                    }
                  }}
                >
                  {typeof window !== 'undefined' &&
                  drawerWidth >= window.innerWidth - 40 ? (
                    <FullscreenExitIcon fontSize="small" />
                  ) : (
                    <FullscreenIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Observer Config">
                <IconButton
                  onClick={(e) => setSettingsAnchor(e.currentTarget)}
                  size="small"
                  sx={{
                    color: '#475569',
                    '&:hover': {
                      color: '#38bdf8',
                      bgcolor: 'rgba(56, 189, 248, 0.1)'
                    }
                  }}
                >
                  <FilterIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton
                onClick={() => setIsOpen(false)}
                size="small"
                sx={{
                  color: '#475569',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': { color: '#f8fafc', borderColor: '#334155' }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mb: 2.5
            }}
          >
            <Box sx={inspectorStyles.tabContainer}>
              {STATUS_TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <Box
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    sx={{
                      px: 2,
                      py: 0.8,
                      cursor: 'pointer',
                      borderRadius: '6px',
                      bgcolor: isActive ? tab.bgColor : 'transparent',
                      color: isActive ? tab.color : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: '0.2s'
                    }}
                  >
                    {tab.icon} {tab.label.toUpperCase()}
                  </Box>
                );
              })}
            </Box>

            <ToggleButtonGroup
              value={activeSource}
              exclusive
              onChange={(_, val) => val && setActiveSource(val)}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.03)',
                p: 0.4,
                borderRadius: '8px',
                '& .MuiToggleButton-root': {
                  py: 0.6,
                  border: 'none',
                  px: 1.5,
                  color: '#475569',
                  fontSize: '0.6rem',
                  fontWeight: 900,
                  borderRadius: '6px !important',
                  '&.Mui-selected': {
                    bgcolor: '#38bdf8',
                    color: '#020617',
                    '&:hover': { bgcolor: '#7dd3fc' }
                  }
                }
              }}
            >
              <ToggleButton value="all">ALL</ToggleButton>
              <ToggleButton value="client">CLIENT</ToggleButton>
              <ToggleButton value="server">SERVER</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            fullWidth
            placeholder="Intercept matching URLs, status codes, or payload fragments..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#0f172a',
                borderRadius: '10px',
                fontSize: '0.8rem',
                color: '#f8fafc',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                '&:hover fieldset': { borderColor: 'rgba(56, 189, 248, 0.4)' },
                '&.Mui-focused fieldset': {
                  borderColor: '#38bdf8',
                  borderWidth: '1px'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#475569', fontSize: 20 }} />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box
          sx={{
            px: 3,
            py: 1.5,
            bgcolor: '#020617',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            gap: 1.2,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <Typography
            sx={{
              color: '#334155',
              fontWeight: 900,
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              mr: 1
            }}
          >
            FILTER METHODS
          </Typography>
          <Chip
            label={`ANY (${methodCounts.ANY})`}
            onClick={() => setActiveMethod(null)}
            size="small"
            sx={{
              height: 26,
              fontSize: '0.65rem',
              fontWeight: 900,
              borderRadius: '6px',
              cursor: 'pointer',
              bgcolor:
                activeMethod === null
                  ? 'rgba(56, 189, 248, 0.1)'
                  : 'transparent',
              color: activeMethod === null ? '#38bdf8' : '#475569',
              border:
                activeMethod === null
                  ? '1px solid #38bdf8'
                  : '1px solid rgba(255,255,255,0.05)'
            }}
          />
          {METHOD_FILTERS.map(({ key, color, bg }) => {
            const isSelected = activeMethod === key;
            return (
              <Chip
                key={key}
                label={`${key} (${methodCounts[key] || 0})`}
                onClick={() => setActiveMethod(isSelected ? null : key)}
                size="small"
                sx={{
                  height: 26,
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  bgcolor: isSelected ? color : bg,
                  color: isSelected ? '#000' : color,
                  border: '1px solid',
                  borderColor: isSelected ? color : 'transparent',
                  opacity: methodCounts[key] === 0 ? 0.3 : 1
                }}
              />
            );
          })}
        </Box>

        <Box sx={inspectorStyles.scrollableContent}>
          {filteredLogs.length === 0 ? (
            <Box
              sx={{
                height: '60%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1e293b'
              }}
            >
              <HistoryIcon sx={{ fontSize: 64, mb: 2, opacity: 0.1 }} />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  opacity: 0.3,
                  letterSpacing: '0.05em'
                }}
              >
                NO PACKETS INTERCEPTED
              </Typography>
            </Box>
          ) : (
            <List
              disablePadding
              sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}
            >
              {filteredLogs.slice(0, 40).map((log) => (
                <LogItem
                  key={log.id}
                  log={log}
                  copiedId={copiedId}
                  setCopiedId={setCopiedId}
                  formatSize={formatSize}
                />
              ))}
            </List>
          )}
        </Box>

        <Menu
          anchorEl={settingsAnchor}
          open={Boolean(settingsAnchor)}
          onClose={() => setSettingsAnchor(null)}
          PaperProps={{
            sx: {
              bgcolor: '#0f172a',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
              mt: 1,
              borderRadius: '10px',
              minWidth: 240
            }
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 900,
                color: '#64748b',
                mb: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              Engine Configuration
            </Typography>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={showNextNoise}
                  onChange={(e) => setShowNextNoise(e.target.checked)}
                  sx={{
                    color: '#475569',
                    '&.Mui-checked': { color: '#38bdf8' }
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Show Framework Traffic
                </Typography>
              }
            />
          </Box>
        </Menu>
      </Drawer>
    </>
  );
}
