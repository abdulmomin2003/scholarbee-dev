'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import type { CityData } from './cityConstants';
import { toUrlSlug } from '@/utils/helperFunctions';

interface CityCardProps {
  city: CityData;
}

const CityCard: React.FC<CityCardProps> = ({ city }) => {
  const citySlug = toUrlSlug(city.name);
  const universitiesByCityUrl = `/universities/${citySlug}`;
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        aspectRatio: '4/3',
        width: '100%'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          '&:hover': {
            '& .gradient-overlay': {
              height: '100%'
            },
            '& .text-content': {
              gap: 2,
              transform: 'translateY(-70px)'
            },
            '& .city-card-label': {
              color: '#FFFFFF'
            }
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }
        }}
      >
        {/* City Image */}
        <Image
          src={city.imageUrl}
          alt={city.name}
          fill
          style={{
            objectFit: 'cover'
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
        {/* Gradient Overlay */}
        <Box
          className="gradient-overlay"
          sx={{
            position: 'absolute',
            height: '100%',
            left: 0,
            right: 0,
            bottom: 0,
            transition: 'height 0.1s ease-in-out',
            background:
              'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.8) 80%)',
            zIndex: 1
          }}
        />

        {/* Text Content */}
        <Box
          className="text-content"
          sx={{
            position: 'absolute',
            bottom: '-4rem',
            left: 0,
            right: 0,
            zIndex: 2,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            transition: 'all 0.25s ease-in-out'
          }}
        >
          <Typography
            className="city-card-label"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontStyle: 'normal',
              fontWeight: 500,
              textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              fontSize: { xs: '20px', md: '24px' },
              lineHeight: { xs: '30px', md: '36px' },
              color: 'hsla(0, 0%, 100%, 0.9)',
              textAlign: 'center'
            }}
          >
            {city?.label || ''}
          </Typography>
          <Link
            href={universitiesByCityUrl}
            style={{
              alignSelf: 'center',
              textDecoration: 'none'
            }}
            aria-label={`Explore universities in ${city.label}`}
          >
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                backgroundColor: 'hsla(0, 0%, 100%, 0.6)',
                color: 'hsla(0, 0%, 0%, 0.9)',
                textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                fontFamily: "'Poppins', sans-serif",
                fontStyle: 'normal',
                fontWeight: 500,
                fontSize: '16px',
                lineHeight: '24px',
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                py: 1,
                '&:hover': {
                  backgroundColor: 'hsla(0, 0%, 100%, 0.8)'
                }
              }}
            >
              Explore →
            </Box>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default CityCard;
