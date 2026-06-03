/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sticky from 'react-sticky-el';
import { motion } from 'framer-motion';
import AppBar from '@mui/material/AppBar';
import { classes } from './styles';

interface NavbarWrapperProps {
  children: React.ReactNode;
  readonly window?: () => Window;
  isCritical?: boolean;
}

export default function NavbarWrapper({
  children,
  window,
  isCritical = true
}: NavbarWrapperProps) {
  const [isSticky, setIsSticky] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <AppBar
      component="nav"
      sx={{
        ...classes.root,
        position: isLandingPage ? 'absolute' : 'relative',
        backgroundColor: isLandingPage ? 'transparent' : 'white'
      }}
      data-test-id="app-bar"
    >
      <Sticky
        topOffset={0}
        onFixedToggle={(isFixed) => setIsSticky(isFixed)}
        stickyStyle={classes.sticky}
      >
        <motion.div
          animate={{
            scale: isSticky ? 0.98 : 1
          }}
          transition={{
            duration: 0.3,
            ease: 'easeOut'
          }}
        >
          {children}
        </motion.div>
      </Sticky>
    </AppBar>
  );
}
