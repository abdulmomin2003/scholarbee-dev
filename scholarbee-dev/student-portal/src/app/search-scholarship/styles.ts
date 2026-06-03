export const styles = {
  // Container styles
  container: (isProcessing?: boolean) => ({
    // cursor: isProcessing ? 'not-allowed' : 'pointer',
    pointerEvents: isProcessing ? 'none' : 'auto',
    opacity: isProcessing ? 0.7 : 1,
    transition: 'opacity 0.2s ease-in-out'
  }),
  linkStyle: (isProcessing: boolean) => ({
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    width: '100%',
    pointerEvents: isProcessing ? 'none' : 'auto'
  }),
  link: {
    textDecoration: 'none',
    cursor: 'pointer',
    color: 'inherit',
    display: 'block',
    width: '100%'
  },
  card: (outlined?: boolean) => ({
    backgroundColor: 'white',
    padding: 2,
    transition: 'all 0.2s ease-in-out',
    position: 'relative',
    '&:hover': {
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
      '& .view-program': {
        backgroundColor: 'primary.dark'
      }
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      transition: 'background-color 0.2s ease-in-out'
    },
    border: outlined ? '1px solid #E0E0E0' : 'none',
    borderRadius: outlined ? 3 : 2
  }),

  // Image container styles
  imageGridContainer: () => ({
    display: {
      xs: 'block',
      sm: 'none',
      md: 'block',
      margin: 'auto'
    },
    borderRight: '1px solid #E0E0E0'
  }),
  scholarshipImageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pl: { xs: 0, md: 1 },
    pr: { xs: 0, md: 3 },
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '12px',
    maxHeight: '180px',
    minHeight: '150px',
    aspectRatio: '1/1'
  },
  scholarshipImage: {
    objectFit: 'cover',
    borderRadius: '12px',
    height: '100%',
    maxHeight: '180px',
    width: '100%'
  },
  programImage: {
    objectFit: 'contain',
    borderRadius: '12px',
    height: '100%',
    width: '100%',
    maxHeight: '180px'
  },
  responsiveImageContainer: {
    display: { xs: 'none', sm: 'block', md: 'none' },
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '12px',
    maxHeight: '150px',
    minHeight: '120px',
    aspectRatio: '16/9'
  },
  responsiveImage: {
    alignSelf: 'center',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '12px'
  },

  // Content styles
  cardInfo: {
    display: 'flex',
    width: '100%',
    borderLeft: { xs: 'none', md: '1px solid #00000033' },
    pl: { xs: 0, md: 3 },
    mt: { xs: 2, md: 0 }
  },
  cardDetails: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  headerContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: { xs: 'column', lg: 'row', gap: 1 }
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: { xs: 'column', lg: 'row' },
    justifyContent: 'space-between',
    width: '100%',
    gap: 1
  },
  infoRow: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: {
      xs: 'flex-start',
      md: 'center'
    },
    gap: 2,
    mt: 1
  },
  universityLogo: {
    width: 'auto',
    maxWidth: '120px',
    height: '60px',
    objectFit: 'contain'
  },
  locationContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    ml: { xs: 0, md: 2 }
  },

  // Program details styles
  programDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: {
      xs: 'column',
      sm: 'row'
    },
    mt: 1
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    mt: 1
  },
  divider: {
    margin: { xs: 0.5, lg: 1 },
    display: {
      xs: 'none',
      md: 'block'
    }
  },
  statsText: {
    fontSize: { xs: 12, sm: 14 }
  },

  // Button styles
  favoriteButton: (isProcessing: boolean) => ({
    backgroundColor: 'rgba(11, 60, 149, 0.10)',
    borderRadius: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 1.5,
    // zIndex: zIndex.tooltip,
    height: '48px',
    width: '48px',
    cursor: isProcessing ? 'not-allowed' : 'pointer',
    opacity: isProcessing ? 0.5 : 1,
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
    pointerEvents: isProcessing ? 'none' : 'auto',
    transform: 'scale(1)',
    '&:hover': {
      opacity: isProcessing ? 0.5 : 1,
      backgroundColor: isProcessing
        ? 'rgba(11, 60, 149, 0.10)'
        : 'rgba(11, 60, 149, 0.20)',
      transform: isProcessing ? 'scale(1)' : 'scale(1.05)',
      boxShadow: isProcessing ? 'none' : '0px 4px 12px rgba(11, 60, 149, 0.25)'
    },
    '&:active': {
      transform: isProcessing ? 'scale(1)' : 'scale(0.95)',
      transition: 'transform 0.1s ease-in-out'
    }
  }),
  favoriteIcon: (isProcessing: boolean) => ({
    opacity: isProcessing ? 0.7 : 1,
    transition: 'opacity 0.2s ease-in-out'
  }),
  viewProgramButton: {
    p: 2,
    borderRadius: 2,
    backgroundColor: 'primary.main',
    textAlign: 'center',
    color: 'white',
    mt: 2,
    transition: 'background-color 0.2s ease-in-out'
  },
  applyNowButton: {
    py: 2,
    px: 5,
    display: { xs: 'none', md: 'block' },
    minWidth: 180,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    fontSize: 16,
    fontWeight: 600
  }
};
