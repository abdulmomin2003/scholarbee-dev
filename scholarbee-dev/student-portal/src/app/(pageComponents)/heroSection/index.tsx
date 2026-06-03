import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import VideoCarousel from './VideoCarousel';
import DecorativeElements from './DecorativeElements';
import StatsDataFetcher from './StatsDataFetcher';
import StatsStatic from './StatsStatic';
import FooterBanner from './FooterBanner';
import UserStatusFetcher from './UserStatusFetcher';
import TagWithIcon from './TagWithIcon';
import { styles } from './styles';
import { API_URL } from '@/constants/config';
import { cookies } from 'next/headers';

interface InitialStats {
  campuses?: number | string;
  programs?: number | string;
  scholarships?: number | string;
}

const fetchStats = async () => {
  try {
    const [campusesRes, admissionRes, scholarshipsRes] = await Promise.all([
      fetch(`${API_URL}/campuses/count`),
      fetch(`${API_URL}/admission-programs/count`),
      fetch(`${API_URL}/scholarships/count`)
    ]);

    const campusesJson = campusesRes.ok ? await campusesRes.json() : null;
    const admissionJson = admissionRes.ok ? await admissionRes.json() : null;
    const scholarshipsJson = scholarshipsRes.ok
      ? await scholarshipsRes.json()
      : null;

    return {
      campuses:
        campusesJson?.total_campuses_count ??
        campusesJson?.total_campuses_count ??
        '0',
      programs:
        admissionJson?.total_admission_programs_count ??
        admissionJson?.total_admission_programs_count ??
        '0',
      scholarships:
        scholarshipsJson?.total_scholarships_count ??
        scholarshipsJson?.total_scholarships_count ??
        '0'
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return { campuses: '0', programs: '0', scholarships: '0' };
  }
};

const HeroSection = async () => {
  let initialStats: InitialStats | null = null;
  initialStats = await fetchStats();

  const cookieStore = cookies();
  const hasToken = cookieStore.has('access_token');

  return (
    <Box sx={styles.heroSection}>
      <Container sx={styles.container} maxWidth="lg">
        {/* Left Content */}
        <Box sx={styles.leftContent}>
          <Box sx={styles.contentWrapper}>
            {/* Tag */}
            <TagWithIcon styles={styles} />

            {/* Heading and Description */}
            <Box sx={styles.textContent}>
              {/* <Typography
                component="h1"
                variant="h3"
                fontWeight={600}
                sx={styles.heading}
              >
                Find Universities &amp; Scholarships in Pakistan
              </Typography> */}
              <Typography
                component="h1"
                variant="h3"
                fontWeight={600}
                sx={styles.heading}
              >
                All admissions.
                <br /> All scholarships.
                <br />
                <span style={{ color: 'rgb(0, 138, 255)' }}>
                   One ScholarBee
                </span>
              </Typography>
              <Typography variant="h6" fontWeight={400} sx={styles.description}>
                Explore hundreds of programs, scholarships, and universities all
                in one place.
              </Typography>
            </Box>
          </Box>

          {/* Login Button or Explore Button */}
          <UserStatusFetcher styles={styles} initialLoggedIn={hasToken} />
        </Box>

        {/* Right Content - Video */}
        <Box sx={styles.rightContent}>
          <VideoCarousel styles={styles} />

          {/* Decorative Elements */}
          <DecorativeElements styles={styles} />

          {/* Stats Section */}
          {/*
            If `initialStats` is provided by the server, render a server-safe
            static stats block so counts appear in the HTML. Otherwise fall
            back to the client-side data fetcher (keeps current behavior).
          */}
          {initialStats ? (
            <StatsStatic
              campuses={initialStats.campuses ?? '0'}
              programs={initialStats.programs ?? '0'}
              scholarships={initialStats.scholarships ?? '0'}
              styles={styles as unknown as React.CSSProperties}
            />
          ) : (
            <StatsDataFetcher
              styles={styles as unknown as React.CSSProperties}
            />
          )}
        </Box>
      </Container>

      {/* Footer Banner */}
      <FooterBanner styles={styles} />
    </Box>
  );
};

export default HeroSection;
