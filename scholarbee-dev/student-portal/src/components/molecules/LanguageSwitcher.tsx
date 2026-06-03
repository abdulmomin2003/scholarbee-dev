'use client';
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: 'en' | 'ur') => {
    setLanguage(lang);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: 16, md: 24 },
        right: { xs: 16, md: 24 },
        display: 'flex',
        gap: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: { xs: '4px', md: '4px' },
        borderRadius: '8px',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      <Button
        onClick={() => handleLanguageChange('en')}
        sx={{
          minWidth: 'auto',
          padding: { xs: '6px 12px', md: '8px 16px' },
          textTransform: 'none',
          color: language === 'en' ? '#004AE0' : '#676D79',
          fontSize: { xs: '13px', md: '14px' },
          cursor: 'pointer',
          backgroundColor:
            language === 'en' ? 'rgba(0, 74, 224, 0.08)' : 'transparent',
          borderRadius: '6px',
          '&:hover': {
            color: '#004AE0',
            backgroundColor: 'rgba(0, 74, 224, 0.08)',
            textDecoration: 'none'
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        English
      </Button>
      <Typography
        sx={{
          color: '#CED0D4',
          mx: 0.5,
          fontSize: { xs: '12px', md: '14px' }
        }}
      >
        |
      </Typography>
      <Button
        onClick={() => handleLanguageChange('ur')}
        sx={{
          minWidth: 'auto',
          padding: { xs: '6px 12px', md: '8px 16px' },
          textTransform: 'none',
          color: language === 'ur' ? '#004AE0' : '#676D79',

          fontSize: { xs: '13px', md: '14px' },
          cursor: 'pointer',
          backgroundColor:
            language === 'ur' ? 'rgba(0, 74, 224, 0.08)' : 'transparent',
          borderRadius: '6px',
          '&:hover': {
            color: '#004AE0',
            backgroundColor: 'rgba(0, 74, 224, 0.08)',
            textDecoration: 'none'
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        اردو
      </Button>
    </Box>
  );
};

export default LanguageSwitcher;
