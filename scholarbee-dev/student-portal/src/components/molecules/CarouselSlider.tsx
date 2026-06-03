'use client';
import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import SliderBase from 'react-slick';
import { carouselStyles } from './carouselStyles';

// Type assertion to fix TypeScript compatibility issue with react-slick
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Slider = SliderBase as any;

interface CarouselSliderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sliderRef: React.RefObject<any>;
  sliderSettings: Record<string, unknown>;
  children: ReactNode;
  className?: string;
}

const CarouselSlider: React.FC<CarouselSliderProps> = ({
  sliderRef,
  sliderSettings,
  children,
  className
}) => {
  return (
    <Box className={className} sx={carouselStyles.carouselContainer}>
      <Slider ref={sliderRef} {...sliderSettings}>
        {children}
      </Slider>
    </Box>
  );
};

export default CarouselSlider;
