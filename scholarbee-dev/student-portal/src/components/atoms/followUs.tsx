import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';
import facebookIcon from '@public/assets/svg/facebookBlue.svg';
import instagramIcon from '@public/assets/svg/instagramBlue.svg';
// import twitterIcon from '@public/assets/svg/twitterBlue.svg';
import linkedInIcon from '@public/assets/svg/linkedinBlue.svg';
import Link from 'next/link';

const FollowUs = () => {
  return (
    <Box gap={2} sx={styles.socialMedia} data-test-id="follow-us">
      <Typography color="primary" variant="body2" data-test-id="follow-us-text">
        FOLLOW US
      </Typography>
      <Box sx={styles.socialIcons} data-test-id="social-icons">
        <Link
          href="https://www.facebook.com/profile.php?id=61565762532814"
          passHref
          target="_blank"
          rel="noopener noreferrer"
          data-test-id="facebook-link"
        >
          <Image src={facebookIcon} alt="facebook" />
        </Link>
        {/* <Link href="#" data-test-id="twitter-link">
          <Image src={twitterIcon} alt="twitter" />
        </Link> */}
        <Link
          href="https://www.instagram.com/scholarbee.ai/"
          passHref
          target="_blank"
          rel="noopener noreferrer"
          data-test-id="instagram-link"
        >
          <Image src={instagramIcon} alt="instagram" />
        </Link>
        <Link
          href="https://www.linkedin.com/company/scholarbee/"
          passHref
          target="_blank"
          rel="noopener noreferrer"
          data-test-id="linkedin-link"
        >
          <Image src={linkedInIcon} alt="linkedin" />
        </Link>
      </Box>
    </Box>
  );
};

export default FollowUs;

const styles = {
  socialMedia: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: { xs: 'center', sm: 'flex-start' },
    mt: 2
  },
  socialIcons: {
    display: 'flex',
    gap: 2
  }
};
