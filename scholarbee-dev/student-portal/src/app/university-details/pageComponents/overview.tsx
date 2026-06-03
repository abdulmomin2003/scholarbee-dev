'use client';

import WithPaper from '@/components/atoms/withPaper';
import { Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

const COLLAPSED_LENGTH = 400;

const linkSx = {
  color: '#004AE0',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: 16,
  '&:hover': { textDecoration: 'underline' }
};

/**
 * Renders full overview on initial/SSR render for SEO, then collapses after
 * hydration so users see "See more" / "Show less" without losing crawlable content.
 */
const Overview = ({ description }: { description?: string }) => {
  const text = description?.trim() ?? '';
  const isLong = text.length > COLLAPSED_LENGTH;
  const preview = isLong
    ? `${text.slice(0, COLLAPSED_LENGTH).trim()}...`
    : text;
  const rest = isLong ? text.slice(COLLAPSED_LENGTH).trim() : '';

  // Start expanded so SSR and first paint send full content (SEO); collapse after mount
  const [expanded, setExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setExpanded(false);
  }, []);

  const showCollapsed = mounted && isLong && !expanded;

  return (
    <WithPaper title="Overview">
      <Typography
        variant="body1"
        component="div"
        fontSize={18}
        mt={2.5}
        sx={{ whiteSpace: 'pre-line' }}
      >
        {showCollapsed ? preview : text}
        {isLong && rest && (
          <>
            {' '}
            <Typography
              component="button"
              type="button"
              variant="body1"
              fontSize="inherit"
              sx={{
                ...linkSx,
                display: 'inline',
                background: 'none',
                border: 'none',
                padding: 0,
                fontFamily: 'inherit',
                verticalAlign: 'baseline'
              }}
              onClick={() => setExpanded((prev) => !prev)}
            >
              {showCollapsed ? 'See more' : 'Show less'}
            </Typography>
          </>
        )}
      </Typography>
    </WithPaper>
  );
};

export default Overview;
