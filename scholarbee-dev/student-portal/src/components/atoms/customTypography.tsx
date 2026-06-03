'use client';
import React, { useState, useEffect } from 'react';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { useTheme, useMediaQuery } from '@mui/material';
import { useLanguage } from '@/contexts/LanguageContext';
import { processUrduText } from '@/utils/textOrientation';

interface CustomTypographyProps extends TypographyProps {
  fontSize?: string | number;
  smallFont?: string | number;
  fontWeight?: number | string;
  smallWeight?: number;
  'data-test-id'?: string;
}

export const CustomTypography: React.FC<CustomTypographyProps> = ({
  fontSize,
  smallFont,
  fontWeight,
  smallWeight,
  sx,
  'data-test-id': dataTestId,
  children,
  ...rest
}) => {
  const theme = useTheme();
  const { language } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const isRTL = language === 'ur';

  // Always call the hook (React rules), but use noSsr to prevent SSR evaluation
  const matches = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only use the media query result after mount to avoid hydration mismatches
  const isSmallScreen = isMounted ? matches : false;

  const effectiveSmallWeight = smallWeight ?? fontWeight;

  // Check if children is a string for processing
  const isStringContent = typeof children === 'string';

  return (
    <Typography
      {...rest}
      sx={{
        fontSize: isSmallScreen ? smallFont : fontSize,
        fontWeight: isSmallScreen ? effectiveSmallWeight : fontWeight,
        direction: isRTL ? 'rtl' : 'ltr',
        ...sx
      }}
      data-test-id={dataTestId}
      {...(isStringContent && isRTL
        ? {
            dangerouslySetInnerHTML: {
              __html: processUrduText(children as string)
            }
          }
        : { children })}
    />
  );
};
