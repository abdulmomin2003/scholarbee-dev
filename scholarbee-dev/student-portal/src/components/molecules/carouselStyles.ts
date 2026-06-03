import { SxProps, Theme } from '@mui/material/styles';

export const carouselStyles = {
  section: {
    width: '100%',
    py: { xs: 1, md: 2 }
  } as SxProps<Theme>,
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
    position: 'relative'
  } as SxProps<Theme>,
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    gap: 2,
    '& .carousel-arrows-container': {
      alignSelf: 'flex-end'
    }
  } as SxProps<Theme>,
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    maxWidth: { xs: '100%', md: '690px' }
  } as SxProps<Theme>,
  title: {
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: { xs: '42px', md: '60px' },
    color: '#070808',
    width: '100%'
  } as SxProps<Theme>,
  subtitle: {
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: { xs: '27px', md: '36px' },
    color: '#0F1012',
    width: '100%'
  } as SxProps<Theme>,
  carouselContainer: {
    width: '100%',
    position: 'relative',
    py: { xs: 1, md: 2 },
    '& .slick-slide': {
      padding: { xs: '0 8px', md: '0 12px' },
      height: 'auto',
      '& > div': {
        height: '100%'
      }
    },
    '& .slick-list': {
      margin: { xs: '0 -8px', md: '0 -12px' },
      padding: 0
    },
    '& .slick-track': {
      paddingTop: { xs: 2, md: 3 },
      paddingBottom: { xs: 2, md: 3 },
      display: 'flex',
      alignItems: 'stretch',
      '& .slick-slide': {
        height: 'auto',
        display: 'flex',
        '& > div': {
          width: '100%',
          display: 'flex'
        }
      }
    }
  } as SxProps<Theme>,
  cardWrapper: {
    px: { xs: 1, md: 1.5 }
  } as SxProps<Theme>,
  seeAllContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    mt: { xs: 1.5, md: 2 }
  } as SxProps<Theme>,
  seeAllButton: {
    width: { xs: '100%', sm: '400px' },
    height: '56px',
    border: '1px solid #004AE0',
    borderRadius: '10px',
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    textAlign: 'center',
    color: '#004AE0',
    textTransform: 'none',
    '&:hover': {
      border: '1px solid #004AE0',
      background: 'rgba(0, 74, 224, 0.04)'
    }
  } as SxProps<Theme>
};
