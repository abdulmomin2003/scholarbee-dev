import React from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import ContactUsButton from './studyAbroadBanner/contactUsButton';

const styles = {
  root: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pt: { xs: 2, md: 2.5 },
    pb: { xs: 4, md: 5 },
    px: { xs: 2, md: 3 },
    background: 'white'
  },
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: { xs: '390px', md: '1284px' },
    height: { xs: '436px', md: '300px' },
    background: '#FFFFFF',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'block',
    margin: '0 auto'
  },
  imageWrapper: {
    position: 'absolute',
    width: { xs: '546px', md: '722px' },
    height: { xs: '364.58px', md: '100%' },
    left: { xs: '-7px', md: 0 },
    top: { xs: '-5px', md: 0 },
    overflow: 'hidden',
    zIndex: 0
  },
  gradientOverlay: {
    position: 'absolute',
    width: { xs: '398px', md: '931px' },
    height: { xs: '371px', md: '371px' },
    left: { xs: 'calc(50% - 398px/2)', md: 'auto' },
    right: { xs: 'auto', md: 0 },
    top: { xs: '218px', md: '-21px' },
    background: {
      xs: 'linear-gradient(180deg, rgba(0, 74, 224, 0) 0%, rgba(0, 74, 224, 0.56) 6.69%, #004AE0 11.84%)',
      md: 'linear-gradient(90deg, rgba(0, 74, 224, 0) 0%, rgba(0, 74, 224, 0.56) 6.69%, #004AE0 11.84%)'
    },
    filter: 'blur(2px)',
    zIndex: 1,
    pointerEvents: 'none'
  },
  airplaneGraphic: {
    position: 'absolute',
    width: { xs: '200px', md: '444px' },
    height: { xs: '200px', md: '444px' },
    left: { xs: '190px', md: '863px' },
    top: { xs: '308px', md: '10px' },
    zIndex: 2,
    pointerEvents: 'none'
  },
  contentWrapper: {
    position: 'absolute',
    width: { xs: '350px', md: '100%' },
    height: { xs: '172px', md: '180px' },
    left: { xs: '20px', md: '589px' },
    top: { xs: '244px', md: '56px' },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: { xs: '20px', md: 2.5 },
    zIndex: 3,
    boxSizing: 'border-box'
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: '8px', md: 1.5 },
    width: '100%',
    height: { xs: '116px', md: 'auto' },
    justifyContent: 'center'
  },
  heading: {
    fontWeight: 600,
    color: '#FFFFFF',
    fontFamily: "'Poppins', sans-serif",
    fontSize: { xs: '20px', md: '32px' },
    lineHeight: { xs: '24px', md: '38px' },
    width: { xs: '324px', md: '100%' },
    height: { xs: '48px', md: 'auto' }
  },
  subtext: {
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: "'Poppins', sans-serif",
    fontSize: { xs: '14px', md: '16px' },
    lineHeight: { xs: '20px', md: '24px' },
    width: { xs: '350px', md: '482px' },
    height: { xs: '60px', md: 'auto' }
  },
  button: {
    width: { xs: '130px', md: '246px' },
    height: { xs: '36px', md: '48px' },
    background: '#FFFFFF',
    borderRadius: '8px',
    color: '#004AE0',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    fontSize: { xs: '14px', md: '16px' },
    lineHeight: '20px',
    textTransform: 'none',
    padding: { xs: '8px 12px', md: '12px 24px' },
    minWidth: 0,
    '&:hover': {
      background: '#F5F5F5',
      color: '#004AE0'
    }
  },
  buttonText: {
    width: { xs: 'auto', md: '198px' },
    height: { xs: 'auto', md: '24px' },
    whiteSpace: 'nowrap'
  }
};

const StudyAbroadBanner = () => {
  return (
    <Box sx={styles.root}>
      <Box sx={styles.container}>
        {/* Image */}
        <Box sx={styles.imageWrapper}>
          <Image
            src="/assets/png/joking-around.png"
            alt="Students studying abroad"
            fill
            style={{
              objectFit: 'cover',

              objectPosition: 'center'
            }}
            sizes="(max-width: 768px) 546px, 722px"
            priority
            quality={100}
          />
        </Box>

        {/* Gradient Overlay */}
        <Box sx={styles.gradientOverlay} />

        {/* Airplane Graphic */}
        <Box sx={styles.airplaneGraphic}>
          <Image
            src="/assets/svg/plane.svg"
            alt="Airplane graphic"
            fill
            style={{
              objectFit: 'contain',
              opacity: 0.2
            }}
            sizes="(max-width: 768px) 200px, 444px"
          />
        </Box>

        {/* Content Wrapper */}
        <Box sx={styles.contentWrapper}>
          <Box sx={styles.textContainer}>
            <Typography
              component="h2"
              variant="h5"
              fontWeight={600}
              sx={styles.heading}
            >
              Want to Apply an international University?
            </Typography>
            <Typography variant="h6" fontWeight={400} sx={styles.subtext}>
              Applying for a University abroad can be difficult. Complete our
              simple form, and we will help you find the bet path for you
              future.
            </Typography>
          </Box>
          <ContactUsButton styles={styles} />
        </Box>
      </Box>
    </Box>
  );
};

export default StudyAbroadBanner;
