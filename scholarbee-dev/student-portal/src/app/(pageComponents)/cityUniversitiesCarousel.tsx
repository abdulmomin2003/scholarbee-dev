import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { carouselStyles } from '@/components/molecules/carouselStyles';
import CityCarouselClient from './cityUniversitiesCarousel/CityCarouselClient';

const CityUniversitiesCarousel: React.FC = () => {
  return (
    <Box sx={{ ...carouselStyles.section, py: { xs: 4, md: 5 } }}>
      <Container
        sx={{
          ...carouselStyles.container,
          alignItems: 'flex-start'
        }}
      >
        <Box
          sx={{
            ...carouselStyles.headerContainer,
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              ...carouselStyles.header,
              alignItems: 'center',
              gap: 1
            }}
          >
            <Typography
              component="h2"
              sx={{
                ...carouselStyles.title,
                textAlign: 'center'
              }}
              variant="h4"
            >
              Explore the Top University in your City
            </Typography>
            <Typography
              sx={{
                ...carouselStyles.subtitle,
                textAlign: 'center',
                opacity: 0.8
              }}
              variant="body2"
            >
              Discover the right universities faster with verified information
              in your own desired city.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                mt: 2,
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' }
              }}
            >
              <Link href="/universities" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: '#004AE0',
                    color: '#004AE0',
                    fontFamily: "'Poppins', sans-serif",
                    fontStyle: 'normal',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '24px',
                    textTransform: 'none',
                    borderRadius: '8px',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#0039B8',
                      backgroundColor: 'rgba(0, 74, 224, 0.04)'
                    }
                  }}
                >
                  See all Universities
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>

      <Container>
        <CityCarouselClient />
      </Container>
    </Box>
  );
};

export default CityUniversitiesCarousel;
