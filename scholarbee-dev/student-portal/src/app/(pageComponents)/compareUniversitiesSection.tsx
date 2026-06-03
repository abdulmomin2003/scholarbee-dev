'use client';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { Box, Button, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const UNIVERSITIES_DATA = [
  {
    name: 'Bahria University',
    location: 'Islamabad',
    logo: '/assets/svg/bahria.svg',
    backgroundImage: '/assets/png/bahria-bg.png',
    overlayColor: 'rgba(44, 57, 138, 0)',
    logoInvert: false
  },
  {
    name: 'Ibadat International University',
    location: 'Islamabad',
    logo: '/assets/svg/ibadat.svg',
    backgroundImage: '/assets/png/ibadat-bg.png',
    overlayColor: 'rgba(100, 41, 56, 0)',
    logoInvert: false
  }
];

const CompareUniversitiesSection = () => {
  const router = useRouter();

  const handleCompareClick = () => {
    router.push('/programs/compare-universities?from=home');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: { xs: '380px', md: '834px' },
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: COLORS.bgColor
      }}
    >
      {UNIVERSITIES_DATA.map((uni, index) => (
        <Box
          key={index}
          sx={{
            position: 'relative',
            width: '50%',
            height: { xs: '380px', md: '834px' },
            overflow: 'hidden'
          }}
        >
          {/* Background Image */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0
            }}
          >
            <Image
              src={uni.backgroundImage}
              alt={`${uni.name} Background`}
              fill
              style={{ objectFit: 'cover' }}
              priority={index === 0}
            />
          </Box>

          {/* Color Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: uni.overlayColor,
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              px: { xs: 1.5, md: 4 }
            }}
          >
            {/* Logo Container */}
            <Box
              sx={{
                width: { xs: '70px', md: '124px' },
                height: { xs: '70px', md: '124px' },
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: { xs: 1.5, md: 3 },
                backdropFilter: 'blur(4px)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Image
                src={uni.logo}
                alt={`${uni.name} Logo`}
                width={index === 0 ? 52 : 46}
                height={index === 0 ? 52 : 46}
                style={{
                  objectFit: 'contain',
                  filter: uni.logoInvert ? 'brightness(0) invert(1)' : 'none'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/png/university_placeholder.png';
                }}
              />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontFamily: FONTS.primary,
                fontWeight: 600,
                fontSize: { xs: '14px', md: '24px' },
                lineHeight: { xs: '18px', md: '30px' },
                color: COLORS.white,
                textAlign: 'center',
                mb: 0.5
              }}
            >
              {uni.name}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: FONTS.primary,
                fontWeight: 400,
                fontSize: { xs: '12px', md: '24px' },
                lineHeight: { xs: '16px', md: '30px' },
                color: COLORS.white,
                textAlign: 'center'
              }}
            >
              {uni.location}
            </Typography>
          </Box>
        </Box>
      ))}

      {/* Header Overlay Content */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '20px', md: '56px' },
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 2,
          px: 2
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontFamily: FONTS.primary,
            fontWeight: 600,
            fontSize: { xs: '20px', md: '40px' },
            lineHeight: { xs: '26px', md: '56px' },
            color: COLORS.white,
            textAlign: 'center',
            mb: 0.5,
            textShadow: '0px 2px 10px rgba(0,0,0,0.3)'
          }}
        >
          Compare Universities
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: FONTS.secondary,
            fontWeight: 400,
            fontSize: { xs: '12px', md: '24px' },
            lineHeight: { xs: '16px', md: '32px' },
            color: COLORS.white,
            textAlign: 'center',
            textShadow: '0px 2px 10px rgba(0,0,0,0.3)'
          }}
        >
          Compare any two universities of your choice.
        </Typography>
      </Box>

      {/* Action Button */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: '24px', md: '60px' },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          width: { xs: '80%', sm: 'auto' },
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Button
          onClick={handleCompareClick}
          variant="contained"
          sx={{
            background: COLORS.white,
            borderRadius: '8px',
            px: { xs: 3, md: 5 },
            py: { xs: 1.2, md: 2 },
            color: COLORS.black,
            fontFamily: FONTS.primary,
            fontWeight: 600,
            fontSize: { xs: '14px', md: '20px' },
            lineHeight: '20px',
            textTransform: 'none',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
            whiteSpace: 'nowrap',
            '&:hover': {
              background: '#f0f0f0',
              transform: 'translateY(-2px)',
              boxShadow: '0px 6px 25px rgba(0, 0, 0, 0.2)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Compare Universities
        </Button>
      </Box>
    </Box>
  );
};

export default CompareUniversitiesSection;
