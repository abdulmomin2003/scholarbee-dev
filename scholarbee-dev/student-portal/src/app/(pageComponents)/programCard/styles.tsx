import { COLORS } from '@/constants/colors';

export type BadgeType =
  | 'hot'
  | 'closed'
  | 'flexibility'
  | 'career'
  | 'scholarship';

export const styles = {
  // Container styles
  container: (isProcessing: boolean) => ({
    cursor: 'default',
    pointerEvents: isProcessing ? 'none' : 'auto',
    opacity: isProcessing ? 0.4 : 1,
    transition: 'opacity 0.2s ease-in-out',
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  }),
  card: {
    display: 'flex',
    flexDirection: { xs: 'column', lg: 'row' },
    width: '100%',
    maxWidth: '924px',
    minHeight: { xs: 'auto', lg: '256px' },
    backgroundColor: COLORS.white,
    borderRadius: { xs: '12px', lg: '16px' },
    padding: { xs: '12px', lg: '16px' },
    position: 'relative',
    boxSizing: 'border-box',
    boxShadow: '0px 4px 84px rgba(0, 0, 0, 0.12)', // Updated shadow
    gap: { xs: '12px', lg: '20px' },
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: '0px 4px 84px rgba(0, 0, 0, 0.16)'
    }
  },

  // Image section
  imageGridContainer: {
    position: 'relative',
    width: { xs: '100%', sm: '224px' },
    height: { xs: '172px', sm: '224px', lg: '224px' },
    borderRadius: { xs: '6.7px', lg: '12px' },
    overflow: 'hidden',
    flexShrink: 0,
    alignSelf: { xs: 'center', lg: 'flex-start' }
  },
  programImageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background:
      'linear-gradient(0deg, rgba(241, 242, 243, 0.6), rgba(241, 242, 243, 0.6))',
    zIndex: 1
  },
  universityLogoOnImageWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '64px', lg: '88px' },
    height: { xs: '64px', lg: '88px' },
    zIndex: 2
  },
  universityTextOnImage: {
    position: 'absolute',
    bottom: { xs: '12px', lg: '26px' },
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: { xs: '18px', lg: '24px' },
    lineHeight: { xs: '24px', lg: '30px' },
    textAlign: 'center',
    color: '#FFFFFF',
    textShadow: '0px 3.35px 20px rgba(0, 0, 0, 0.2)', // from Figma
    zIndex: 2
  },
  imageBadge: (badgeType: BadgeType) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '5px 8px',
    gap: '4px',
    zIndex: 3,
    background:
      badgeType === 'closed'
        ? 'linear-gradient(90deg, #EE3535 -6.3%, #FC8302 114.29%)' // From Figma for closed/action badges
        : badgeType === 'hot'
          ? 'linear-gradient(90deg, #EE3535 -6.3%, #FC8302 114.29%)'
          : badgeType === 'career'
            ? `linear-gradient(135deg, ${COLORS.badgeCareerStart} 0%, ${COLORS.badgeCareerMid} 50%, ${COLORS.badgeCareerEnd} 100%)`
            : badgeType === 'flexibility'
              ? `linear-gradient(270deg, ${COLORS.badgeScholarshipStart} 0%, ${COLORS.badgeScholarshipEnd} 100%)`
              : badgeType === 'scholarship'
                ? `linear-gradient(270deg, #EE3535 -6.3%, #FC8302 114.29%)`
                : `linear-gradient(90deg, #EE3535 -6.3%, #FC8302 114.29%)`,
    borderRadius: '2px 0 4px 0',
    color: COLORS.white,
    '& .MuiTypography-root': {
      fontSize: '12px',
      lineHeight: '14px',
      fontWeight: 400,
      letterSpacing: '-0.03em'
    }
  }),

  /** Session + intake year pill on campus image (top-left) */
  intakeSessionBadge: {
    position: 'absolute',
    top: { xs: '5px', lg: '8px' },
    left: { xs: '5px', lg: '8px' },
    zIndex: 3,
    display: 'inline-block',
    px: { xs: '8px', sm: '10px' },
    py: { xs: '4px', sm: '5px' },
    borderRadius: '6px',
    fontSize: { xs: '11px', sm: '12px' },
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
    color: COLORS.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // while with 90% opacity
    backdropFilter: 'blur(6px)',
    maxWidth: 'calc(100% - 16px)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box'
  },

  // Content Section
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    pt: '4px',
    // Reserve room for the absolute favorite control on desktop/tablet.
    pr: { xs: '0px', lg: '72px' },
    overflow: 'hidden'
  },
  title: {
    fontWeight: 600,
    fontSize: { xs: '14px', lg: '22px' },
    lineHeight: { xs: '22px', lg: '30px' },
    color: '#252525', // Specific neutral from Figma
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    textAlign: 'left'
  },
  universityName: {
    fontWeight: 400,
    fontSize: { xs: '10px', lg: '16px' },
    lineHeight: { xs: '14px', lg: '20px' },
    color: '#464A50', // Specific gray from Figma
    mt: { xs: '2px', lg: '4px' },
    textAlign: 'left'
  },

  // Badges below title
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    mt: '16px',
    justifyContent: 'flex-start'
  },
  badge: (type: 'scholarship' | 'value') => ({
    display: 'flex',
    alignItems: 'center',
    padding: '5px 8px',
    gap: '4px',
    borderRadius: '4px',
    background:
      type === 'scholarship'
        ? `linear-gradient(0deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), linear-gradient(270deg, #BB00E0 0%, #6902B2 100%)`
        : `linear-gradient(0deg, rgba(255, 255, 255, 0.91), rgba(255, 255, 255, 0.91)), linear-gradient(270deg, #00E061 0%, #00C013 100%)`,
    '& .MuiTypography-root': {
      fontSize: '10px',
      lineHeight: '14px',
      fontWeight: 400,
      letterSpacing: '-0.03em',
      background:
        type === 'scholarship'
          ? `linear-gradient(270deg, #BB00E0 0%, #6902B2 100%)`
          : `linear-gradient(270deg, #00E061 0%, #00C013 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textFillColor: 'transparent'
    }
  }),

  // Info details row
  programDetails: {
    display: { xs: 'grid', lg: 'flex' },
    flexDirection: { lg: 'row' },
    gridTemplateColumns: { xs: '1fr auto 1fr', lg: 'none' },
    gridTemplateRows: { xs: 'auto auto', lg: 'none' },
    rowGap: { xs: '29px', lg: '0px' }, // Distance between lines per figma
    columnGap: { xs: '0px', lg: '0px' },
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: { xs: 'flex-start', lg: 'space-between' },
    width: '100%',
    mt: { xs: '12px', lg: '24px' },
    overflowX: { xs: 'hidden', lg: 'auto' }, // Keep hidden on mobile since it's a grid
    pb: '8px',
    gap: { xs: 'initial', lg: '0px' },
    '&::-webkit-scrollbar': {
      height: '4px',
      display: { xs: 'none', lg: 'none' }
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '10px'
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#ccc',
      borderRadius: '10px'
    }
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px', // Reduced gap from 12px
    flexShrink: 0
  },
  detailText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden'
  },
  detailLabel: {
    fontSize: { xs: '11px', lg: '12px' },
    fontWeight: 400,
    lineHeight: '16px',
    letterSpacing: '-0.01em',
    color: '#252525',
    whiteSpace: 'nowrap'
  },
  detailValue: (color?: string) => ({
    fontSize: { xs: '14px', lg: '14px' },
    fontWeight: 500,
    lineHeight: '20px',
    letterSpacing: '-0.01em',
    color: color || '#252525',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textWrap: 'wrap'
  }),
  verticalDivider: {
    width: '1px',
    height: '25px',
    backgroundColor: '#9A9EA6',
    display: { xs: 'block', lg: 'block' }
  },

  // Actions
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: { xs: '12px', md: '20px' },
    mt: 'auto',
    width: '100%',
    boxSizing: 'border-box'
  },
  primaryButton: {
    width: { xs: '50%', md: '48.5%' },
    maxWidth: { xs: 'none', md: '302px' },
    height: { xs: '40px', lg: '44px' },
    backgroundColor: COLORS.primary,
    borderRadius: '6px',
    textTransform: 'none',
    fontWeight: { xs: 500, lg: 600 },
    fontSize: { xs: '14px', lg: '16px' },
    lineHeight: '24px',
    color: COLORS.white,
    padding: { xs: '12px 16px', lg: '12px 0px' },
    flexShrink: 1,
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: COLORS.primaryDark
    }
  },
  secondaryButton: {
    width: { xs: '50%', md: '48.5%' },
    maxWidth: { xs: 'none', md: '302px' },
    height: { xs: '40px', lg: '44px' },
    border: `1px solid ${COLORS.primary}`,
    borderRadius: '6px',
    textTransform: 'none',
    fontWeight: { xs: 400, lg: 500 },
    fontSize: { xs: '14px', lg: '16px' },
    lineHeight: '24px',
    color: COLORS.primary,
    padding: '12px 16px',
    flexShrink: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    '& .MuiButton-startIcon': {
      marginRight: 0,
      marginLeft: 0,
      display: { xs: 'none', lg: 'flex' }, // Hidden on mobile
      alignItems: 'center',
      '& > *:first-of-type': {
        fontSize: '24px'
      }
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 74, 224, 0.04)',
      border: `1px solid ${COLORS.primary}`
    }
  },

  // Favorite section
  favoriteButtonContainerDesktop: {
    position: 'absolute',
    top: '20px',
    right: '16px',
    display: { xs: 'none', lg: 'flex' },
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    zIndex: 10
  },
  favoriteButtonContainerMobile: {
    display: { xs: 'flex', lg: 'none' },
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    ml: '17px' // Space between title and favorite according to Figma gap: 17px
  },
  favoriteText: {
    fontSize: '10px',
    fontWeight: 400,
    lineHeight: '12px',
    letterSpacing: '-0.03em',
    color: '#575C62' // Neutral60 from Figma
  },
  favoriteButton: ({
    isDisabled,
    isFavorite
  }: {
    isDisabled: boolean;
    isFavorite: boolean;
  }) => ({
    width: { xs: '28px', lg: '56px' },
    height: { xs: '28px', lg: '56px' },
    // Match UI design: blue background for non-favorite, pink/raddish background for favorite.
    background: isFavorite
      ? `linear-gradient(0deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), ${COLORS.globalReachGlow}`
      : `linear-gradient(0deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), ${COLORS.primary}`,
    borderRadius: { xs: '5px', lg: '10px' },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    pointerEvents: isDisabled ? 'none' : 'auto',
    opacity: isDisabled ? 0.6 : 1,
    border: 'none',
    padding: 0
  }),
  favoriteIcon: (isDisabled: boolean) => ({
    opacity: isDisabled ? 0.6 : 1,
    color: COLORS.primary
  }),
  favoriteIconWrapper: {
    width: { xs: '14px', lg: '24px' },
    height: { xs: '14px', lg: '24px' },
    position: 'relative'
  }
};
