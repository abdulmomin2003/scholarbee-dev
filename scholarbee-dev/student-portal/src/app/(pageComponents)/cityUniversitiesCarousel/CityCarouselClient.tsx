'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { carouselStyles } from '@/components/molecules/carouselStyles';
import { POPULAR_CITIES } from './cityConstants';
import CityCarousel from './cityCarousel';

function CityCardsStatic() {
  return (
    <Box
      sx={{
        ...carouselStyles.carouselContainer,
        mb: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: 'center'
      }}
    >
      {POPULAR_CITIES.map((city) => (
        <Link
          key={city.name}
          href={`/universities?city=${encodeURIComponent(city.name)}`}
          style={{ textDecoration: 'none', flex: '1 1 160px', maxWidth: 280 }}
        >
          <Box
            sx={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              aspectRatio: '4/3',
              width: '100%'
            }}
          >
            <Image
              src={city.imageUrl}
              alt={city.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                p: 2,
                background:
                  'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)'
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  fontSize: { xs: '18px', md: '22px' },
                  color: '#fff'
                }}
              >
                {city.label}
              </Typography>
            </Box>
          </Box>
        </Link>
      ))}
    </Box>
  );
}

export default function CityCarouselClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <CityCardsStatic />;
  }

  return <CityCarousel />;
}
