import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';
import outStoryImage from '@public/assets/png/ourStory.png';
import Tag from '@/components/atoms/tag';
import likeIcon from '@public/assets/svg/like-shapes.svg';
import { CustomTypography } from '@/components/atoms/customTypography';

const OurStorySection = () => {
  return (
    <Box sx={{ py: 5 }}>
      <Container>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }} order={{ xs: 1, sm: 2, md: 1 }}>
            <Image
              src={outStoryImage}
              alt="Our Story"
              width={474}
              height={516}
              style={{ width: '100%', height: 'auto', borderRadius: '16px' }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }} order={{ xs: 2, sm: 1, md: 2 }}>
            <Stack
              spacing={2}
              sx={{ textAlign: { xs: 'center', sm: 'start' } }}
            >
              <Tag
                sx={{
                  alignSelf: { xs: 'center', sm: 'flex-start' }
                }}
                icon={likeIcon}
                title="Our Story"
              />
              <CustomTypography
                variant="h4"
                fontSize={32}
                smallFont={24}
                fontWeight={700}
                smallWeight={600}
              >
                Discover Our Journey
              </CustomTypography>
              <Typography>
                Scholarbee was created to bridge the gap between students and
                global educational opportunities.
                <br />
                <br /> Our founders, passionate educators and tech enthusiasts,
                recognized the challenges students face in finding and securing
                scholarships and academic programs.
                <br />
                <br /> Starting as a small team, we built a comprehensive
                database of scholarships and programs, using advanced search
                algorithms to match students with opportunities tailored to
                their needs.
                <br />
                <br /> Today, Scholarbee is a thriving community dedicated to
                making education accessible to all.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default OurStorySection;
