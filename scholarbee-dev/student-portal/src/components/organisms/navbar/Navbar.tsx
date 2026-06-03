import React from 'react';
import Box from '@mui/material/Box';
import { classes } from './styles';
import NavUserActions from './NavUserActions';
import MobileDrawer from './MobileDrawer';
import NavbarWrapper from './NavbarWrapper';
import NavLogo from './NavLogo';
import NavLinks from './NavLinks';

interface Props {
  readonly window?: () => Window;
  isCritical?: boolean;
}

export default function Navbar(props: Readonly<Props>) {
  const { window, isCritical = true } = props;

  return (
    <NavbarWrapper window={window} isCritical={isCritical}>
      <Box sx={classes.navContainer}>
        <NavLogo />

        <Box
          sx={{
            ...classes.navLinks,
            display: { xs: 'none', md: 'flex' }
          }}
          data-test-id="desktop-nav"
        >
          <NavLinks />
        </Box>

        <Box display="flex" alignItems="center">
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <NavUserActions isCritical={isCritical} />
          </Box>

          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <NavUserActions isCritical={isCritical} showMobileSignup />
          </Box>
          <MobileDrawer window={window} isCritical={isCritical} />
        </Box>
      </Box>
    </NavbarWrapper>
  );
}
