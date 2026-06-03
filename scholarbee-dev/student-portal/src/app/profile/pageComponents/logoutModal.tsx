import { Box, CircularProgress } from '@mui/material';
import React from 'react';

const LogoutModal = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(2px)'
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: 2,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <CircularProgress size={48} sx={{ color: '#004ae0' }} />
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ fontSize: '18px', fontWeight: 600, mb: 1 }}>
            Logging out...
          </Box>
          <Box sx={{ fontSize: '14px', color: 'text.secondary' }}>
            Please wait while we sign you out securely
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LogoutModal;
