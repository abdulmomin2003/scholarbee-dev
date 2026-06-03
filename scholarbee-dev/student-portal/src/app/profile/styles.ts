import { COLORS } from '@/constants/colors';

export const styles = {
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  root: {
    bgcolor: '#F4F7FF',
    flex: 1,
    py: 3
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: 3
  },
  sidebar: {
    width: { xs: '100%', md: 280 },
    bgcolor: 'white',
    borderRadius: 2,
    p: 2,
    height: 'fit-content'
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative'
  },
  loadingContent: {
    opacity: 0.6,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease-in-out',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      animation: 'shimmer 1.5s infinite'
    }
  },
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' }
  },
  listItem: {
    borderRadius: 2,
    mb: 1,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      bgcolor: 'rgba(0, 0, 0, 0.04)',
      transform: 'translateX(2px)'
    }
  },
  activeListItem: {
    borderRadius: 2,
    mb: 1,
    bgcolor: '#004ae0',
    color: 'white',
    transform: 'translateX(4px)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      bgcolor: '#004ae0',
      transform: 'translateX(4px)'
    }
  },
  icon: {
    minWidth: 40,
    color: 'black',
    '& svg': {
      color: 'black'
    }
  },
  activeIcon: {
    minWidth: 40,
    color: 'white'
  },
  listItemText: {
    '& .MuiListItemText-primary': {
      fontSize: '0.875rem',
      fontWeight: 500
    }
  },
  activeText: {
    '& .MuiListItemText-primary': {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: 'white'
    }
  },
  pageTitle: {
    fontWeight: 600,
    mb: 3
  },
  section: {
    mt: 2,
    mb: 3,
    borderRadius: 2,
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease-in-out',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }
  },
  sectionHeader: {
    p: 2
  },
  sectionTitle: {
    fontWeight: 600
  },
  sectionContent: {
    px: 2.5,
    py: 2,
    bgcolor: COLORS.applicationItemBg,
    borderRadius: 2,
    overflow: 'hidden',
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box'
  },
  applicationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
    '&:last-child': {
      mb: 0
    }
  },
  // Skeleton animations
  skeletonContainer: {
    minHeight: '600px',
    animation: 'fadeIn 0.3s ease-in-out'
  },
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 }
  },
  statusPending: {
    px: 2,
    py: 0.5,
    borderRadius: 10,
    fontSize: '0.75rem',
    fontWeight: 500,
    minWidth: '120px',
    // width: '120px',
    textAlign: 'center'
  },
  filterChip: {
    px: { xs: 1, sm: 1.25 },
    py: { xs: 0.75, sm: 1.5 },
    borderRadius: 1,
    bgcolor: COLORS.bgBlue,
    color: COLORS.primary,
    fontWeight: 500,
    fontSize: { xs: '13px', sm: '14px' },
    height: { xs: '28px', sm: 'auto' },
    '& .MuiChip-label': {
      px: { xs: 0.5, sm: 1 }
    },
    '& .MuiChip-deleteIcon': {
      color: COLORS.primary,
      fontSize: { xs: '16px', sm: '18px' },
      margin: { xs: '0 2px 0 4px', sm: '0 4px 0 8px' },
      '&:hover': {
        color: COLORS.primary
      }
    }
  },
  clearAllButton: {
    px: { xs: 0.5, sm: 1.5 },
    py: 1,
    color: COLORS.primary,
    textTransform: 'none',
    fontWeight: 500,
    fontSize: { xs: 14, sm: 18 },
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline'
    }
  },
  filterButton: {
    borderColor: COLORS.filtersColor,
    color: COLORS.filtersColor,
    width: 150,
    textTransform: 'none',
    py: 1,
    px: 1.5,
    fontWeight: 500,
    '&:hover': {
      borderColor: COLORS.primary,
      backgroundColor: `${COLORS.primary}08`
    }
  },
  filterMenu: {
    mt: 0,
    minWidth: 150,
    border: `1px solid ${COLORS.primary}20`,
    borderRadius: 2
  },
  filterCheckbox: {
    color: COLORS.filtersColor,
    '&.Mui-checked': {
      color: COLORS.primary
    }
  }
};
