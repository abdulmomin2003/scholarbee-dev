'use client';
import React from 'react';
import bgTexture from '@public/assets/png/bg-tecture.png';
import dotsImage from '@public/assets/svg/dots.svg';
import dottedBg from '@public/assets/svg/dotted-bg.svg';
import Image from 'next/image';
import { Box, Container, Grid, Typography } from '@mui/material';
import {
  useGetCampusesCountQuery,
  useGetAdmissionProgramsCountQuery,
  useGetScholarshipsCountQuery
} from '@/redux/api/statsApi';

const StatsSection = ({ dotted }: { dotted?: boolean }) => {
  const { data: campusesCount } = useGetCampusesCountQuery();
  const { data: admissionProgramsCount } = useGetAdmissionProgramsCountQuery();
  const { data: scholarshipsCount } = useGetScholarshipsCountQuery();

  const targetStats = {
    campuses: campusesCount?.total_campuses_count ?? '0',
    programs: admissionProgramsCount?.total_admission_programs_count ?? '0',
    scholarships: scholarshipsCount?.total_scholarships_count ?? '0'
  };

  const updatedStats = [
    {
      title: 'Institutes',
      value: targetStats.campuses !== '0' ? `${targetStats.campuses}+` : '0+'
    },
    {
      title: 'Programs',
      value: targetStats.programs !== '0' ? `${targetStats.programs}+` : '0+'
    },
    {
      title: 'Scholarships',
      value:
        targetStats.scholarships !== '0' ? `${targetStats.scholarships}+` : '0+'
    }
  ];

  return (
    <Box
      sx={{
        ...styles.section,
        backgroundImage: `url(${dotted ? dottedBg.src : bgTexture.src})`,
        backgroundColor: dotted ? 'transparent' : '#004ae0',
        py: {
          xs: 5,
          md: 10
        }
      }}
      overflow="hidden"
    >
      {!dotted && (
        <Box sx={styles.topDots}>
          <Image
            src={dotsImage.src}
            alt="bgTexture"
            className="dots"
            height={50}
            width={50}
          />
        </Box>
      )}

      <Container>
        <Grid container spacing={4} justifyContent="center">
          {updatedStats.map((stat) => (
            <Grid key={stat.title} size={{ xs: 6, md: 4 }}>
              <StatItem
                dotted={dotted}
                number={stat.value}
                label={stat.title}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {!dotted && (
        <Box sx={styles.bottomDots}>
          <Image
            src={dotsImage.src}
            alt="bgTexture"
            className="dots"
            height={50}
            width={50}
          />
        </Box>
      )}
    </Box>
  );
};

export default StatsSection;

const StatItem = ({
  number,
  label,
  dotted
}: {
  number: string;
  label: string;
  dotted?: boolean;
}) => (
  <Box color={dotted ? 'inherit' : 'white'}>
    <Typography textAlign="center" fontWeight="bold" variant="h2">
      {number}
    </Typography>
    <Typography variant="h6" textAlign="center">
      {label}
    </Typography>
  </Box>
);

const styles = {
  section: {
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    position: 'relative'
  },
  topDots: {
    position: 'absolute',
    top: 10,
    left: 10,
    display: { xs: 'none', sm: 'block' }
  },
  bottomDots: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    display: { xs: 'none', sm: 'block' }
  }
};
