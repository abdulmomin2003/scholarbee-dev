'use client';
import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';
import { carouselStyles } from '@/components/molecules/carouselStyles';
import { useCarousel } from '@/components/molecules/hooks/useCarousel';
import { useCarouselSliderSettings } from '@/components/molecules/utils/carouselSliderSettings';
import Slider from 'react-slick';
import CityCard from './cityCard';
import { POPULAR_CITIES } from './cityConstants';

const CityCarousel: React.FC = () => {
  const { sliderRef, handleNext, handlePrev } = useCarousel();
  const baseSliderSettings = useCarouselSliderSettings({
    breakpoint: 1024,
    slidesToShowMedium: 2
  });

  const sliderSettings = {
    ...baseSliderSettings,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true
  };

  const displayCities = useMemo(() => POPULAR_CITIES, []);

  return (
    <Box
      sx={{
        ...carouselStyles.carouselContainer,
        mb: 0,
        position: 'relative',
        '& .slick-slide': {
          p: 0
        },
        '& .slick-list': {
          margin: 0,
          padding: 0
        },
        '& .slick-track': {
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 0,
          paddingBottom: 0
        }
      }}
    >
      <Box
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          left: { xs: '-8px', md: '-20px' },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          boxSizing: 'border-box',
          width: { xs: '40px', md: '60px' },
          height: { xs: '40px', md: '60px' },
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: 'hsla(0, 0%, 100%, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '0.833333px solid #CED0D4',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            background: '#FFFFFF'
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '16px', md: '24px' },
            height: { xs: '20px', md: '44px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Image
            src="/assets/svg/arrow-left.svg"
            alt="Previous"
            width={24}
            height={44}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>
      </Box>
      <Slider
        ref={sliderRef}
        {...sliderSettings}
        className="city-universities-carousel-container"
      >
        {displayCities.map((city) => (
          <Box
            key={city.name}
            sx={{
              ...carouselStyles.cardWrapper,
              px: { xs: 0.5, md: 0 }
            }}
          >
            <CityCard city={city} />
          </Box>
        ))}
      </Slider>
      <Box
        onClick={handleNext}
        sx={{
          position: 'absolute',
          right: { xs: '-8px', md: '-20px' },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          boxSizing: 'border-box',
          width: { xs: '40px', md: '60px' },
          height: { xs: '40px', md: '60px' },
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: 'hsla(0, 0%, 100%, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '0.833333px solid #CED0D4',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            background: '#FFFFFF'
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '16px', md: '24px' },
            height: { xs: '20px', md: '44px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Image
            src="/assets/svg/arrow-right.svg"
            alt="Next"
            width={24}
            height={44}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CityCarousel;
