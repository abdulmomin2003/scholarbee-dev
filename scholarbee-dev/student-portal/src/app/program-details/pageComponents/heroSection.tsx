import { CustomTypography } from '@/components/atoms/customTypography';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';
import locationIcon from '@public/assets/svg/location-white.svg';
import { COLORS } from '@/constants/colors';

const HeroSection = ({
  uni_logo,
  title,
  address,
  campusImage = ''
}: {
  uni_logo?: string;
  title: string;
  address?: string;
  campusImage?: string;
}) => {
  const processedBackgroundImage = campusImage?.trim() || '';
  const backgroundImageStyle = processedBackgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(241, 242, 243, 0.6), rgba(241, 242, 243, 0.6)), url("${encodeURI(processedBackgroundImage)}")`
      }
    : {
        backgroundColor: COLORS.filtersColor,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      };

  return (
    <Box sx={styles.heroSection} style={backgroundImageStyle}>
      <Box sx={styles.heroContent}>
        {uni_logo && (
          <Image
            src={uni_logo}
            width={92}
            height={92}
            style={{ objectFit: 'contain' }}
            alt="University Logo"
          />
        )}
        <CustomTypography
          mt={2}
          component="h1"
          color={COLORS.textPrimary}
          fontSize={36}
          smallFont={18}
          fontWeight={600}
          sx={{
            maxLines: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
            // maxWidth: '100%'
          }}
        >
          {title?.length > 100 ? `${title.substring(0, 100)}...` : title}
        </CustomTypography>
        {address && (
          <Box display="flex" gap={1}>
            <Image
              src={locationIcon}
              alt="location icon"
              style={{ filter: 'brightness(0)' }}
            />
            <Typography color={COLORS.textPrimary} variant="body1">
              {address || 'New York City, New York, USA'}
            </Typography>
            {/* <Image src={startIcon} alt="location icon" />
          <Typography color="white" variant="body1">
            4
          </Typography> */}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HeroSection;

const styles = {
  heroSection: {
    width: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: {
      xs: '220px',
      sm: '330px'
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    px: 2
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
};
