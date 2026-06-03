'use client';
import { useEffect, useState, memo } from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';
import { styled } from '@mui/system';
import { AnimatedBoxProps, LogoSliderProps } from '@/types/sliderTypes';

const SliderContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$animated'
})<AnimatedBoxProps>(({ $animated }) => ({
  maxWidth: '100%',
  margin: 'auto',
  position: 'relative',
  ...($animated && {
    overflow: 'hidden',
    WebkitMask:
      'linear-gradient(90deg, transparent, white 20%, white 80%, transparent)',
    mask: 'linear-gradient(90deg, transparent, white 20%, white 80%, transparent)'
  })
}));

const SlideTrack = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== '$animated' && prop !== '$speed' && prop !== '$direction'
})<AnimatedBoxProps>(({ $animated, $speed, $direction }) => ({
  display: 'flex',
  gap: '2rem',
  padding: '1rem',
  transform: 'translateZ(0)',
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  ...($animated && {
    width: 'max-content',
    flexWrap: 'nowrap',
    animation: `infiniteScroll ${$speed === 'fast' ? '30s' : '50s'} ${
      $direction === 'right' ? 'reverse' : 'forwards'
    } linear infinite`,
    '&:hover': {
      animationPlayState: 'running'
    }
  }),
  '@keyframes infiniteScroll': {
    '0%': {
      transform: 'translateX(0)'
    },
    '100%': {
      transform: 'translateX(calc(-50%))'
    }
  }
}));

const SlideItem = styled(Box)({
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem'
});

const LogoSlider = memo(
  ({
    partners,
    speed = 'slow',
    direction = 'left',
    className
  }: LogoSliderProps) => {
    const [isAnimated, setIsAnimated] = useState(false);
    const [duplicateCount, setDuplicateCount] = useState(2);

    useEffect(() => {
      const shouldAnimate = !window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (shouldAnimate) {
        setIsAnimated(true);
      }

      // Calculate how many times we need to duplicate the partners
      // to ensure smooth infinite scrolling
      const container = document.querySelector('.logo-slider-container');
      if (container) {
        const containerWidth = container.clientWidth;
        const itemWidth = 220 + 32; // logo width + gap
        const itemsNeeded =
          Math.ceil(containerWidth / (partners.length * itemWidth)) + 1;
        setDuplicateCount(Math.max(2, itemsNeeded));
      }
    }, [partners.length]);

    // Create duplicates of the partners array
    const duplicatedPartners = Array(duplicateCount).fill(partners).flat();

    return (
      <SliderContainer
        $animated={isAnimated}
        className={`logo-slider-container ${className || ''}`}
        role="region"
        aria-label="Partner logos"
      >
        <SlideTrack
          $animated={isAnimated}
          $speed={speed}
          $direction={direction}
        >
          {duplicatedPartners.map((partner, index) => (
            <SlideItem
              key={`logo-${index}`}
              aria-hidden={index >= partners.length ? 'true' : 'false'}
            >
              <Image
                src={partner.src}
                alt={partner.alt || `Partner ${(index % partners.length) + 1}`}
                width={200}
                height={110}
                style={{
                  maxWidth: '100%',
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain'
                }}
                loading={index < partners.length ? 'eager' : 'lazy'}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={75}
              />
            </SlideItem>
          ))}
        </SlideTrack>
      </SliderContainer>
    );
  }
);

LogoSlider.displayName = 'LogoSlider';

export default LogoSlider;
