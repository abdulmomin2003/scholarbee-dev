'use client';

import { Box, Tooltip, Typography, type TypographyProps } from '@mui/material';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { COLORS } from '@/constants/colors';

export type EllipsisTooltipTextProps = TypographyProps & {
  /** Full string shown in the tooltip when the label is truncated. */
  tooltipTitle: string;
};

const tooltipArrowSx = {
  /** Fills the rotated square that forms the caret */
  color: COLORS.programCardTitleTooltipBg,
  fontSize: 14,
  '&::before': {
    border: '1px solid rgba(0, 74, 224, 0.18)',
    boxSizing: 'border-box'
  }
} as const;

/**
 * Single-line typography with ellipsis; shows MUI Tooltip on hover only when text overflows.
 * Tooltip matches program card spec: pale blue panel, dark blue copy, downward-pointing triangle.
 */
export function EllipsisTooltipText({
  tooltipTitle,
  children,
  sx,
  ...typographyProps
}: EllipsisTooltipTextProps) {
  const textRef = useRef<HTMLElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const measure = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    setIsTruncated(el.scrollWidth > el.clientWidth + 1);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, tooltipTitle, children]);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  /** On sm+ one line + horizontal scroll if needed; on xs wrap within viewport width (no horizontal scroll). */
  const titleNode = (
    <Box
      component="span"
      sx={{
        display: 'block',
        maxWidth: '100%',
        whiteSpace: { xs: 'normal', sm: 'nowrap' },
        overflowX: { xs: 'visible', sm: 'auto' },
        overflowY: 'hidden',
        textAlign: 'center',
        mx: 'auto',
        wordBreak: { xs: 'break-word', sm: 'normal' },
        overflowWrap: { xs: 'anywhere', sm: 'normal' },
        scrollbarWidth: 'thin'
      }}
    >
      {tooltipTitle}
    </Box>
  );

  return (
    <Tooltip
      arrow
      placement="top"
      enterTouchDelay={0}
      title={titleNode}
      disableHoverListener={!isTruncated}
      disableFocusListener={!isTruncated}
      disableTouchListener={!isTruncated}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: COLORS.programCardTitleTooltipBg,
            color: COLORS.primary,
            /** Let the pointing triangle render outside the text box */
            overflow: 'visible',
            /** xs: fill viewport (minus margin) so wrapped title never exceeds screen; sm+: shrink-wrap */
            width: { xs: 'calc(100vw - 24px)', sm: 'max-content' },
            maxWidth: 'calc(100vw - 24px)',
            boxSizing: 'border-box',
            px: 1.75,
            py: 1.25,
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.25,
            boxShadow: '0px 4px 16px rgba(11, 69, 134, 0.12)',
            border: '1px solid rgba(0, 74, 224, 0.12)'
          }
        },
        arrow: {
          sx: tooltipArrowSx
        }
      }}
    >
      <Typography
        ref={textRef}
        sx={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...sx
        }}
        {...typographyProps}
      >
        {children}
      </Typography>
    </Tooltip>
  );
}
