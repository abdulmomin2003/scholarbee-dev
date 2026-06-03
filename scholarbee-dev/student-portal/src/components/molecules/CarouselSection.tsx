'use client';
import React, { ReactNode } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';
import CarouselNavigationArrows from './CarouselNavigationArrows';
import { carouselStyles } from './carouselStyles';

interface CarouselSectionProps {
  title: string;
  subtitle: string;
  onPrev: () => void;
  onNext: () => void;
  children: ReactNode;
  seeAllHref: string;
  sectionBgColor?: string;
  prevArrowStyle?: 'default' | 'white' | 'black';
  nextArrowStyle?: 'default' | 'white' | 'black';
  containerAlignItems?: 'flex-start' | 'flex-end';
}

const CarouselSection: React.FC<CarouselSectionProps> = ({
  title,
  subtitle,
  onPrev,
  onNext,
  children,
  seeAllHref,
  sectionBgColor,
  prevArrowStyle = 'white',
  nextArrowStyle = 'default',
  containerAlignItems = 'flex-end'
}) => {
  return (
    <Box
      className="carousel-section"
      sx={{
        ...carouselStyles.section,
        ...(sectionBgColor && { bgcolor: sectionBgColor })
      }}
    >
      <Container
        className="carousel-section-container"
        sx={{
          ...carouselStyles.container,
          alignItems: containerAlignItems
        }}
      >
        <Box
          className="carousel-header-container"
          sx={carouselStyles.headerContainer}
        >
          <Box className="carousel-header" sx={carouselStyles.header}>
            <Typography
              component="h2"
              className="carousel-title"
              sx={carouselStyles.title}
              variant="h4"
            >
              {title}
            </Typography>
            <Typography
              className="carousel-subtitle"
              sx={carouselStyles.subtitle}
              variant="body2"
            >
              {subtitle}
            </Typography>
          </Box>
          <CarouselNavigationArrows
            onPrev={onPrev}
            onNext={onNext}
            prevArrowStyle={prevArrowStyle}
            nextArrowStyle={nextArrowStyle}
          />
        </Box>
      </Container>

      <Container
        sx={{
          px: { xs: 2, md: 3 }
        }}
      >
        <Box
          className="carousel-container"
          sx={carouselStyles.carouselContainer}
        >
          {children}
        </Box>
      </Container>

      <Container
        className="carousel-see-all-container"
        sx={carouselStyles.seeAllContainer}
      >
        <Link
          href={seeAllHref}
          className="carousel-see-all-link"
          style={{
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <Button
            variant="outlined"
            className="carousel-see-all-button"
            sx={carouselStyles.seeAllButton}
          >
            See All
          </Button>
        </Link>
      </Container>
    </Box>
  );
};

export default CarouselSection;
