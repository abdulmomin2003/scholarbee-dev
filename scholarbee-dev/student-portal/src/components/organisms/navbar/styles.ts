import { COLORS } from '@/constants/colors';

export const classes = {
  root: {
    backgroundColor: 'white',
    boxShadow: 'none',
    pt: { xs: '16px', md: '32px' },
    pb: { xs: '16px', md: '32px' },
    width: '100%',
    left: 0,
    right: 0,
    zIndex: 1100
  },
  navContainer: {
    width: { xs: 'calc(100% - 32px)', md: '1090px' },
    height: { xs: '64px', md: '80px' },
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    borderRadius: { xs: '50px', md: '100px' },
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: { xs: 2, md: 4 },
    maxWidth: '1090px',
    margin: '0 auto',
    mx: { xs: 2, md: 'auto' }
  },
  logoText: {
    flexGrow: { xs: 1, md: 0 },
    fontWeight: 800,
    fontSize: {
      xs: '16px',
      sm: '24px'
    },
    color: COLORS.textPrimary,
    textDecoration: 'none'
  },
  justifyBetween: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  menuIcon: {
    display: { md: 'none' },
    color: {
      xs: COLORS.textPrimary,
      md: COLORS.primary
    }
  },
  drawer: {
    display: { xs: 'block', md: 'none' },
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      maxWidth: 320,
      width: '100%'
    }
  },
  navLinks: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '32px'
  },
  getStartedBtn: {
    backgroundColor: '#004AE0',
    color: '#FFFFFF',
    borderRadius: '40px',
    padding: '12px 20px',
    fontWeight: 500,
    fontSize: '16px',
    lineHeight: '24px',
    textTransform: 'none',
    height: '48px',
    minWidth: '83px',
    '&:hover': {
      backgroundColor: '#0039B8'
    }
  },
  navItem: {
    color: '#000000',

    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '24px',
    textTransform: 'none',
    padding: 0,
    minWidth: 'auto',
    '&:hover': {
      color: '#004ae0',
      backgroundColor: 'transparent',
      transition: 'transform 0.3s ease-in-out',
      transform: 'translateY(-2px)'
    },
    '&.active': {
      color: '#004ae0',
      fontWeight: 500
    }
  },
  iconBox: {
    height: { xs: '36px', md: '48px' },
    width: { xs: '36px', md: '48px' },
    border: `1px solid ${COLORS.borderColor}`,
    borderRadius: 2,
    mr: { xs: 0, sm: 0, md: 3 },
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sticky: {
    top: '8px'
  }
};
