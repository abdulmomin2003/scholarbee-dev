import Tag from '@/components/atoms/tag';
import { Box, Typography } from '@mui/material';
import React from 'react';
import likeIcon from '@public/assets/svg/like-tag.svg';
import illustration from '@public/assets/svg/growth-illustration.svg';
import Image from 'next/image';
const SustainGrowthSection = () => {
  return (
    <Box bgcolor="#F4F9FF" sx={styles.root} gap={5}>
      <Tag
        sx={{ boxShadow: '0px 1px 15px 0px rgba(0, 0, 0, 0.05)' }}
        bgWhite
        icon={likeIcon}
        title="Sustained Growth"
      />
      <Image
        src={illustration}
        alt="growth illustration"
        width={500}
        height={336}
        style={styles.illustrationImage}
      />
      <Typography maxWidth={1080}>
        Over the past few years, Scholarbee has experienced remarkable growth,
        consistently achieving double-digit expansion in our services, user
        base, and global presence. This growth underscores the strength of our
        platform and the unwavering commitment of our team to redefine
        possibilities in the education sector.
        <br /> Through our relentless dedication to excellence and a
        student-centric approach, Scholarbee continues to raise the bar in the
        field of educational platforms, ensuring that students worldwide are
        equipped with the tools and resources they need to thrive in the digital
        age.
      </Typography>
    </Box>
  );
};

export default SustainGrowthSection;

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    py: { xs: 5, md: 7, lg: 10 },
    px: 5,
    textAlign: 'center'
  },
  illustrationImage: {
    maxWidth: 500,
    width: '100%',
    height: 'auto',
    borderRadius: '16px'
  }
};
