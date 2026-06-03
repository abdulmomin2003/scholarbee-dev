import { Box } from '@mui/material';
import Link from 'next/link';
import React from 'react';
import logo from '@public/assets/svg/logo.svg';
import Image from 'next/image';

const AuthNav = () => {
  return (
    <Box
      sx={{
        paddingY: 2.2,
        paddingX: 5.5,
        display: { xs: 'block', sm: 'none', md: 'block' }
      }}
      data-test-id="auth-nav-box"
    >
      <Link
        href="/"
        style={{ textDecoration: 'none' }}
        data-test-id="auth-nav-link"
      >
        <Box sx={{ px: { xs: 2, sm: 5 }, py: 2 }}>
          <Image src={logo} height={44} width={235} alt="logo" />
        </Box>
      </Link>
    </Box>
  );
};

export default AuthNav;
