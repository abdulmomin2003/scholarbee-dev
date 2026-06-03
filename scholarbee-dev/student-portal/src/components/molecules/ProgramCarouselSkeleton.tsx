'use client';
import React from 'react';
import { Box, Container, Skeleton } from '@mui/material';
import { carouselStyles } from './carouselStyles';
import CarouselSlider from './CarouselSlider';
import { useCarousel } from './hooks/useCarousel';
import { useCarouselSliderSettings } from './utils/carouselSliderSettings';

const ProgramCarouselCardSkeleton = () => {
  return (
    <Box sx={styles.card}>
      {/* Image Skeleton */}
      <Box sx={styles.imageContainer}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{ borderRadius: '8px' }}
        />
      </Box>

      {/* Title Row */}
      <Box sx={styles.titleRow}>
        <Skeleton variant="text" width="100%" height={33} />
      </Box>

      {/* University Info */}
      <Box sx={styles.universityInfo}>
        <Box sx={styles.universityRow}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width="60%" height={24} />
        </Box>
        <Box sx={styles.locationRow}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width="70%" height={24} />
        </Box>
      </Box>

      {/* Program Details */}
      <Box sx={styles.programDetails}>
        <Box sx={styles.detailRow}>
          <Skeleton variant="text" width="40%" height={27} />
          <Skeleton variant="text" width="35%" height={30} />
        </Box>
        <Box sx={styles.detailRow}>
          <Skeleton variant="text" width="40%" height={27} />
          <Skeleton variant="text" width="35%" height={30} />
        </Box>
        <Box sx={styles.detailRow}>
          <Skeleton variant="text" width="40%" height={27} />
          <Skeleton variant="text" width="35%" height={30} />
        </Box>
      </Box>

      {/* Apply Button */}
      <Box sx={styles.actionButtons}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={56}
          sx={{ borderRadius: '10px' }}
        />
      </Box>
    </Box>
  );
};

const ProgramCarouselSkeleton = () => {
  const { sliderRef } = useCarousel();
  const sliderSettings = useCarouselSliderSettings({
    breakpoint: 1024,
    slidesToShowMedium: 2
  });

  return (
    <Box sx={carouselStyles.section}>
      <Container
        className="carousel-section-container"
        sx={{
          ...carouselStyles.container,
          alignItems: 'flex-end'
        }}
      >
        <Box
          className="carousel-header-container"
          sx={carouselStyles.headerContainer}
        >
          <Box className="carousel-header" sx={carouselStyles.header}>
            <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="80%" height={36} />
          </Box>
          {/* Navigation Arrows Skeleton */}
          <Box sx={styles.arrowsContainer}>
            <Skeleton
              variant="circular"
              width={48}
              height={48}
              sx={{ mr: 1 }}
            />
            <Skeleton variant="circular" width={48} height={48} />
          </Box>
        </Box>
      </Container>

      {/* Carousel Slider Skeleton */}
      <Container
        sx={{
          px: { xs: 2, md: 3 }
        }}
      >
        <CarouselSlider
          sliderRef={sliderRef}
          sliderSettings={sliderSettings}
          className="program-carousel-container"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <Box key={index} sx={carouselStyles.cardWrapper}>
              <ProgramCarouselCardSkeleton />
            </Box>
          ))}
        </CarouselSlider>
      </Container>

      {/* See All Button Skeleton */}
      <Container
        className="carousel-see-all-container"
        sx={carouselStyles.seeAllContainer}
      >
        <Skeleton
          variant="rectangular"
          height={56}
          sx={{
            width: { xs: '100%', sm: '400px' },
            borderRadius: '10px'
          }}
        />
      </Container>
    </Box>
  );
};

export default ProgramCarouselSkeleton;

const styles = {
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '464px',
    margin: '0 auto',
    background: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 4px 80px rgba(0, 0, 0, 0.12)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minHeight: { xs: 'auto', md: '656px' }
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: { xs: '200px', md: '232px' },
    borderRadius: '8px',
    overflow: 'hidden'
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%'
  },
  universityInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px'
  },
  universityRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px'
  },
  locationRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px'
  },
  programDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    width: '100%'
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  arrowsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px'
  }
};
