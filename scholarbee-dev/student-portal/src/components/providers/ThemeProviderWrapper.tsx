'use client';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/utils/theme';

const ThemeProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default ThemeProviderWrapper;
