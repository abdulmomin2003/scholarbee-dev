import { SxProps, Theme } from '@mui/material';

export const inspectorStyles: Record<string, SxProps<Theme>> = {
  drawerContainer: {
    width: { xs: '100vw', sm: 700 },
    bgcolor: '#020617',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    color: '#e2e8f0'
  },
  headerBox: {
    p: 3,
    pb: 1,
    bgcolor: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    zIndex: 10
  },
  floatingToggle: {
    position: 'fixed',
    bottom: 24,
    left: 24,
    backgroundColor: '#0f172a',
    color: '#38bdf8',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
    width: 52,
    height: 52,
    border: '1px solid rgba(56, 189, 248, 0.2)',
    transition: '0.2s',
    '&:hover': {
      backgroundColor: '#1e293b',
      transform: 'translateY(-2px)',
      borderColor: '#38bdf8'
    }
  },
  pulseIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: '50%',
    bgcolor: '#10b981',
    boxShadow: '0 0 8px #10b981',
    animation: 'pulse 2s infinite'
  },
  tabContainer: {
    display: 'flex',
    gap: 0.5,
    bgcolor: '#0f172a',
    p: 0.5,
    borderRadius: '8px'
  },
  scrollableContent: {
    flexGrow: 1,
    overflowY: 'auto',
    p: 1.5,
    bgcolor: '#020617'
  },
  methodBadge: {
    px: 1,
    py: 0.4,
    borderRadius: '4px',
    fontSize: '0.6rem',
    fontWeight: 900,
    minWidth: 44,
    textAlign: 'center'
  },
  sourceBadge: {
    px: 1,
    py: 0.4,
    borderRadius: '4px',
    fontSize: '0.6rem',
    fontWeight: 900,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center'
  }
};

export const globalStyles = `
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { 
    background: rgba(255, 255, 255, 0.1); 
    border-radius: 10px; 
  }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
`;
