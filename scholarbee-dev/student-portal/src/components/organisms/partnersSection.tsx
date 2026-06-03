import Tag from '@/components/atoms/tag';
import heartCircleIcon from '@public/assets/svg/heart-circle.svg';
import { Box, Container, Typography } from '@mui/material';
import LogoSlider from './logoSlider';

import partner1 from '@public/assets/svg/partner1.svg';
import partner2 from '@public/assets/svg/partner2.svg';
// import partner3 from '@public/assets/svg/partner3.svg';
import partner4 from '@public/assets/svg/partner4.svg';
import partner5 from '@public/assets/svg/partner5.svg';
import partner6 from '@public/assets/svg/partner6.svg';
import partner7 from '@public/assets/svg/partner7.svg';
import partner8 from '@public/assets/svg/partner8.svg';
import partner9 from '@public/assets/svg/partner9.svg';
import partner10 from '@public/assets/svg/partner10.svg';
import partner11 from '@public/assets/svg/partner11.svg';
import partner12 from '@public/assets/svg/partner12.svg';
import partner13 from '@public/assets/svg/partner13.svg';
import partner14 from '@public/assets/svg/partner14.svg';
import partner15 from '@public/assets/svg/partner15.svg';

const PARTNERS = [
  { src: partner1 },
  { src: partner2 },
  // { src: partner3 },
  { src: partner4 },
  { src: partner5 },
  { src: partner6 },
  { src: partner7 },
  { src: partner8 },
  { src: partner9 },
  { src: partner10 },
  { src: partner11 },
  { src: partner12 },
  { src: partner13 },
  { src: partner14 },
  { src: partner15 }
];

const styles = {
  root: {
    background: 'white',
    py: {
      xs: 3,
      md: 5
    }
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  title: {
    fontWeight: 600,
    textAlign: 'center',
    mt: 3
  }
};

const PartnersSection = async ({ ...props }) => {
  return (
    <Box {...props} sx={styles.root}>
      <Container>
        <Box sx={styles.headerContainer}>
          <Tag icon={heartCircleIcon} title="Our Partners" />
          <Typography component="h2" variant="h2" sx={styles.title}>
            Our University Partners
          </Typography>
        </Box>

        <LogoSlider partners={PARTNERS} />
      </Container>
    </Box>
  );
};

export default PartnersSection;
