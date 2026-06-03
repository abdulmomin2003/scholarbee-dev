import { COLORS } from '@/constants/colors';
import { Box, Container, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { EASY_PROGRAM_SLUGS_AND_MAJORS } from '@/app/programs/constants';

const QUICK_PROGRAM_SELECTION_DATA = EASY_PROGRAM_SLUGS_AND_MAJORS.map(
  (item, index) => ({
    id: index + 1,
    title: item.title,
    slug: item.slug,
    link: `/programs/${item.slug}`
  })
);

const QuickProgramSelection = () => {
  return (
    <Container>
      <Typography
        component="h3"
        mt={5}
        textAlign={'start'}
        variant="h5"
        fontWeight={500}
      >
        Easy Program Selection
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns="repeat(4, 1fr)"
        gap={2}
        mt={3}
        sx={{
          '@media (max-width: 1200px)': {
            gridTemplateColumns: 'repeat(3, 1fr)'
          },
          '@media (max-width: 900px)': {
            gridTemplateColumns: 'repeat(2, 1fr)'
          },
          '@media (max-width: 600px)': {
            gridTemplateColumns: '1fr'
          }
        }}
      >
        {QUICK_PROGRAM_SELECTION_DATA.map((item) => (
          <Link
            key={item?.id}
            href={item?.link}
            style={{ textDecoration: 'none' }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: COLORS.bgBlue,
                border: `1px solid ${COLORS.borderDark}`,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                height: '60px',
                '&:hover': {
                  backgroundColor: 'rgba(64, 119, 255, 0.15)',
                  border: `1px solid ${COLORS.primary}`,
                  color: COLORS.primary,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Typography
                textAlign={'start'}
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: COLORS.textSecondary,
                  pl: 1,
                  // py: 1,

                  flex: 1,
                  '&:hover': {
                    color: 'inherit'
                  }
                }}
              >
                {item?.title}
              </Typography>
              <ArrowForwardIcon
                sx={{
                  color: COLORS.lightGray,
                  fontSize: 20,
                  mr: 2
                }}
              />
            </Box>
          </Link>
        ))}
      </Box>
    </Container>
  );
};

export default QuickProgramSelection;
