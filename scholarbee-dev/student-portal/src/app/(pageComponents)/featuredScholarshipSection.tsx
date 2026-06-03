'use client';
import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import ScholarshipCarouselCard from './scholarshipCarouselCard';
import { Scholarship } from '@/types/scholarship';
import CarouselSection from '@/components/molecules/CarouselSection';
import { carouselStyles } from '@/components/molecules/carouselStyles';
import { useCarousel } from '@/components/molecules/hooks/useCarousel';
import { useCarouselSliderSettings } from '@/components/molecules/utils/carouselSliderSettings';
import CarouselSlider from '@/components/molecules/CarouselSlider';
import CarouselEmptyState from '@/components/molecules/CarouselEmptyState';
import { mockScholarshipsResponse } from '@/mockData/scholarshipsMockData';

const FeaturedScholarshipSection = () => {
  // Using mock data instead of API call
  const scholarshipsData = mockScholarshipsResponse;
  const isLoading = false;

  const { sliderRef, handleNext, handlePrev } = useCarousel();
  const sliderSettings = useCarouselSliderSettings({
    breakpoint: 1200,
    slidesToShowMedium: 2
  });

  const displayScholarships = useMemo(() => {
    if (!scholarshipsData?.data) return [];
    return scholarshipsData.data.slice(0, 10);
  }, [scholarshipsData?.data]);

  return (
    <Box>
      {isLoading ? (
        <CarouselEmptyState message="Loading scholarships..." />
      ) : displayScholarships.length > 0 ? (
        <CarouselSection
          title="Find Scholarships That Fit You"
          subtitle="Funding opportunities tailored for your academic journey."
          onPrev={handlePrev}
          onNext={handleNext}
          seeAllHref="/search-scholarship"
          sectionBgColor="transparent"
          prevArrowStyle="white"
          nextArrowStyle="white"
        >
          <CarouselSlider
            sliderRef={sliderRef}
            sliderSettings={sliderSettings}
            className="scholarship-carousel-container"
          >
            {displayScholarships.map((scholarship: Scholarship) => {
              return (
                <Box key={scholarship._id} sx={carouselStyles.cardWrapper}>
                  <ScholarshipCarouselCard scholarship={scholarship} />
                </Box>
              );
            })}
          </CarouselSlider>
        </CarouselSection>
      ) : (
        <CarouselEmptyState message="No scholarships found" />
      )}
    </Box>
  );
};

export default FeaturedScholarshipSection;
