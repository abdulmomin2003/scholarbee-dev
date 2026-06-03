'use client';
import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import Image from 'next/image';
import leftArrIcon from '@public/assets/svg/arrow-left.svg';
import rightArrIcon from '@public/assets/svg/arrow-right.svg';

interface CarouselNavigationArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  prevArrowStyle?: 'default' | 'white' | 'black';
  nextArrowStyle?: 'default' | 'white' | 'black';
}

const CarouselNavigationArrows: React.FC<CarouselNavigationArrowsProps> = ({
  onPrev,
  onNext,
  prevArrowStyle = 'white',
  nextArrowStyle = 'default'
}) => {
  const getPrevArrowStyles = (): SxProps<Theme> => {
    const baseStyles: SxProps<Theme> = {
      boxSizing: 'border-box',
      width: '48px',
      height: '48px',
      borderRadius: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      flex: 'none',
      flexGrow: 0,
      position: 'relative',
      transition: 'background-color 0.2s ease-in-out'
    };

    if (prevArrowStyle === 'black') {
      return {
        ...baseStyles,
        background: '#000000',
        boxShadow: '0px 2px 20px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          background: '#004AE0',
          '& img': {
            filter: 'invert(1)'
          }
        },
        '& img': {
          filter: 'invert(1)'
        }
      };
    }

    // Default white style
    return {
      ...baseStyles,
      background:
        prevArrowStyle === 'white' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
      border: '0.833333px solid #CED0D4',
      '&:hover': {
        background: '#004AE0',
        border: '0.833333px solid #004AE0',
        '& img': {
          filter: 'invert(1)'
        }
      }
    };
  };

  const getNextArrowStyles = (): SxProps<Theme> => {
    const baseStyles: SxProps<Theme> = {
      boxSizing: 'border-box',
      width: '48px',
      height: '48px',
      borderRadius: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      flex: 'none',
      flexGrow: 0,
      position: 'relative',
      transition: 'background-color 0.2s ease-in-out'
    };

    if (nextArrowStyle === 'black') {
      return {
        ...baseStyles,
        background: '#000000',
        boxShadow: '0px 2px 20px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          background: '#004AE0',
          '& img': {
            filter: 'invert(1)'
          }
        },
        '& img': {
          filter: 'invert(1)'
        }
      };
    }

    // Default white style
    return {
      ...baseStyles,
      background:
        nextArrowStyle === 'white' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
      border: '0.833333px solid #CED0D4',
      '&:hover': {
        background: '#004AE0',
        border: '0.833333px solid #004AE0',
        '& img': {
          filter: 'invert(1)'
        }
      }
    };
  };

  const getPrevArrowTransform = () => {
    // For FeaturedScholarshipSection style (rotated)
    if (prevArrowStyle === 'white' && nextArrowStyle === 'black') {
      return 'translate(-50%, -50%) rotate(90deg)';
    }
    // For ProgramSection style (default)
    return 'translate(-50%, -50%)';
  };

  const getNextArrowTransform = () => {
    // For FeaturedScholarshipSection style (rotated)
    if (prevArrowStyle === 'white' && nextArrowStyle === 'black') {
      return 'translate(-50%, -50%) rotate(-90deg)';
    }
    // For ProgramSection style (default - no transform needed since we have arrow-right)
    return 'translate(-50%, -50%)';
  };

  return (
    <Box className="carousel-arrows-container" sx={styles.arrowsContainer}>
      <Box
        className="carousel-arrow carousel-arrow-prev"
        onClick={onPrev}
        sx={getPrevArrowStyles()}
      >
        <Image
          src={leftArrIcon}
          alt="Previous"
          width={10}
          height={18}
          className="carousel-arrow-icon carousel-arrow-icon-prev"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: getPrevArrowTransform()
          }}
        />
      </Box>
      <Box
        className="carousel-arrow carousel-arrow-next"
        onClick={onNext}
        sx={getNextArrowStyles()}
      >
        <Image
          src={rightArrIcon}
          alt="Next"
          width={10}
          height={18}
          className="carousel-arrow-icon carousel-arrow-icon-next"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: getNextArrowTransform()
          }}
        />
      </Box>
    </Box>
  );
};

const styles = {
  arrowsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '20px',
    flexShrink: 0,
    justifyContent: 'flex-end'
  }
};

export default CarouselNavigationArrows;
