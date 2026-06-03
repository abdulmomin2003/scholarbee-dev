import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import Link from 'next/link';
import { carouselStyles } from '@/components/molecules/carouselStyles';
import ScholarshipCardServer from './ScholarshipCardServer';
import { Scholarship } from '@/types/scholarship';

/** Server-rendered grid of scholarship cards for SEO. Full content in initial HTML. */
export default function ScholarshipsCardsGridServer({
  scholarships
}: {
  scholarships: Scholarship[];
}) {
  if (!scholarships?.length) return null;

  return (
    <Box sx={carouselStyles.section}>
      <Container sx={carouselStyles.container}>
        <Box sx={carouselStyles.headerContainer}>
          <Box sx={carouselStyles.header}>
            <Typography component="h2" sx={carouselStyles.title} variant="h4">
              Find Scholarships That Fit You
            </Typography>
            <Typography sx={carouselStyles.subtitle} variant="body2">
              Funding opportunities tailored for your academic journey.
            </Typography>
          </Box>
        </Box>
      </Container>
      <Container sx={{ px: { xs: 2, md: 3 } }}>
        <Box
          component="ul"
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            gap: 2,
            listStyle: 'none',
            m: 0,
            p: 0,
            py: { xs: 1, md: 2 },
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: 4
            }
          }}
        >
          {scholarships.map((scholarship) => (
            <Box
              component="li"
              key={scholarship._id}
              sx={{
                ...carouselStyles.cardWrapper,
                flex: '0 0 auto',
                minWidth: { xs: 280, sm: 320, md: 360 },
                maxWidth: { xs: 320, md: 464 },
                scrollSnapAlign: 'start'
              }}
            >
              <ScholarshipCardServer scholarship={scholarship} />
            </Box>
          ))}
        </Box>
        <Box sx={carouselStyles.seeAllContainer}>
          <Link href="/search-scholarship" style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                ...carouselStyles.seeAllButton,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              component="span"
            >
              See All
            </Box>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
