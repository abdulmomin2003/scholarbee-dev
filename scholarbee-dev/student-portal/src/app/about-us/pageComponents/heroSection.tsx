import { Box, Container, Stack } from '@mui/material';
import React from 'react';
import likeIcon from '@public/assets/svg/like.svg';
import Tag from '@/components/atoms/tag';
import Title from '@/components/atoms/title';
import { CustomTypography } from '@/components/atoms/customTypography';
import FollowUs from '@/components/atoms/followUs';

const HeroSection = () => {
  return (
    <Box>
      <Container sx={{ textAlign: 'center', py: 1 }}>
        <Stack alignItems="center" spacing={2}>
          <Tag
            sx={{ boxShadow: '0px 1px 15px 0px rgba(0, 0, 0, 0.05)' }}
            alignSelf="center"
            bgWhite
            icon={likeIcon}
            title="Our Mission"
          />
          <Title title="Empowering Your Academic Journey" />
          <CustomTypography variant="body1" fontSize={20} smallFont={14}>
            Connecting Students with Global Opportunities
          </CustomTypography>
          {/* <Button
            sx={{ p: '14px 32px', alignSelf: 'center', mt: 5 }}
            variant="contained"
          >
            Join Us
          </Button> */}
          <FollowUs />
        </Stack>
      </Container>
    </Box>
  );
};

export default HeroSection;
