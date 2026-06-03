'use client';
import React from 'react';
import { Typography, TypographyProps } from '@mui/material';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Utility function to process text and isolate English words in Urdu text
 * Handles English words, numbers, and common brand names
 */
export const processUrduText = (text: string): string => {
  // Match English words, numbers, and brand names
  // Pattern matches: words starting with letters, containing letters/numbers/spaces
  // This includes words like "ScholarBee", "Google", "Instagram", etc.
  const englishWordPattern =
    /\b([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+)*|[A-Za-z][A-Za-z0-9]+)\b/g;

  return text.replace(
    englishWordPattern,
    '<span dir="ltr" style="unicode-bidi: isolate; display: inline-block;">$1</span>'
  );
};

/**
 * Typography component that automatically handles RTL/LTR based on language
 */
export const OrientedTypography: React.FC<
  TypographyProps & { text?: string }
> = ({ text, children, sx, ...props }) => {
  const { language } = useLanguage();
  const isRTL = language === 'ur';
  const content = text || children;

  if (typeof content !== 'string') {
    return (
      <Typography
        {...props}
        sx={{
          direction: isRTL ? 'rtl' : 'ltr',
          ...sx
        }}
      >
        {children}
      </Typography>
    );
  }

  return (
    <Typography
      {...props}
      sx={{
        direction: isRTL ? 'rtl' : 'ltr',
        textAlign: isRTL ? 'right' : 'left',
        ...sx
      }}
      dangerouslySetInnerHTML={{
        __html: isRTL ? processUrduText(content) : content
      }}
    />
  );
};
