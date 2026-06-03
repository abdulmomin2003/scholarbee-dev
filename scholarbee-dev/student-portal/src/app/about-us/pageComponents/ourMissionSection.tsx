import Tag from '@/components/atoms/tag';
import { Box, Container, Stack } from '@mui/material';
import React from 'react';
import likeIcon from '@public/assets/svg/like.svg';
import { CustomTypography } from '@/components/atoms/customTypography';

const OurMissionSection = () => {
  return (
    <Box>
      <Container sx={styles.root}>
        <Stack spacing={2}>
          <Tag alignSelf="center" bgWhite icon={likeIcon} title="Our Mission" />
          <CustomTypography
            variant="h6"
            fontSize={32}
            smallFont={24}
            fontWeight={700}
            smallWeight={600}
          >
            Facilitating Access to Education and Scholarships Worldwide
          </CustomTypography>
          <CustomTypography variant="body1" fontSize={20} smallFont={14}>
            Rewarding Eco-Friendly Actions for a Greener Future
          </CustomTypography>
          <CustomTypography fontSize={20} smallFont={14}>
            At Scholarbee, our mission is to empower students by connecting them
            with top educational opportunities globally. We aim to make higher
            education accessible and affordable for all, providing resources,
            information, and support. Through scholarships, academic programs,
            and a vibrant community, we help students achieve their academic and
            career goals, fostering a global network of impactful scholars.
          </CustomTypography>
          {/* <Button
            sx={{ px: 4, py: 2, alignSelf: 'center' }}
            variant="contained"
          >
            Join Us Now
          </Button> */}
        </Stack>
      </Container>
    </Box>
  );
};

export default OurMissionSection;

const styles = {
  root: {
    borderRadius: '20px',
    textAlign: 'center',
    gap: 1.25,
    mt: 3,
    backgroundColor: '#f4f7ff',
    py: { xs: 4, md: 6, lg: 10 },
    px: { xs: 2, md: 10, lg: 20 }
  }
};
