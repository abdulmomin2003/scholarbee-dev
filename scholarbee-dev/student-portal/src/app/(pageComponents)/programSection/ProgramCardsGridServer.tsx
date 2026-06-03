import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import Link from 'next/link';
import { carouselStyles } from '@/components/molecules/carouselStyles';
import ProgramCardServer from './ProgramCardServer';
import { isPersonalizedScoringMode } from '@/utils/recommendations';
import { ElasticsearchAdmissionProgramDocument } from '@/types/admission-program.types';

/** Server-rendered grid of program cards for SEO. Full content in initial HTML. */
export default function ProgramCardsGridServer({
  programs,
  seeAllHref = '/programs'
}: {
  programs: ElasticsearchAdmissionProgramDocument[];
  seeAllHref?: string;
}) {
  if (!programs?.length) return null;

  return (
    <Box sx={carouselStyles.section}>
      <Container sx={carouselStyles.container}>
        <Box sx={carouselStyles.headerContainer}>
          <Box sx={carouselStyles.header}>
            <Typography component="h2" sx={carouselStyles.title} variant="h4">
              Explore Top Academic Programs
            </Typography>
            <Typography sx={carouselStyles.subtitle} variant="body2">
              Compare universities, check programs offered, and apply
              confidently.
            </Typography>
            {programs.length > 0 && (
              <Box
                sx={{
                  display: 'inline-block',
                  mt: 1.5,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  backgroundColor: isPersonalizedScoringMode(programs[0]?.scoring_mode)
                    ? 'rgba(74, 222, 128, 0.15)'
                    : 'rgba(244, 63, 94, 0.15)',
                  border: `1px solid ${isPersonalizedScoringMode(programs[0]?.scoring_mode) ? 'rgba(74, 222, 128, 0.5)' : 'rgba(244, 63, 94, 0.5)'}`,
                  color: isPersonalizedScoringMode(programs[0]?.scoring_mode)
                    ? '#16a34a'
                    : '#be123c',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                SSR Mode:{' '}
                {isPersonalizedScoringMode(programs[0]?.scoring_mode)
                  ? '🎯 Personalized Recommendations'
                  : '🔥 Trending Fallback'}
              </Box>
            )}
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
            '&::-webkit-scrollbar': {
              height: 8
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: 4
            }
          }}
        >
          {programs.map((program) => (
            <Box
              component="li"
              key={program._id}
              sx={{
                ...carouselStyles.cardWrapper,
                flex: '0 0 auto',
                minWidth: { xs: 280, sm: 320, md: 360 },
                maxWidth: { xs: 320, md: 464 },
                scrollSnapAlign: 'start'
              }}
            >
              <ProgramCardServer program={program} />
            </Box>
          ))}
        </Box>
        <Box sx={carouselStyles.seeAllContainer}>
          <Link href={seeAllHref} style={{ textDecoration: 'none' }}>
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
