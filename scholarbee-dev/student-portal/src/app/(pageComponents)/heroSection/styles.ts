export const styles = {
  heroSection: {
    position: 'relative',
    width: '100%',
    minHeight: { xs: 'auto', md: '820px' },
    background: '#FFFFFF',
    py: { xs: 4, md: 5 },
    overflowX: 'hidden'
  },
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: 'flex-start',
    pt: { xs: 2, md: '150px' },
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box'
  },
  leftContent: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '48px',
    width: { xs: '100%', md: '50%' },
    maxWidth: { xs: '100%', md: '600px' },
    flexShrink: 0,
    zIndex: 2,
    boxSizing: 'border-box'
  },
  contentWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    width: '100%'
  },
  tag: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 16px',
    width: { xs: 'auto', md: '235px' },
    height: '40px',
    background: '#EDFDED',
    borderRadius: '7px',
    gap: { xs: 2, md: 0 }
  },
  tagIcon: {
    position: 'relative',
    width: '16px',
    height: '16px',
    background: '#00E000',
    borderRadius: '50%'
  },
  tagText: {
    textAlign: 'center',
    color: '#00E000'
  },
  textContent: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
    width: '100%'
  },
  heading: {
    lineHeight: { xs: '2.25rem', sm: '2.5rem', md: '3.25rem' },
    color: '#070808',
    width: '100%'
  },
  description: {
    lineHeight: { xs: '1.5rem', md: '2.25rem' },
    letterSpacing: '-0.02em',
    color: '#444850',
    width: { xs: '100%', md: '483px' }
  },
  loginButton: {
    position: 'relative',
    width: { xs: '100%', sm: '240px' },
    height: '56px',
    background: '#004AE0',
    borderRadius: '10px',
    '&:hover': {
      background: '#0039B8'
    },
    color: 'white'
  },
  loginButtonText: {
    textAlign: 'center',
    color: '#FFFFFF'
  },
  rightContent: {
    position: 'relative',
    width: { xs: '100%', md: '50%' },
    maxWidth: { xs: '100%', md: '600px' },
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: { xs: 3, md: 4 },
    boxSizing: 'border-box',
    marginTop: { xs: 3, md: 0 }
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: { xs: '100%', md: '678px' },
    height: { xs: '300px', md: '420px' }
  },
  videoFrame: {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: 'transparent',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    outline: 'none',
    '&:focus': {
      outline: '2px solid #004AE0',
      outlineOffset: '2px'
    }
  },
  videoIframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: '16px'
  },
  playButton: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '73.49px',
    height: '72.9px',
    cursor: 'pointer',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playButtonCircle: {
    width: '100%',
    height: '100%',
    background: '#FFFFFF',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)'
  },
  playButtonTriangle: {
    width: 0,
    height: 0,
    borderLeft: '20px solid #004AE0',
    borderTop: '12px solid transparent',
    borderBottom: '12px solid transparent',
    marginLeft: '4px'
  },
  decorativePurpleDot: {
    position: 'absolute',
    width: '28px',
    height: '28px',
    left: { xs: '20px', md: '0px' },
    bottom: { xs: '-20px', md: '90px' },
    background: '#8282F0',
    borderRadius: '50%',
    zIndex: 1
  },
  decorativeYellowStar: {
    position: 'absolute',
    width: '40.46px',
    height: '38.87px',
    right: { xs: '20px', md: '0px' },
    top: { xs: '20px', md: '0px' },
    background: '#E0E000',
    clipPath:
      'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    zIndex: 1
  },
  decorativeRedDot: {
    position: 'absolute',
    width: '24px',
    height: '24px',
    left: { xs: '20px', md: '0px' },
    top: { xs: '20px', md: '0px' },
    background: '#EB5757',
    borderRadius: '50%',
    zIndex: 1
  },
  statsContainer: {
    position: 'relative',
    width: '100%',
    height: { xs: 'auto', md: '80px' },
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    px: { xs: 2, md: 0 },
    py: { xs: 4, md: 4 }
  },
  statsContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: { xs: 4, md: '72px' },
    padding: 0,
    width: { xs: '100%', md: '435px' }
  },
  statGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    width: { xs: 'auto', md: 'auto' },
    height: { xs: 'auto', md: '80px' },
    flex: 'none',
    flexGrow: 0
  },
  statNumber: {
    fontWeight: 500,
    fontSize: { xs: '24px', md: '32px' },
    lineHeight: { xs: '40px', md: '55px' },
    textAlign: 'center',
    color: '#004AE0',
    width: { xs: 'auto', md: 'auto' },
    height: { xs: 'auto', md: '55px' }
  },
  statLabel: {
    fontWeight: 500,
    fontSize: { xs: '14px', md: '18px' },
    lineHeight: { xs: '20px', md: '24px' },
    textAlign: 'center',
    color: '#9B9FA7',
    width: { xs: 'auto', md: 'auto' },
    height: { xs: 'auto', md: '24px' }
  },
  footerBanner: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    left: 0,
    right: 0,
    height: { xs: 'auto', md: '40px' },
    background: '#070808',
    mt: { xs: 4, md: 8 },
    overflow: 'hidden',
    display: { xs: 'none', md: 'flex' },
    alignItems: 'center'
  },
  footerContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    willChange: 'transform'
  },
  footerItem: {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    height: '24px',
    flexShrink: 0,
    marginRight: '60px'
  },
  footerStar: {
    width: '20px',
    height: '20px',
    background: '#8EC7FF',
    clipPath:
      'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    flexShrink: 0
  },
  footerCircle: {
    width: '8px',
    height: '8px',
    background: '#8EC7FF',
    borderRadius: '50%',
    flexShrink: 0
  },
  footerText: {
    textAlign: 'center',
    color: '#8EC7FF',
    whiteSpace: 'nowrap'
  }
};
