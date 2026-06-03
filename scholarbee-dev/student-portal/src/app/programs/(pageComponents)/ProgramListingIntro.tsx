'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const introStyles = {
  section: {
    py: { xs: 4, md: 5 },
    backgroundColor: '#FFFFFF'
  },
  content: {
    // maxWidth: 720,
    margin: '0 auto'
  },
  heading: {
    fontWeight: 700,
    color: '#070808',
    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
    mb: 3
  },
  body: {
    color: '#444850',
    fontSize: { xs: '0.9375rem', md: '1rem' },
    lineHeight: 1.7,
    mb: 2.5,
    '&:last-of-type': { mb: 0 }
  }
};

/** Level 1: H1 + 2–3 paragraphs (program scope, eligibility, career prospects). */
export function Level1ProgramIntro({ majorName }: { majorName: string }) {
  return (
    <Box component="section" sx={introStyles.section}>
      <Container>
        <Box sx={introStyles.content}>
          <Typography component="h1" sx={introStyles.heading}>
            {majorName} Programs in Pakistan
          </Typography>
          <Typography sx={introStyles.body}>
            {majorName} programs across Pakistani universities prepare students
            with the core knowledge and skills needed for their chosen field.
            From foundational theory to practical application, these degrees are
            designed to meet both national and international academic standards.
          </Typography>
          <Typography sx={introStyles.body}>
            Eligibility typically includes completion of intermediate
            (FSc/FA/ICS or equivalent) with required subjects and minimum marks
            as set by each university. Some institutions also accept A-Levels or
            other equivalent qualifications. Admission may be merit-based or
            involve entrance tests depending on the university.
          </Typography>
          <Typography sx={introStyles.body}>
            Graduates of {majorName} programs find opportunities in both public
            and private sectors, including education, industry, healthcare,
            technology, and research. The degree also provides a strong base for
            further specialization at the master&apos;s and doctoral levels.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

/** Level 2: Short city-specific intro above the listing. */
export function Level2CityIntro({
  majorName,
  cityName
}: {
  majorName: string;
  cityName: string;
}) {
  return (
    <Box component="section" sx={introStyles.section}>
      <Container>
        <Box sx={introStyles.content}>
          <Typography component="h1" sx={introStyles.heading}>
            {majorName} Programs in {cityName}
          </Typography>
          <Typography sx={introStyles.body}>
            Find and compare {majorName} programs offered by universities in{' '}
            {cityName}. Browse admission deadlines, fees, and eligibility to
            choose the right fit for you.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
